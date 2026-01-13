from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter()

@router.get("/")
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.club_id == current_user.club_id).all()
    return transactions

@router.post("/")
def create_transaction(transaction_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transaction = Transaction(**transaction_data, club_id=current_user.club_id, recorded_by=current_user.id)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
