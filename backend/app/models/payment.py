from sqlalchemy import Column, String, ForeignKey, Date, Numeric, Enum, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    PENDING = "pending"
    LATE = "late"
    CANCELLED = "cancelled"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    MOBILE_MONEY = "mobile_money"
    BANK_TRANSFER = "bank_transfer"

class PaymentType(str, enum.Enum):
    MONTHLY_FEE = "monthly_fee"
    REGISTRATION = "registration"
    EQUIPMENT = "equipment"
    LICENSE = "license"
    OTHER = "other"

class Payment(BaseModel):
    __tablename__ = "payments"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("members.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_type = Column(Enum(PaymentType), nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH, nullable=False)
    payment_date = Column(Date, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PAID, nullable=False)
    month_year = Column(String(7), nullable=True)
    notes = Column(Text, nullable=True)
    receipt_number = Column(String(50), nullable=True)
    recorded_by = Column(String(36), ForeignKey("users.id"), nullable=True)

    member = relationship("Member", back_populates="payments")
