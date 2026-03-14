from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="UnnayanAI Smart Dairy Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Online", "engine": "Bun-Runtime", "message": "UnnayanAI is active"}

@app.get("/ai/alert/{cow_id}")
def get_alert(cow_id: int, lang: str = "en"):
    alerts = {
        "en": f"Cow {cow_id}: Health is stable.",
        "bn": f"গরু {cow_id}: স্বাস্থ্য স্থিতিশীল।"
    }
    return {"alert": alerts.get(lang, alerts["en"])}
