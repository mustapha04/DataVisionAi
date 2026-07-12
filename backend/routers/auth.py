from fastapi import APIRouter, HTTPException, Depends
from core.config import settings
from core.dependencies import get_current_user
import httpx

router = APIRouter()


@router.post("/auth/register")
async def register(email: str, password: str):
    url = f"{settings.supabase_url}/auth/v1/signup"
    headers = {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json={"email": email, "password": password}, headers=headers)
    if resp.status_code != 200:
        detail = resp.json().get("msg", "Registration failed")
        raise HTTPException(status_code=resp.status_code, detail=detail)
    return resp.json()


@router.post("/auth/login")
async def login(email: str, password: str):
    url = f"{settings.supabase_url}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": settings.supabase_anon_key,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json={"email": email, "password": password}, headers=headers)
    if resp.status_code != 200:
        detail = resp.json().get("msg", "Login failed")
        raise HTTPException(status_code=resp.status_code, detail=detail)
    return resp.json()


@router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "created_at": user.get("created_at"),
    }
