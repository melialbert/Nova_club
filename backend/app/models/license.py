from sqlalchemy import Column, String, ForeignKey, Date, Numeric, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class LicenseStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    PENDING = "pending"

class License(BaseModel):
    __tablename__ = "licenses"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("members.id"), nullable=False)
    license_number = Column(String(100), nullable=True)
    season = Column(String(20), nullable=False)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(LicenseStatus), default=LicenseStatus.ACTIVE, nullable=False)

    member = relationship("Member", back_populates="licenses")
