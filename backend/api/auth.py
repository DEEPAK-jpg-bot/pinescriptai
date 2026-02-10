"""
Authentication Endpoints
Handles user signup, login, logout, and password reset
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from models.schemas import (
    SignupRequest, LoginRequest, AuthResponse,
    PasswordResetRequest, PasswordResetConfirm, PasswordChangeRequest,
    MessageResponse
)
from utils.security import get_current_user
from utils.supabase_client import get_supabase
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    Register a new user account
    Returns access token and user info (or confirmation message if email verification required)
    """
    supabase = get_supabase()
    
    try:
        # Sign up user
        res = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.name
                },
                "email_redirect_to": os.getenv("FRONTEND_URL", "http://localhost:3000") + "/auth/callback"
            }
        })
        
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed. Please try again.")
        
        # If referral code was provided, update the user profile
        if request.referral_code:
            try:
                supabase.table("user_profiles").update({
                    "referred_by_code": request.referral_code
                }).eq("id", str(res.user.id)).execute()
            except Exception as e:
                logger.warning(f"Failed to save referral code for user {res.user.id}: {str(e)}")
        
        # Check if email confirmation is required
        if res.session:
            return {
                "access_token": res.session.access_token,
                "user": res.user.model_dump()
            }
        else:
            # Email confirmation required
            return {
                "access_token": "",
                "user": {
                    "id": str(res.user.id),
                    "email": res.user.email,
                    "email_confirmed": False,
                    "message": "Please check your email to confirm your account."
                }
            }
    
    except Exception as e:
        error_msg = str(e).lower()
        # Prevent email enumeration by returning a generic success response
        if "already registered" in error_msg or "already exists" in error_msg:
            # We mimic a successful "email confirmation required" response
            return {
                "access_token": "",
                "user": {
                    "id": "",
                    "email": request.email,
                    "email_confirmed": False,
                    "message": "Please check your email to confirm your account."
                }
            }
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=400, detail="Signup failed. Please try again.")


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Authenticate a user and return access token
    """
    supabase = get_supabase()
    
    try:
        res = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update last login timestamp
        try:
            supabase.table("user_profiles").update({
                "last_login": "now()"
            }).eq("id", str(res.user.id)).execute()
        except Exception:
            pass  # Non-critical, don't fail login
        
        return {
            "access_token": res.session.access_token,
            "user": res.user.model_dump()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "invalid" in error_msg or "credentials" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if "not confirmed" in error_msg:
            raise HTTPException(status_code=401, detail="Please confirm your email before logging in.")
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Login failed. Please try again.")


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Sign out the current user
    """
    supabase = get_supabase()
    
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully logged out", "success": True}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return {"message": "Logged out", "success": True}


@router.post("/password/reset", response_model=MessageResponse)
async def request_password_reset(request: PasswordResetRequest):
    """
    Request a password reset email
    """
    supabase = get_supabase()
    
    try:
        # Send password reset email
        supabase.auth.reset_password_email(
            request.email,
            options={
                "redirect_to": os.getenv("FRONTEND_URL", "http://localhost:3000") + "/auth/reset-password"
            }
        )
        
        # Always return success to prevent email enumeration
        return {
            "message": "If an account with that email exists, a password reset link has been sent.",
            "success": True
        }
    
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        # Still return success to prevent email enumeration
        return {
            "message": "If an account with that email exists, a password reset link has been sent.",
            "success": True
        }


@router.post("/password/update", response_model=MessageResponse)
async def update_password_with_token(request: PasswordResetConfirm, access_token: str = None):
    """
    Update password using the token from password reset email
    The access_token should be extracted from the URL fragment by the frontend
    """
    supabase = get_supabase()
    
    try:
        # Update the user's password
        res = supabase.auth.update_user({
            "password": request.password
        })
        
        if res.user:
            return {
                "message": "Password has been updated successfully. You can now log in with your new password.",
                "success": True
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to update password. The reset link may have expired.")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password update error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to update password. Please request a new reset link.")


@router.post("/password/change", response_model=MessageResponse)
async def change_password(
    request: PasswordChangeRequest,
    user: dict = Depends(get_current_user)
):
    """
    Change password for authenticated user (requires current password)
    """
    supabase = get_supabase()
    
    try:
        # Verify current password by attempting to sign in
        # Note: This requires the user's email which we get from the profile
        user_response = supabase.auth.get_user()
        
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_email = user_response.user.email
        
        # Verify current password
        try:
            supabase.auth.sign_in_with_password({
                "email": user_email,
                "password": request.current_password
            })
        except Exception:
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update to new password
        supabase.auth.update_user({
            "password": request.new_password
        })
        
        return {
            "message": "Password changed successfully",
            "success": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to change password. Please try again.")


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(refresh_token: str):
    """
    Refresh the access token using a refresh token
    """
    supabase = get_supabase()
    
    try:
        res = supabase.auth.refresh_session(refresh_token)
        
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
        return {
            "access_token": res.session.access_token,
            "user": res.user.model_dump()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(status_code=401, detail="Failed to refresh token. Please log in again.")


@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Get current authenticated user info
    """
    return {
        "id": user.get('id'),
        "email": user.get('email'),
        "plan": user.get('plan'),
        "tokens_remaining": user.get('tokens_remaining'),
        "tokens_monthly_limit": user.get('tokens_monthly_limit')
    }


@router.post("/resend-confirmation", response_model=MessageResponse)
async def resend_confirmation_email(request: PasswordResetRequest):
    """
    Resend email confirmation for unverified accounts
    """
    supabase = get_supabase()
    
    try:
        supabase.auth.resend(
            type="signup",
            email=request.email,
            options={
                "email_redirect_to": os.getenv("FRONTEND_URL", "http://localhost:3000") + "/auth/callback"
            }
        )
        
        return {
            "message": "If an unconfirmed account exists with that email, a new confirmation link has been sent.",
            "success": True
        }
    
    except Exception as e:
        logger.error(f"Resend confirmation error: {str(e)}")
        return {
            "message": "If an unconfirmed account exists with that email, a new confirmation link has been sent.",
            "success": True
        }
