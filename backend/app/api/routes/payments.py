from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment

router = APIRouter()

@router.get("/")
def get_payments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(Payment.club_id == current_user.club_id).all()
    return payments

@router.post("/")
def create_payment(payment_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = Payment(**payment_data, club_id=current_user.club_id, recorded_by=current_user.id)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
