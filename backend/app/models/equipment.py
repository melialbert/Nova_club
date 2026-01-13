from sqlalchemy import Column, String, ForeignKey, Date, Integer, Numeric, Enum, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class EquipmentType(str, enum.Enum):
    JUDOGI = "judogi"
    BELT = "belt"
    ZORI = "zori"
    BAG = "bag"
    PROTECTION = "protection"
    OTHER = "other"

class Equipment(BaseModel):
    __tablename__ = "equipment"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    name = Column(String(200), nullable=False)
    equipment_type = Column(Enum(EquipmentType), nullable=False)
    size = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)

    club = relationship("Club", back_populates="equipment_catalog")
    purchases = relationship("EquipmentPurchase", back_populates="equipment", cascade="all, delete-orphan")

class EquipmentPurchase(BaseModel):
    __tablename__ = "equipment_purchases"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("members.id"), nullable=False)
    equipment_id = Column(String(36), ForeignKey("equipment.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    purchase_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)

    member = relationship("Member", back_populates="equipment_purchases")
    equipment = relationship("Equipment", back_populates="purchases")
