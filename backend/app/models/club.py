from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Club(BaseModel):
    __tablename__ = "clubs"

    name = Column(String(200), nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="club", cascade="all, delete-orphan")
    members = relationship("Member", back_populates="club", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="club", cascade="all, delete-orphan")
    equipment_catalog = relationship("Equipment", back_populates="club", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="club", cascade="all, delete-orphan")
