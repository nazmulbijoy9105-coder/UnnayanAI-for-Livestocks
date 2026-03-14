from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base

class Cattle(Base):
    __tablename__ = "cattle"
    id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(String, unique=True, index=True)
    animal_type = Column(String)
    health_status = Column(String, default="Healthy")
    milk_yield = Column(Float, default=0.0)

class AlertLog(Base):
    __tablename__ = "alert_logs"
    id = Column(Integer, primary_key=True, index=True)
    cow_id = Column(Integer)
    message_en = Column(Text)
    message_bn = Column(Text)
