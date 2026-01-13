from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.message import Message

router = APIRouter()

@router.get("/")
def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.club_id == current_user.club_id).all()
    return messages

@router.post("/")
def create_message(message_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    message = Message(**message_data, club_id=current_user.club_id, sent_by=current_user.id)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
