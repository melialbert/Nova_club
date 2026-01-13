from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.equipment import Equipment, EquipmentPurchase

router = APIRouter()

@router.get("/")
def get_equipment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    equipment = db.query(Equipment).filter(Equipment.club_id == current_user.club_id).all()
    return equipment

@router.post("/")
def create_equipment(equipment_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    equipment = Equipment(**equipment_data, club_id=current_user.club_id)
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment

@router.get("/purchases")
def get_purchases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    purchases = db.query(EquipmentPurchase).filter(EquipmentPurchase.club_id == current_user.club_id).all()
    return purchases

@router.post("/purchases")
def create_purchase(purchase_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    purchase = EquipmentPurchase(**purchase_data, club_id=current_user.club_id)
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase
