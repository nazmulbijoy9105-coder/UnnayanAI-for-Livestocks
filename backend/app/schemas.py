from pydantic import BaseModel
from typing import Optional

class CattleBase(BaseModel):
    tag_id: str
    animal_type: str
    health_status: Optional[str] = "Healthy"
    milk_yield: Optional[float] = 0.0

class CattleCreate(CattleBase):
    pass

class Cattle(CattleBase):
    id: int
    class Config:
        from_attributes = True
