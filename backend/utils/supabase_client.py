"""
Supabase Client Configuration
Provides database connection and authentication
"""
from supabase import create_client, Client
import os
from functools import lru_cache

@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Get Supabase client (cached for reuse)
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    return create_client(url, key)

def get_supabase() -> Client:
    """
    Dependency function for FastAPI
    """
    return get_supabase_client()
