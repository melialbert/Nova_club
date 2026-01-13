from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class ClubUpdate(BaseModel):
    name: str
    city: str | None = None
    slogan: str | None = None
    logo_url: str | None = None

@router.get("/my-club")
def get_my_club(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "id": str(current_user.club.id),
        "club_name": current_user.club.name,
        "city": current_user.club.city,
        "slogan": current_user.club.slogan,
        "logo": current_user.club.logo_url,
        "is_active": current_user.club.is_active
    }

@router.put("/my-club")
def update_my_club(
    club_data: ClubUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    club = current_user.club
    club.name = club_data.name
    club.city = club_data.city
    club.slogan = club_data.slogan
    club.logo_url = club_data.logo_url

    db.commit()
    db.refresh(club)

    return {
        "id": str(club.id),
        "club_name": club.name,
        "city": club.city,
        "slogan": club.slogan,
        "logo": club.logo_url,
        "is_active": club.is_active
    }
