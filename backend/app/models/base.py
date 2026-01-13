from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from app.db.base import Base
import uuid

class BaseModel(Base):
    __abstract__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    device_id = Column(String(100), nullable=True)
    sync_version = Column(Integer, default=1, nullable=False)
