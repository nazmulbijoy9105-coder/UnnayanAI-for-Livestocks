from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="UnnayanAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Online", "message": "UnnayanAI Smart Dairy Engine is running"}

@app.post("/farmers/cattle/", response_model=schemas.Cattle)
def create_cattle(cattle: schemas.CattleCreate, db: Session = Depends(database.get_db)):
    db_cattle = models.Cattle(**cattle.model_dump())
    db.add(db_cattle)
    db.commit()
    db.refresh(db_cattle)
    return db_cattle

@app.get("/admin/cattle/", response_model=List[schemas.Cattle])
def read_all_cattle(db: Session = Depends(database.get_db)):
    return db.query(models.Cattle).all()

@app.get("/ai/alert/{cow_id}")
def get_health_alert(cow_id: int, lang: str = "en"):
    alerts = {
        "en": "Cow ID {id}: Health is stable. Milk yield up by 5%.",
        "bn": "গরু আইডি {id}: স্বাস্থ্য স্থিতিশীল। দুধের উৎপাদন ৫% বেড়েছে।"
    }
    return {"alert": alerts.get(lang, alerts["en"]).format(id=cow_id)}
