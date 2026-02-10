"""
Rate limiting using Upstash Redis for distributed rate limiting
Prevents abuse and stays within Gemini API free tier limits
"""
from fastapi import HTTPException
from datetime import datetime
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

# Lazy Redis client initialization
_redis_client = None

def get_redis():
    """
    Get Redis client (lazy initialization)
    Returns None if Redis is not configured (fails back to in-memory only in development)
    """
    global _redis_client
    
    if _redis_client is not None:
        return _redis_client
    
    redis_url = os.getenv("UPSTASH_REDIS_URL")
    redis_token = os.getenv("UPSTASH_REDIS_TOKEN")
    is_production = os.getenv("ENVIRONMENT") == "production"
    
    if redis_url and redis_token:
        try:
            from upstash_redis import Redis
            _redis_client = Redis(url=redis_url, token=redis_token)
            logger.info("Redis rate limiter initialized")
            return _redis_client
        except Exception as e:
            if is_production:
                logger.error(f"CRITICAL: Failed to initialize Redis in production: {e}")
                raise RuntimeError("Service unavailable: Distributed cache failure")
            logger.warning(f"Failed to initialize Redis: {e}. Falling back to in-memory.")
            return None
    
    if is_production:
        logger.error("CRITICAL: Redis not configured in production. Rate limiting will be bypassed!")
        raise RuntimeError("Service configuration error: Redis required in production")
        
    return None


# Fallback in-memory storage (for local development without Redis)
_memory_storage = {}


def _get_key(key: str) -> Optional[int]:
    """Get value from Redis or memory"""
    redis = get_redis()
    if redis:
        try:
            val = redis.get(key)
            return int(val) if val else None
        except Exception as e:
            logger.warning(f"Redis get error: {e}")
            return _memory_storage.get(key)
    return _memory_storage.get(key)


def _set_key(key: str, value: int, ttl: int = 60) -> None:
    """Set value in Redis or memory with TTL"""
    redis = get_redis()
    if redis:
        try:
            redis.setex(key, ttl, value)
            return
        except Exception as e:
            logger.warning(f"Redis set error: {e}")
    
    # Fallback to memory
    _memory_storage[key] = value


def _incr_key(key: str, ttl: int = 60) -> int:
    """Increment key in Redis or memory"""
    redis = get_redis()
    if redis:
        try:
            # Use INCR and set TTL if key is new
            pipe = redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, ttl)
            results = pipe.execute()
            return int(results[0])
        except Exception as e:
            logger.warning(f"Redis incr error: {e}")
    
    # Fallback to memory
    current = _memory_storage.get(key, 0)
    _memory_storage[key] = current + 1
    return current + 1


# Rate limits by plan (requests per minute)
PLAN_RATE_LIMITS = {
    "hobby": 10,
    "starter": 15,
    "pro": 30,
    "business": 100
}

# Gemini API limits (with safety buffer)
GEMINI_DAILY_LIMIT = 1_200_000  # 1.2M tokens/day
GEMINI_MINUTE_LIMIT = 12  # 12 requests/minute


def check_user_rate_limit(user_id: str, plan: str) -> None:
    """
    Check user-specific rate limits using sliding window
    Raises HTTPException if rate limit exceeded
    """
    limit = PLAN_RATE_LIMITS.get(plan, 10)
    
    # Create minute-based window key
    now = datetime.utcnow()
    window_key = f"rate:user:{user_id}:{now.strftime('%Y%m%d%H%M')}"
    
    # Get current count and increment
    current_count = _incr_key(window_key, ttl=60)
    
    if current_count > limit:
        logger.warning(f"Rate limit exceeded for user {user_id} (plan: {plan})")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "message": f"Rate limit exceeded. Max {limit} requests per minute for {plan} plan.",
                "retry_after": 60,
                "limit": limit,
                "current": current_count
            }
        )


def check_gemini_limits(tokens_to_use: int) -> None:
    """
    Check global Gemini API limits (free tier protection)
    Prevents exceeding daily token limits and per-minute request limits
    """
    now = datetime.utcnow()
    
    # Keys for tracking
    minute_key = f"gemini:minute:{now.strftime('%Y%m%d%H%M')}"
    daily_key = f"gemini:daily:{now.strftime('%Y%m%d')}"
    
    # Check minute request limit
    minute_requests = _get_key(minute_key) or 0
    if minute_requests >= GEMINI_MINUTE_LIMIT:
        logger.warning("Gemini minute rate limit reached")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "service_busy",
                "message": "Service is experiencing high traffic. Please try again in 60 seconds.",
                "retry_after": 60
            }
        )
    
    # Check daily token limit
    daily_tokens = _get_key(daily_key) or 0
    if daily_tokens + tokens_to_use > GEMINI_DAILY_LIMIT:
        logger.warning(f"Gemini daily limit reached: {daily_tokens}/{GEMINI_DAILY_LIMIT}")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "daily_limit_reached",
                "message": "Daily API limit reached. Service will resume tomorrow at midnight UTC.",
                "retry_after": _seconds_until_midnight()
            }
        )
    
    # Increment minute counter (60 second TTL)
    _incr_key(minute_key, ttl=60)


def record_gemini_usage(tokens_used: int) -> None:
    """
    Record actual Gemini token usage after successful API call
    """
    now = datetime.utcnow()
    daily_key = f"gemini:daily:{now.strftime('%Y%m%d')}"
    
    redis = get_redis()
    if redis:
        try:
            pipe = redis.pipeline()
            pipe.incrby(daily_key, tokens_used)
            pipe.expire(daily_key, 86400)  # 24 hour TTL
            pipe.execute()
            return
        except Exception as e:
            logger.warning(f"Redis record error: {e}")
    
    # Fallback to memory
    current = _memory_storage.get(daily_key, 0)
    _memory_storage[daily_key] = current + tokens_used


def get_rate_limit_status(user_id: str, plan: str) -> dict:
    """
    Get current rate limit status for a user
    """
    limit = PLAN_RATE_LIMITS.get(plan, 10)
    now = datetime.utcnow()
    window_key = f"rate:user:{user_id}:{now.strftime('%Y%m%d%H%M')}"
    
    current = _get_key(window_key) or 0
    
    return {
        "limit": limit,
        "remaining": max(0, limit - current),
        "reset": 60,  # seconds until window resets
        "plan": plan
    }


def get_gemini_status() -> dict:
    """
    Get current Gemini API usage status
    """
    now = datetime.utcnow()
    minute_key = f"gemini:minute:{now.strftime('%Y%m%d%H%M')}"
    daily_key = f"gemini:daily:{now.strftime('%Y%m%d')}"
    
    minute_requests = _get_key(minute_key) or 0
    daily_tokens = _get_key(daily_key) or 0
    
    return {
        "minute_requests": minute_requests,
        "minute_limit": GEMINI_MINUTE_LIMIT,
        "daily_tokens": daily_tokens,
        "daily_limit": GEMINI_DAILY_LIMIT,
        "daily_percentage": round((daily_tokens / GEMINI_DAILY_LIMIT) * 100, 2)
    }


def _seconds_until_midnight() -> int:
    """Calculate seconds until midnight UTC"""
    now = datetime.utcnow()
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta
    next_midnight = midnight + timedelta(days=1)
    return int((next_midnight - now).total_seconds())
