"""
UnnayanAI Auth Router - PostgreSQL version
Handles signup, login, token verification for all 5 user roles
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4
import hashlib
import hmac
import base64
import json
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET", "unnayan-ai-secret-change-in-production")
DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_engine():
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database not configured")
    return create_engine(DATABASE_URL)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token(payload: dict) -> str:
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "HS256", "typ": "JWT"}).encode()
    ).decode().rstrip("=")
    body = base64.urlsafe_b64encode(
        json.dumps(payload).encode()
    ).decode().rstrip("=")
    sig_input = f"{header}.{body}"
    sig = hmac.new(SECRET_KEY.encode(), sig_input.encode(), hashlib.sha256).hexdigest()
    return f"{header}.{body}.{sig}"

def verify_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token")
        header, body, sig = parts
        sig_input = f"{header}.{body}"
        expected = hmac.new(SECRET_KEY.encode(), sig_input.encode(), hashlib.sha256).hexdigest()
        if sig != expected:
            raise ValueError("Invalid signature")
        padding = 4 - len(body) % 4
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * padding))
        if payload.get("exp", 0) < datetime.utcnow().timestamp():
            raise ValueError("Token expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_token(credentials.credentials)

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    phone: Optional[str] = None
    organization: Optional[str] = None
    district: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

VALID_ROLES = ["farmer", "ngo", "mfi", "investor", "admin"]

@router.post("/signup")
def signup(req: SignupRequest):
    if req.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {VALID_ROLES}")
    engine = get_engine()
    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": req.email}
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user_id = str(uuid4())
        status = "pending" if req.role == "ngo" else "active"
        conn.execute(text("""
            INSERT INTO users (id, name, email, password_hash, role, phone, organization, district, status)
            VALUES (:id, :name, :email, :password_hash, :role, :phone, :organization, :district, :status)
        """), {
            "id": user_id, "name": req.name, "email": req.email,
            "password_hash": hash_password(req.password), "role": req.role,
            "phone": req.phone, "organization": req.organization,
            "district": req.district, "status": status
        })
        conn.execute(text("""
            INSERT INTO audit_logs (id, user_id, action, detail)
            VALUES (:id, :user_id, :action, :detail)
        """), {
            "id": str(uuid4()), "user_id": user_id,
            "action": "USER_SIGNUP", "detail": f"New {req.role} registered: {req.email}"
        })
        conn.commit()
    exp = (datetime.utcnow() + timedelta(days=7)).timestamp()
    token = make_token({"sub": user_id, "email": req.email, "role": req.role, "exp": exp})
    return {
        "token": token,
        "user": {"id": user_id, "name": req.name, "email": req.email,
                 "role": req.role, "phone": req.phone, "organization": req.organization,
                 "district": req.district, "status": status},
        "message": f"Welcome to UnnayanAI, {req.name}!"
    }

@router.post("/login")
def login(req: LoginRequest):
    engine = get_engine()
    with engine.connect() as conn:
        user = conn.execute(
            text("SELECT * FROM users WHERE email = :email"),
            {"email": req.email}
        ).fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if user.password_hash != hash_password(req.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        conn.execute(text("""
            INSERT INTO audit_logs (id, user_id, action, detail)
            VALUES (:id, :user_id, :action, :detail)
        """), {
            "id": str(uuid4()), "user_id": user.id,
            "action": "USER_LOGIN", "detail": f"{user.role} logged in: {req.email}"
        })
        conn.commit()
    exp = (datetime.utcnow() + timedelta(days=7)).timestamp()
    token = make_token({"sub": user.id, "email": req.email, "role": user.role, "exp": exp})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email,
                 "role": user.role, "phone": user.phone, "organization": user.organization,
                 "district": user.district, "status": user.status},
        "message": f"Welcome back, {user.name}!"
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    engine = get_engine()
    with engine.connect() as conn:
        user = conn.execute(
            text("SELECT * FROM users WHERE email = :email"),
            {"email": current_user["email"]}
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user.id, "name": user.name, "email": user.email,
                "role": user.role, "phone": user.phone, "organization": user.organization,
                "district": user.district, "status": user.status}

@router.get("/users")
def list_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    engine = get_engine()
    with engine.connect() as conn:
        users = conn.execute(text(
            "SELECT id, name, email, role, phone, organization, district, status, created_at FROM users ORDER BY created_at DESC"
        )).fetchall()
        return [dict(u._mapping) for u in users]

@router.get("/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    engine = get_engine()
    with engine.connect() as conn:
        total = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        by_role = conn.execute(text(
            "SELECT role, COUNT(*) as count FROM users GROUP BY role"
        )).fetchall()
        return {
            "total_users": total,
            "by_role": {r.role: r.count for r in by_role}
        }
