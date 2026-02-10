"""
Security utilities for authentication and authorization
"""
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from .supabase_client import get_supabase

security = HTTPBearer()

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
JWT_ALGORITHM = "HS256"

def verify_token(token: str) -> Dict:
    """
    Verify JWT token from Supabase
    Returns decoded token payload
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict:
    """
    Get current authenticated user
    FastAPI dependency for protected routes
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Get user profile from database
    supabase = get_supabase()
    response = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return response.data

def require_plan(required_plans: list):
    """
    Decorator to require specific subscription plans
    Usage: @require_plan(['pro', 'business'])
    """
    def decorator(func):
        async def wrapper(*args, user: Dict = None, **kwargs):
            if user is None:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if user.get("plan") not in required_plans:
                raise HTTPException(
                    status_code=403,
                    detail=f"This feature requires {' or '.join(required_plans)} plan"
                )
            
            return await func(*args, user=user, **kwargs)
        return wrapper
    return decorator
