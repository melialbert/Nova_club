from sqlalchemy import Column, String, ForeignKey, Date, Numeric, Enum, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class TransactionCategory(str, enum.Enum):
    MEMBERSHIP_FEE = "membership_fee"
    EQUIPMENT_SALE = "equipment_sale"
    LICENSE_FEE = "license_fee"
    SUBSIDY = "subsidy"
    DONATION = "donation"
    RENT = "rent"
    UTILITIES = "utilities"
    EQUIPMENT_PURCHASE = "equipment_purchase"
    SALARY = "salary"
    INSURANCE = "insurance"
    OTHER = "other"

class Transaction(BaseModel):
    __tablename__ = "transactions"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    category = Column(Enum(TransactionCategory), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    reference = Column(String(100), nullable=True)
    recorded_by = Column(String(36), ForeignKey("users.id"), nullable=True)

    club = relationship("Club", back_populates="transactions")
