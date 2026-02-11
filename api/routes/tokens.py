"""
Token Endpoints
"""
from fastapi import APIRouter, Depends
from models.schemas import TokenBalanceResponse, TokenUsageResponse
from services.token_service import get_token_balance, get_usage_analytics
from utils.security import get_current_user
from typing import Dict

router = APIRouter()

@router.get("/balance", response_model=TokenBalanceResponse)
async def get_balance(user: Dict = Depends(get_current_user)):
    return await get_token_balance(user['id'])

@router.get("/usage", response_model=TokenUsageResponse)
async def get_usage(period: str = "month", user: Dict = Depends(get_current_user)):
    return await get_usage_analytics(user['id'], period)
