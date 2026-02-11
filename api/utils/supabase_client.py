"""
Supabase Client Configuration
Provides database connection and authentication
"""
from supabase import create_client, Client
import os
from functools import lru_cache
from config import get_settings

@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Get Supabase client (cached for reuse)
    """
    settings = get_settings()
    
    if not settings.supabase_url or not settings.supabase_service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    return create_client(settings.supabase_url, settings.supabase_service_key)

def get_supabase() -> Client:
    """
    Dependency function for FastAPI
    """
    return get_supabase_client()
