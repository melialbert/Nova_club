from sqlalchemy import Column, String, ForeignKey, Date, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Attendance(BaseModel):
    __tablename__ = "attendances"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("members.id"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    is_present = Column(Boolean, default=True, nullable=False)
    recorded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)

    member = relationship("Member", back_populates="attendances")
