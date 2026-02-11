"""
Token Management Service
Handles token tracking, deduction, and usage analytics
"""
from datetime import datetime, timedelta
from typing import Dict, List
from utils.supabase_client import get_supabase
from utils.helpers import tokens_to_words, get_days_until_reset

async def check_token_balance(user: Dict, tokens_needed: int) -> bool:
    """
    Check if user has sufficient tokens
    """
    return user['tokens_remaining'] >= tokens_needed

async def deduct_tokens(user_id: str, tokens_used: int, thread_id: str = None, action: str = "generate") -> Dict:
    """
    Deduct tokens from user's balance atomically via RPC
    Returns updated user profile
    """
    supabase = get_supabase()
    
    # Call the atomic SQL function
    response = supabase.rpc("deduct_user_tokens", {
        "p_user_id": user_id,
        "p_tokens_to_deduct": tokens_used,
        "p_thread_id": thread_id,
        "p_action": action
    }).execute()
    
    res_data = response.data
    
    if not res_data or not res_data.get('success'):
        error_msg = res_data.get('error', 'token_deduction_failed') if res_data else 'rpc_failed'
        raise Exception(f"Atomic token deduction failed: {error_msg}")
    
    return res_data['data']

async def get_token_balance(user_id: str) -> Dict:
    """
    Get detailed token balance information
    """
    supabase = get_supabase()
    user_response = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
    user = user_response.data
    
    usage_percentage = (user['tokens_used_this_month'] / user['tokens_monthly_limit']) * 100
    
    return {
        'tokens_remaining': user['tokens_remaining'],
        'tokens_monthly_limit': user['tokens_monthly_limit'],
        'tokens_used_this_month': user['tokens_used_this_month'],
        'usage_percentage': round(usage_percentage, 2),
        'natural_language': {
            'remaining': tokens_to_words(user['tokens_remaining']),
            'used': tokens_to_words(user['tokens_used_this_month']),
            'limit': tokens_to_words(user['tokens_monthly_limit'])
        },
        'billing_cycle_start': user['billing_cycle_start'],
        'days_until_reset': get_days_until_reset(datetime.fromisoformat(user['billing_cycle_start']))
    }

async def get_usage_analytics(user_id: str, period: str = "month") -> Dict:
    """
    Get token usage analytics
    """
    supabase = get_supabase()
    
    # Calculate date range
    now = datetime.now()
    if period == "day":
        start_date = now - timedelta(days=1)
    elif period == "week":
        start_date = now - timedelta(weeks=1)
    else:  # month
        start_date = now - timedelta(days=30)
    
    # Get usage data
    usage_response = supabase.table("token_usage") \
        .select("*") \
        .eq("user_id", user_id) \
        .gte("created_at", start_date.isoformat()) \
        .execute()
    
    usage_data = usage_response.data
    
    # Calculate totals
    total_tokens = sum(item['total_tokens'] for item in usage_data)
    
    # Breakdown by action
    breakdown = {
        'generate': sum(item['total_tokens'] for item in usage_data if item['action'] == 'generate'),
        'explain': sum(item['total_tokens'] for item in usage_data if item['action'] == 'explain'),
        'refine': sum(item['total_tokens'] for item in usage_data if item['action'] == 'refine')
    }
    
    # Daily usage (for chart)
    daily_usage = {}
    for item in usage_data:
        date = datetime.fromisoformat(item['created_at']).date().isoformat()
        daily_usage[date] = daily_usage.get(date, 0) + item['total_tokens']
    
    daily_usage_list = [
        {'date': date, 'tokens': tokens}
        for date, tokens in sorted(daily_usage.items())
    ]
    
    return {
        'period': period,
        'total_tokens': total_tokens,
        'breakdown': breakdown,
        'daily_usage': daily_usage_list
    }

async def reset_monthly_tokens(user_id: str) -> None:
    """
    Reset tokens at the start of new billing cycle
    Called by Stripe webhook on successful payment
    """
    supabase = get_supabase()
    
    user_response = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
    user = user_response.data
    
    update_data = {
        'tokens_remaining': user['tokens_monthly_limit'],
        'tokens_used_this_month': 0,
        'billing_cycle_start': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    supabase.table("user_profiles").update(update_data).eq("id", user_id).execute()
