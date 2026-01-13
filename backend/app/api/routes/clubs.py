from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/my-club")
def get_my_club(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "id": current_user.club.id,
        "name": current_user.club.name,
        "address": current_user.club.address,
        "phone": current_user.club.phone,
        "email": current_user.club.email,
        "logo_url": current_user.club.logo_url
    }
