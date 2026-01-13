from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.attendance import Attendance

router = APIRouter()

@router.get("/")
def get_attendances(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attendances = db.query(Attendance).filter(Attendance.club_id == current_user.club_id).all()
    return attendances

@router.post("/")
def create_attendance(attendance_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attendance = Attendance(**attendance_data, club_id=current_user.club_id, recorded_by=current_user.id)
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance
