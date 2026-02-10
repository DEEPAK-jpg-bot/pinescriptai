"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ============================================
# ENUMS
# ============================================
class PlanType(str, Enum):
    hobby = "hobby"
    starter = "starter"
    pro = "pro"
    business = "business"

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"

class StrategyType(str, Enum):
    indicator = "indicator"
    strategy = "strategy"
    other = "other"

# ============================================
# AUTH SCHEMAS
# ============================================
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1, max_length=100)
    referral_code: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    password: str = Field(..., min_length=8)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class MessageResponse(BaseModel):
    message: str
    success: bool = True

# ============================================
# USER SCHEMAS
# ============================================
class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    plan: PlanType
    tokens_remaining: int
    tokens_monthly_limit: int
    tokens_used_this_month: int
    max_input_tokens: int
    billing_cycle_start: datetime
    created_at: datetime

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code_theme: Optional[str] = Field(None, pattern='^(light|dark)$')
    email_notifications: Optional[bool] = None

# ============================================
# GENERATION SCHEMAS
# ============================================
class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=5000)
    thread_id: Optional[str] = None
    
    @field_validator('prompt')
    @classmethod
    def validate_prompt(cls, v):
        if not v.strip():
            raise ValueError('Prompt cannot be empty')
        return v.strip()

class GenerateResponse(BaseModel):
    thread_id: str
    message: dict
    tokens_remaining: int
    natural_language: str

# ============================================
# THREAD SCHEMAS
# ============================================
class CreateThreadRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=200)

class ThreadListItem(BaseModel):
    id: str
    title: str
    message_count: int
    total_tokens_used: int
    last_activity: datetime
    is_saved: bool
    preview: str

class ThreadDetail(BaseModel):
    id: str
    title: str
    messages: List[dict]
    total_tokens_used: int
    is_saved: bool
    created_at: datetime

class UpdateThreadRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

# ============================================
# SCRIPT SCHEMAS
# ============================================
class SaveScriptRequest(BaseModel):
    thread_id: str
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=10)
    description: Optional[str] = Field(None, max_length=1000)
    strategy_type: StrategyType
    tokens_used: int

class ScriptListItem(BaseModel):
    id: str
    name: str
    description: Optional[str]
    code_preview: str
    strategy_type: StrategyType
    tokens_used: int
    created_at: datetime

class ScriptDetail(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str]
    strategy_type: StrategyType
    tokens_used: int
    thread_id: Optional[str]
    created_at: datetime

class UpdateScriptRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    code: Optional[str] = Field(None, min_length=10)

# ============================================
# TOKEN SCHEMAS
# ============================================
class TokenBalanceResponse(BaseModel):
    tokens_remaining: int
    tokens_monthly_limit: int
    tokens_used_this_month: int
    usage_percentage: float
    natural_language: dict
    billing_cycle_start: datetime
    days_until_reset: int

class TokenUsageResponse(BaseModel):
    period: str
    total_tokens: int
    breakdown: dict
    daily_usage: List[dict]

class EstimateTokensRequest(BaseModel):
    prompt: str

class EstimateTokensResponse(BaseModel):
    estimated_input_tokens: int
    estimated_output_tokens: int
    estimated_total: int
    natural_language: str
    within_limit: bool

# ============================================
# PAYMENT SCHEMAS
# ============================================
class CreateCheckoutRequest(BaseModel):
    plan: str = Field(..., pattern='^(starter|pro|business)$')
    billing_cycle: str = Field(..., pattern='^(monthly|yearly)$')

class CreateCheckoutResponse(BaseModel):
    checkout_url: str

class StripeWebhookEvent(BaseModel):
    type: str
    data: dict
