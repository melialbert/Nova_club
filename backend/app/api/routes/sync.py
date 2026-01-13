from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models import Member, Payment, License, Equipment, EquipmentPurchase, Attendance, Transaction, Message

router = APIRouter()

MODEL_MAP = {
    "members": Member,
    "payments": Payment,
    "licenses": License,
    "equipment": Equipment,
    "equipment_purchases": EquipmentPurchase,
    "attendances": Attendance,
    "transactions": Transaction,
    "messages": Message,
}

@router.post("/pull")
def pull_changes(
    last_sync: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    changes = {}

    for entity_name, model_class in MODEL_MAP.items():
        last_sync_time = last_sync.get(entity_name)

        query = db.query(model_class).filter(model_class.club_id == current_user.club_id)

        if last_sync_time:
            try:
                sync_datetime = datetime.fromisoformat(last_sync_time)
                query = query.filter(model_class.updated_at > sync_datetime)
            except ValueError:
                pass

        records = query.all()
        changes[entity_name] = [
            {
                "id": record.id,
                "data": {c.name: getattr(record, c.name) for c in record.__table__.columns},
                "updated_at": record.updated_at.isoformat()
            }
            for record in records
        ]

    return {
        "changes": changes,
        "sync_timestamp": datetime.utcnow().isoformat()
    }

@router.post("/push")
def push_changes(
    changes: Dict[str, List[Dict[str, Any]]],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = {"success": [], "errors": []}

    for entity_name, records in changes.items():
        if entity_name not in MODEL_MAP:
            continue

        model_class = MODEL_MAP[entity_name]

        for record_data in records:
            try:
                record_id = record_data.get("id")
                data = record_data.get("data", {})

                data["club_id"] = current_user.club_id

                existing = db.query(model_class).filter(model_class.id == record_id).first()

                if existing:
                    for key, value in data.items():
                        if key not in ["id", "created_at"]:
                            setattr(existing, key, value)
                    db.commit()
                    results["success"].append({"entity": entity_name, "id": record_id, "action": "updated"})
                else:
                    new_record = model_class(**data)
                    db.add(new_record)
                    db.commit()
                    results["success"].append({"entity": entity_name, "id": record_id, "action": "created"})

            except Exception as e:
                db.rollback()
                results["errors"].append({
                    "entity": entity_name,
                    "id": record_data.get("id"),
                    "error": str(e)
                })

    return {
        "results": results,
        "sync_timestamp": datetime.utcnow().isoformat()
    }
