from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.member import Member

router = APIRouter()

@router.get("/")
def get_members(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    members = db.query(Member).filter(Member.club_id == current_user.club_id).all()
    return members

@router.get("/{member_id}")
def get_member(member_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = db.query(Member).filter(
        Member.id == member_id,
        Member.club_id == current_user.club_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return member

@router.post("/")
def create_member(member_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = Member(**member_data, club_id=current_user.club_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.put("/{member_id}")
def update_member(member_id: str, member_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = db.query(Member).filter(
        Member.id == member_id,
        Member.club_id == current_user.club_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    for key, value in member_data.items():
        setattr(member, key, value)

    db.commit()
    db.refresh(member)
    return member

@router.delete("/{member_id}")
def delete_member(member_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = db.query(Member).filter(
        Member.id == member_id,
        Member.club_id == current_user.club_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}
