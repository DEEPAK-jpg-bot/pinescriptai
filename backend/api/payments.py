"""
Payment Endpoints - Stripe Integration
Handles checkout sessions and webhook events for subscription management
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from models.schemas import CreateCheckoutRequest, CreateCheckoutResponse
from utils.security import get_current_user
from utils.supabase_client import get_supabase
from services.token_service import reset_monthly_tokens
from services.affiliate_service import process_referral_commission
import stripe
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Plan configuration
PLAN_CONFIG = {
    "starter": {
        "tokens_monthly_limit": 5000,
        "max_input_tokens": 10000
    },
    "pro": {
        "tokens_monthly_limit": 25000,
        "max_input_tokens": 25000
    },
    "business": {
        "tokens_monthly_limit": 100000,
        "max_input_tokens": 50000
    }
}


@router.post("/checkout", response_model=CreateCheckoutResponse)
async def create_checkout(request: CreateCheckoutRequest, user: dict = Depends(get_current_user)):
    """
    Create a Stripe Checkout session for subscription
    """
    try:
        supabase = get_supabase()
        
        # Determine price ID from plan and billing cycle
        if request.billing_cycle == "yearly":
            price_key = f"STRIPE_{request.plan.upper()}_YEARLY_PRICE_ID"
        else:
            price_key = f"STRIPE_{request.plan.upper()}_PRICE_ID"
        
        price_id = os.getenv(price_key)
        
        if not price_id:
            raise HTTPException(status_code=400, detail=f"Price not configured for {request.plan} plan")
        
        # Get or create Stripe customer
        customer_id = user.get('stripe_customer_id')
        
        if not customer_id:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=user.get('email'),
                metadata={'user_id': user['id']}
            )
            customer_id = customer.id
            
            # Update user profile with Stripe customer ID
            supabase.table("user_profiles").update({
                'stripe_customer_id': customer_id
            }).eq("id", user['id']).execute()
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/dashboard?subscription=success",
            cancel_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/pricing?subscription=cancelled",
            metadata={
                'user_id': user['id'],
                'plan': request.plan,
                'billing_cycle': request.billing_cycle
            },
            subscription_data={
                'metadata': {
                    'user_id': user['id'],
                    'plan': request.plan
                }
            }
        )
        
        return {"checkout_url": checkout_session.url}
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events for subscription lifecycle
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError as e:
        logger.error(f"Invalid webhook payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid webhook signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    supabase = get_supabase()
    event_type = event['type']
    data = event['data']['object']
    
    logger.info(f"Processing Stripe webhook: {event_type}")
    
    try:
        # Handle checkout.session.completed - New subscription
        if event_type == 'checkout.session.completed':
            await handle_checkout_completed(supabase, data)
        
        # Handle subscription updates
        elif event_type == 'customer.subscription.updated':
            await handle_subscription_updated(supabase, data)
        
        # Handle subscription deletion/cancellation
        elif event_type == 'customer.subscription.deleted':
            await handle_subscription_deleted(supabase, data)
        
        # Handle successful invoice payment (monthly renewal)
        elif event_type == 'invoice.payment_succeeded':
            await handle_invoice_paid(supabase, data)
        
        # Handle failed payment
        elif event_type == 'invoice.payment_failed':
            await handle_payment_failed(supabase, data)
        
        return {"status": "success", "event": event_type}
        
    except Exception as e:
        logger.error(f"Error processing webhook {event_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")


async def handle_checkout_completed(supabase, session):
    """
    Handle successful checkout - activate subscription
    """
    user_id = session.get('metadata', {}).get('user_id')
    plan = session.get('metadata', {}).get('plan')
    subscription_id = session.get('subscription')
    customer_id = session.get('customer')
    
    if not user_id or not plan:
        logger.warning(f"Missing metadata in checkout session: {session.get('id')}")
        return
    
    plan_config = PLAN_CONFIG.get(plan, PLAN_CONFIG['starter'])
    
    # Update user profile with new plan
    update_data = {
        'plan': plan,
        'tokens_monthly_limit': plan_config['tokens_monthly_limit'],
        'tokens_remaining': plan_config['tokens_monthly_limit'],
        'tokens_used_this_month': 0,
        'max_input_tokens': plan_config['max_input_tokens'],
        'stripe_customer_id': customer_id,
        'stripe_subscription_id': subscription_id,
        'subscription_status': 'active',
        'billing_cycle_start': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    supabase.table("user_profiles").update(update_data).eq("id", user_id).execute()
    logger.info(f"Activated {plan} subscription for user {user_id}")
    
    # Process affiliate commission
    amount_total = session.get('amount_total', 0) / 100.0  # Convert from cents
    currency = session.get('currency', 'usd')
    
    if amount_total > 0:
        await process_referral_commission(
            supabase, 
            user_id, 
            amount_total, 
            currency, 
            subscription_id=subscription_id,
            session_id=session.get('id')
        )


async def handle_subscription_updated(supabase, subscription):
    """
    Handle subscription updates (plan changes, status changes)
    """
    subscription_id = subscription.get('id')
    status = subscription.get('status')
    plan = subscription.get('metadata', {}).get('plan')
    
    # Find user by subscription ID
    user_response = supabase.table("user_profiles").select("id").eq("stripe_subscription_id", subscription_id).single().execute()
    
    if not user_response.data:
        logger.warning(f"No user found for subscription: {subscription_id}")
        return
    
    user_id = user_response.data['id']
    
    update_data = {
        'subscription_status': status,
        'updated_at': datetime.now().isoformat()
    }
    
    # If plan changed, update token limits
    if plan and plan in PLAN_CONFIG:
        plan_config = PLAN_CONFIG[plan]
        update_data.update({
            'plan': plan,
            'tokens_monthly_limit': plan_config['tokens_monthly_limit'],
            'max_input_tokens': plan_config['max_input_tokens']
        })
    
    supabase.table("user_profiles").update(update_data).eq("id", user_id).execute()
    logger.info(f"Updated subscription for user {user_id}: status={status}")


async def handle_subscription_deleted(supabase, subscription):
    """
    Handle subscription cancellation - downgrade to hobby
    """
    subscription_id = subscription.get('id')
    
    # Find user by subscription ID
    user_response = supabase.table("user_profiles").select("id").eq("stripe_subscription_id", subscription_id).single().execute()
    
    if not user_response.data:
        logger.warning(f"No user found for cancelled subscription: {subscription_id}")
        return
    
    user_id = user_response.data['id']
    
    # Downgrade to hobby plan
    update_data = {
        'plan': 'hobby',
        'tokens_monthly_limit': 1000,
        'tokens_remaining': 1000,
        'tokens_used_this_month': 0,
        'max_input_tokens': 5000,
        'stripe_subscription_id': None,
        'subscription_status': 'cancelled',
        'updated_at': datetime.now().isoformat()
    }
    
    supabase.table("user_profiles").update(update_data).eq("id", user_id).execute()
    logger.info(f"Cancelled subscription for user {user_id}, downgraded to hobby")


async def handle_invoice_paid(supabase, invoice):
    """
    Handle successful invoice payment - reset monthly tokens
    """
    subscription_id = invoice.get('subscription')
    
    if not subscription_id:
        return
    
    # Find user by subscription ID
    user_response = supabase.table("user_profiles").select("*").eq("stripe_subscription_id", subscription_id).single().execute()
    
    if not user_response.data:
        logger.warning(f"No user found for invoice subscription: {subscription_id}")
        return
    
    user = user_response.data
    
    # Reset monthly tokens
    await reset_monthly_tokens(user['id'])
    logger.info(f"Reset monthly tokens for user {user['id']}")


async def handle_payment_failed(supabase, invoice):
    """
    Handle failed payment - update subscription status
    """
    subscription_id = invoice.get('subscription')
    
    if not subscription_id:
        return
    
    # Find user by subscription ID
    user_response = supabase.table("user_profiles").select("id").eq("stripe_subscription_id", subscription_id).single().execute()
    
    if not user_response.data:
        return
    
    user_id = user_response.data['id']
    
    # Update status to past_due
    supabase.table("user_profiles").update({
        'subscription_status': 'past_due',
        'updated_at': datetime.now().isoformat()
    }).eq("id", user_id).execute()
    
    logger.warning(f"Payment failed for user {user_id}")


@router.post("/portal")
async def create_portal_session(user: dict = Depends(get_current_user)):
    """
    Create a Stripe Customer Portal session for subscription management
    """
    customer_id = user.get('stripe_customer_id')
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/dashboard"
        )
        return {"portal_url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subscription")
async def get_subscription_status(user: dict = Depends(get_current_user)):
    """
    Get current subscription status
    """
    return {
        "plan": user.get('plan', 'hobby'),
        "status": user.get('subscription_status'),
        "tokens_remaining": user.get('tokens_remaining', 0),
        "tokens_monthly_limit": user.get('tokens_monthly_limit', 1000),
        "billing_cycle_start": user.get('billing_cycle_start')
    }
