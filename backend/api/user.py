"""
User Profile Endpoints
"""
from fastapi import APIRouter, Depends
from models.schemas import UserProfile, UpdateProfileRequest
from utils.security import get_current_user
from utils.supabase_client import get_supabase
from typing import Dict

router = APIRouter()

@router.get("/profile", response_model=Dict)
async def get_profile(user: Dict = Depends(get_current_user)):
    # User is already fetched by get_current_user dependency
    return user

@router.patch("/profile")
async def update_profile(request: UpdateProfileRequest, user: Dict = Depends(get_current_user)):
    supabase = get_supabase()
    res = supabase.table("user_profiles").update(request.model_dump(exclude_unset=True)).eq("id", user['id']).execute()
    return res.data[0]
