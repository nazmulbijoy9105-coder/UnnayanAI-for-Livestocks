"""
UnnayanAI Backend - Main FastAPI Application
Smart Dairy AI & IoT Platform for Bangladesh
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth

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

@app.get("/")
def root():
    return {"status": "UnnayanAI API running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
