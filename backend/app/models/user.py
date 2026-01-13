from sqlalchemy import Column, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SECRETARY = "SECRETARY"
    COACH = "COACH"

class User(BaseModel):
    __tablename__ = "users"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.SECRETARY, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    club = relationship("Club", back_populates="users")
