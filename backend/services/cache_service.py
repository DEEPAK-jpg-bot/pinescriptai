"""
Caching Service using Upstash Redis
Caches common prompts to reduce AI API calls
"""
import os
from typing import Optional, Dict
from upstash_redis import Redis
from utils.helpers import hash_prompt
import json

# Initialize Upstash Redis
redis_client = None

def get_redis():
    """
    Get Redis client (lazy initialization)
    """
    global redis_client
    if redis_client is None:
        redis_url = os.getenv("UPSTASH_REDIS_URL")
        redis_token = os.getenv("UPSTASH_REDIS_TOKEN")
        
        if redis_url and redis_token:
            redis_client = Redis(url=redis_url, token=redis_token)
    
    return redis_client

async def get_cached_response(prompt: str) -> Optional[Dict]:
    """
    Get cached AI response for prompt
    Returns None if not cached
    """
    try:
        redis = get_redis()
        if not redis:
            return None
        
        cache_key = f"prompt:{hash_prompt(prompt)}"
        cached_data = redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        return None
    except Exception as e:
        print(f"Cache retrieval error: {e}")
        return None

async def cache_response(prompt: str, response: Dict, ttl: int = 86400) -> None:
    """
    Cache AI response
    TTL: 86400 seconds = 24 hours
    """
    try:
        redis = get_redis()
        if not redis:
            return
        
        cache_key = f"prompt:{hash_prompt(prompt)}"
        redis.setex(cache_key, ttl, json.dumps(response))
    
    except Exception as e:
        print(f"Cache storage error: {e}")

async def clear_user_cache(user_id: str) -> None:
    """
    Clear cache for specific user (if needed)
    """
    try:
        redis = get_redis()
        if not redis:
            return
        
        # Clear user-specific cache
        pattern = f"user:{user_id}:*"
        keys = redis.keys(pattern)
        
        if keys:
            redis.delete(*keys)
    
    except Exception as e:
        print(f"Cache clear error: {e}")
