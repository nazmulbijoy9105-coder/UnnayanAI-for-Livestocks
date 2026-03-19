"""
UnnayanAI Auth Router
Handles signup, login, and token verification for all 5 user roles:
farmer, ngo, mfi, investor, admin
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4
import hashlib
import hmac
import base64
import json
import os

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET", "unnayan-ai-secret-change-in-production")

VALID_ROLES = ["farmer", "ngo", "mfi", "investor", "admin"]

# In-memory user store (replace with DB later)
users_db = {}


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None
    organization: Optional[str] = None
    district: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict
    message: str


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
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_token(credentials.credentials)


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest):
    if req.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {VALID_ROLES}")
    if req.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid4())
    user = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "role": req.role,
        "phone": req.phone,
        "organization": req.organization,
        "district": req.district,
        "created_at": datetime.utcnow().isoformat(),
        "status": "active" if req.role != "ngo" else "pending",
    }
    users_db[req.email] = {
        **user,
        "password_hash": hash_password(req.password)
    }

    exp = (datetime.utcnow() + timedelta(days=7)).timestamp()
    token = make_token({"sub": user_id, "email": req.email, "role": req.role, "exp": exp})

    return AuthResponse(
        token=token,
        user=user,
        message=f"Welcome to UnnayanAI, {req.name}!"
    )


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user_data = users_db.get(req.email)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user_data["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = {k: v for k, v in user_data.items() if k != "password_hash"}
    exp = (datetime.utcnow() + timedelta(days=7)).timestamp()
    token = make_token({"sub": user["id"], "email": req.email, "role": user["role"], "exp": exp})

    return AuthResponse(
        token=token,
        user=user,
        message=f"Welcome back, {user['name']}!"
    )


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    user_data = users_db.get(email)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return {k: v for k, v in user_data.items() if k != "password_hash"}


@router.get("/users")
def list_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return [
        {k: v for k, v in u.items() if k != "password_hash"}
        for u in users_db.values()
    ]
