from sqlalchemy import Column, String, Boolean, Date, Enum, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class MemberStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    INACTIVE = "inactive"

class MemberCategory(str, enum.Enum):
    MINI_POUSSIN = "mini_poussin"
    POUSSIN = "poussin"
    BENJAMIN = "benjamin"
    MINIME = "minime"
    CADET = "cadet"
    JUNIOR = "junior"
    SENIOR = "senior"
    VETERAN = "veteran"

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"

class Discipline(str, enum.Enum):
    JUDO = "judo"
    JU_JITSU = "ju_jitsu"
    TAISO = "taiso"

class Member(BaseModel):
    __tablename__ = "members"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    parent_name = Column(String(200), nullable=True)
    parent_phone = Column(String(20), nullable=True)
    parent_email = Column(String(100), nullable=True)

    category = Column(Enum(MemberCategory), nullable=False)
    discipline = Column(Enum(Discipline), default=Discipline.JUDO, nullable=False)
    belt_level = Column(String(50), default="white", nullable=False)
    status = Column(Enum(MemberStatus), default=MemberStatus.ACTIVE, nullable=False)

    medical_certificate_url = Column(String(500), nullable=True)
    medical_certificate_expiry = Column(Date, nullable=True)

    monthly_fee = Column(Numeric(15, 2), nullable=False)
    registration_fee = Column(Numeric(15, 2), nullable=True)
    has_discount = Column(Boolean, default=False)
    discount_percentage = Column(Numeric(5, 2), default=0)

    registration_date = Column(Date, nullable=False)
    last_renewal_date = Column(Date, nullable=True)

    club = relationship("Club", back_populates="members")
    payments = relationship("Payment", back_populates="member", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="member", cascade="all, delete-orphan")
    licenses = relationship("License", back_populates="member", cascade="all, delete-orphan")
    equipment_purchases = relationship("EquipmentPurchase", back_populates="member", cascade="all, delete-orphan")
