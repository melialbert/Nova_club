from sqlalchemy import Column, String, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class MessagePriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"

class Message(BaseModel):
    __tablename__ = "messages"

    club_id = Column(String(36), ForeignKey("clubs.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(Enum(MessagePriority), default=MessagePriority.NORMAL, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    sent_by = Column(String(36), ForeignKey("users.id"), nullable=True)

    club = relationship("Club", back_populates="messages")
