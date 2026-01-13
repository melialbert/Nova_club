from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Club(BaseModel):
    __tablename__ = "clubs"

    name = Column(String(200), nullable=False)
    city = Column(String(100), nullable=True)
    slogan = Column(String(500), nullable=True)
    logo_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="club", cascade="all, delete-orphan")
    members = relationship("Member", back_populates="club", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="club", cascade="all, delete-orphan")
    equipment_catalog = relationship("Equipment", back_populates="club", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="club", cascade="all, delete-orphan")
