"""
Application Configuration
Validates and provides access to environment variables
"""
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Supabase
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_service_key: str = Field(..., alias="SUPABASE_SERVICE_KEY")
    supabase_jwt_secret: str = Field(..., alias="SUPABASE_JWT_SECRET")
    
    # Gemini AI
    gemini_api_key: str = Field(..., alias="GEMINI_API_KEY")
    
    # Stripe
    stripe_secret_key: Optional[str] = Field(default=None, alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: Optional[str] = Field(default=None, alias="STRIPE_WEBHOOK_SECRET")
    stripe_starter_price_id: Optional[str] = Field(default=None, alias="STRIPE_STARTER_PRICE_ID")
    stripe_pro_price_id: Optional[str] = Field(default=None, alias="STRIPE_PRO_PRICE_ID")
    stripe_business_price_id: Optional[str] = Field(default=None, alias="STRIPE_BUSINESS_PRICE_ID")
    stripe_starter_yearly_price_id: Optional[str] = Field(default=None, alias="STRIPE_STARTER_YEARLY_PRICE_ID")
    stripe_pro_yearly_price_id: Optional[str] = Field(default=None, alias="STRIPE_PRO_YEARLY_PRICE_ID")
    stripe_business_yearly_price_id: Optional[str] = Field(default=None, alias="STRIPE_BUSINESS_YEARLY_PRICE_ID")
    
    # Upstash Redis (optional for local dev)
    upstash_redis_url: Optional[str] = Field(default=None, alias="UPSTASH_REDIS_URL")
    upstash_redis_token: Optional[str] = Field(default=None, alias="UPSTASH_REDIS_TOKEN")
    
    # Email (optional)
    resend_api_key: Optional[str] = Field(default=None, alias="RESEND_API_KEY")
    
    # Frontend URL
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    
    # Rate Limiting
    gemini_daily_limit: int = Field(default=1_200_000, alias="GEMINI_DAILY_LIMIT")
    gemini_minute_limit: int = Field(default=12, alias="GEMINI_MINUTE_LIMIT")
    
    @field_validator('supabase_url')
    @classmethod
    def validate_supabase_url(cls, v):
        if not v.startswith('https://'):
            raise ValueError('SUPABASE_URL must start with https://')
        return v
    
    @field_validator('gemini_api_key')
    @classmethod
    def validate_gemini_key(cls, v):
        if len(v) < 20:
            raise ValueError('GEMINI_API_KEY appears to be invalid')
        return v
    
    @property
    def is_production(self) -> bool:
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        return self.environment == "development"
    
    @property
    def redis_enabled(self) -> bool:
        return bool(self.upstash_redis_url and self.upstash_redis_token)
    
    @property
    def stripe_enabled(self) -> bool:
        return bool(self.stripe_secret_key)
    
    @property
    def email_enabled(self) -> bool:
        return bool(self.resend_api_key)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    """
    return Settings()


def validate_required_settings():
    """
    Validate that all required settings are present
    Call this at application startup
    """
    try:
        settings = get_settings()
        
        # Log configuration status
        print(f"Environment: {settings.environment}")
        print(f"Redis enabled: {settings.redis_enabled}")
        print(f"Stripe enabled: {settings.stripe_enabled}")
        print(f"Email enabled: {settings.email_enabled}")
        
        return True
    except Exception as e:
        print(f"Configuration error: {str(e)}")
        return False


# Convenience function for backward compatibility
def get_env(key: str, default: str = None) -> Optional[str]:
    """
    Get environment variable with optional default
    """
    return os.getenv(key, default)
