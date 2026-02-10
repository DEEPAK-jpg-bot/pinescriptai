"""
Affiliate API
Endpoints for influencers to manage their referral codes and view earnings
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from pydantic import BaseModel
from utils.security import get_current_user
from utils.supabase_client import get_supabase
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

class InfluencerStats(BaseModel):
    referral_code: str
    total_earned: float
    total_paid: float
    referral_count: int
    commission_rate: float

class CommissionItem(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    referred_user_email: Optional[str] = None

@router.get("/stats", response_model=InfluencerStats)
async def get_influencer_stats(user: dict = Depends(get_current_user)):
    """
    Get stats for the current influencer
    """
    supabase = get_supabase()
    
    # Check if user is an influencer
    inf_res = supabase.table("influencers").select("*").eq("user_id", user['id']).execute()
    
    if not inf_res.data:
        raise HTTPException(status_code=403, detail="Not an influencer")
    
    influencer = inf_res.data[0]
    
    # Get referral count (number of commissions)
    comm_res = supabase.table("commissions").select("id", count="exact").eq("influencer_id", influencer['id']).execute()
    referral_count = comm_res.count if comm_res.count is not None else 0
    
    return {
        "referral_code": influencer['referral_code'],
        "total_earned": influencer['total_earned'],
        "total_paid": influencer['total_paid'],
        "referral_count": referral_count,
        "commission_rate": influencer['commission_rate_percent']
    }

@router.get("/commissions", response_model=List[CommissionItem])
async def get_commissions(user: dict = Depends(get_current_user)):
    """
    Get list of commissions for the current influencer
    """
    supabase = get_supabase()
    
    # Check if user is an influencer
    inf_res = supabase.table("influencers").select("id").eq("user_id", user['id']).execute()
    if not inf_res.data:
        raise HTTPException(status_code=403, detail="Not an influencer")
    
    influencer_id = inf_res.data[0]['id']
    
    # Get commissions
    comm_res = supabase.table("commissions").select("*").eq("influencer_id", influencer_id).order("created_at", desc=True).execute()
    
    return comm_res.data

@router.post("/register")
async def register_as_influencer(referral_code: str, user: dict = Depends(get_current_user)):
    """
    Register the current user as an influencer with a custom code
    """
    supabase = get_supabase()
    
    # Check if code already exists
    existing = supabase.table("influencers").select("id").eq("referral_code", referral_code).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Referral code already taken")
    
    # Check if user is already an influencer
    existing_inf = supabase.table("influencers").select("id").eq("user_id", user['id']).execute()
    if existing_inf.data:
        raise HTTPException(status_code=400, detail="You are already registered as an influencer")
    
    # Create influencer record
    inf_data = {
        "user_id": user['id'],
        "referral_code": referral_code,
        "commission_rate_percent": 10.0
    }
    
    res = supabase.table("influencers").insert(inf_data).execute()
    
    return {"message": "Successfully registered as influencer", "data": res.data[0]}
