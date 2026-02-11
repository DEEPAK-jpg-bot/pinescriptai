"""
Affiliate Service
Handles commission calculations and recording for influencers
"""
from typing import Dict, Optional
from utils.supabase_client import get_supabase
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

async def process_referral_commission(supabase, user_id: str, amount_paid: float, currency: str, subscription_id: str = None, session_id: str = None):
    """
    Check if user was referred and process commission if it's their first payment
    """
    try:
        # 1. Get user profile to check for referral code
        user_response = supabase.table("user_profiles").select("referred_by_code").eq("id", user_id).single().execute()
        if not user_response.data or not user_response.data.get('referred_by_code'):
            return None
        
        referral_code = user_response.data['referred_by_code']
        
        # 2. Check if commission already exists for this user (only first payment)
        existing = supabase.table("commissions").select("id").eq("referred_user_id", user_id).execute()
        if existing.data and len(existing.data) > 0:
            logger.info(f"User {user_id} already has a commission recorded. Skipping.")
            return None
        
        # 3. Find influencer by referral code
        influencer_response = supabase.table("influencers").select("*").eq("referral_code", referral_code).eq("is_active", True).single().execute()
        if not influencer_response.data:
            logger.warning(f"Influencer not found for code: {referral_code}")
            return None
        
        influencer = influencer_response.data
        
        # 4. Calculate commission (default 10%)
        commission_percent = influencer.get('commission_rate_percent', 10.0)
        commission_amount = (amount_paid * commission_percent) / 100.0
        
        # 5. Create commission record
        commission_data = {
            "influencer_id": influencer['id'],
            "referred_user_id": user_id,
            "subscription_id": subscription_id,
            "checkout_session_id": session_id,
            "amount": commission_amount,
            "currency": currency,
            "status": "pending",
            "is_first_payment": True
        }
        
        supabase.table("commissions").insert(commission_data).execute()
        
        # 6. Update influencer's total earned
        new_total_earned = float(influencer.get('total_earned', 0)) + commission_amount
        supabase.table("influencers").update({
            "total_earned": new_total_earned,
            "updated_at": datetime.now().isoformat()
        }).eq("id", influencer['id']).execute()
        
        logger.info(f"Commission of {commission_amount} recorded for influencer {influencer['id']} (User {user_id})")
        return commission_amount

    except Exception as e:
        logger.error(f"Error processing referral commission: {str(e)}")
        return None
