/*
    Pinescript AI Generator - Lemon Squeezy Integration Guide (Phase 1)
    
    This guide explains how to set up the Lemon Squeezy integration for subscription management.
    
    ## 1. Prerequisites
    - Lemon Squeezy Account (Test Mode enabled for dev)
    - Store Created
    - Product Created (Subscription) with Variants if needed.
    
    ## 2. Environment Variables
    Add these to `.env.local` and Vercel:
    - `LEMONSQUEEZY_API_KEY`: Generate API Key in Settings -> API
    - `LEMONSQUEEZY_STORE_ID`: Find in Store Settings
    - `LEMONSQUEEZY_WEBHOOK_SECRET`: A random string you verify in webhook handler
    
    ## 3. Database Setup
    Run `lemonsqueezy_schema.sql` in Supabase SQL Editor.
    
    ## 4. Webhook Setup
    - Create a webhook in Lemon Squeezy Settings -> Webhooks.
    - URL: `https://<your-vercel-domain>/api/webhooks/lemonsqueezy`
    - Secret: Same as `LEMONSQUEEZY_WEBHOOK_SECRET` env var.
    - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`
    
    ## 5. Implementation Status
    - `src/lib/lemonsqueezy.ts`: Configuration utility created.
    - `lemonsqueezy_schema.sql`: Database schema ready.
    - **Next Step**: Implement `/api/webhooks/lemonsqueezy` route handler.
*/
