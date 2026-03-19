"""
UnnayanAI Backend - Main FastAPI Application
Smart Dairy AI & IoT Platform for Bangladesh
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import os
from app.routers import auth

DATABASE_URL = os.getenv("DATABASE_URL", "")

app = FastAPI(
    title="UnnayanAI API",
    description="Smart Dairy AI & IoT Platform for Bangladesh",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.on_event("startup")
def startup():
    if not DATABASE_URL:
        print("WARNING: No DATABASE_URL set")
        return
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    email VARCHAR(200) UNIQUE NOT NULL,
                    password_hash VARCHAR(200) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    phone VARCHAR(50),
                    organization VARCHAR(200),
                    district VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS milk_logs (
                    id VARCHAR(36) PRIMARY KEY,
                    farmer_id VARCHAR(36) NOT NULL,
                    cow_id VARCHAR(100),
                    date DATE NOT NULL,
                    morning_yield FLOAT DEFAULT 0,
                    evening_yield FLOAT DEFAULT 0,
                    total_yield FLOAT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS cattle (
                    id VARCHAR(36) PRIMARY KEY,
                    farmer_id VARCHAR(36) NOT NULL,
                    cow_id VARCHAR(100),
                    breed VARCHAR(100),
                    age_months INTEGER,
                    weight_kg FLOAT,
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36),
                    action VARCHAR(200) NOT NULL,
                    detail TEXT,
                    ip_address VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Database startup error: {e}")

@app.get("/")
def root():
    return {"status": "UnnayanAI API running", "version": "1.0.0"}

@app.get("/health")
def health():
    db_status = "connected" if DATABASE_URL else "not configured"
    return {"status": "healthy", "database": db_status}
