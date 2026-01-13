from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.license import License

router = APIRouter()

@router.get("/")
def get_licenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    licenses = db.query(License).filter(License.club_id == current_user.club_id).all()
    return licenses

@router.post("/")
def create_license(license_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    license = License(**license_data, club_id=current_user.club_id)
    db.add(license)
    db.commit()
    db.refresh(license)
    return license
