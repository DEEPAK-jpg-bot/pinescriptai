import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Verify Webhook Signature
const verifySignature = (rawBody: string, signature: string, secret: string) => {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    return crypto.timingSafeEqual(digest, signatureBuffer);
};

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-signature');
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

        if (!signature || !secret) {
            return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
        }

        if (!verifySignature(rawBody, signature, secret)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const data = JSON.parse(rawBody);
        const eventName = data.meta.event_name;
        const payload = data.data;

        // Log event for audit
        await supabase.from('webhook_events').insert({
            event_type: eventName,
            payload: data,
            processed: false
        });

        // Handle Subscription Events
        // Note: Lemon Squeezy passes 'custom_data' in checkout which typically contains user_id
        // Ensure you pass { checkout_data: { custom: { user_id: '...' } } } when creating checkout

        // Strategy: We rely on `attributes.user_email` to match user if custom_data is missing, 
        // OR we simply store the customer_id in profiles and match that way.
        // Best practice: Pass user_id in custom data.

        const customerId = payload.attributes.customer_id;
        const userEmail = payload.attributes.user_email;
        const customData = data.meta.custom_data || {};
        const userId = customData.user_id;

        // 1. Resolve User
        let targetUserId = userId;

        if (!targetUserId && userEmail) {
            // Fallback: lookup by email
            const { data: users } = await supabase.from('user_profiles').select('id').eq('email', userEmail).single();
            if (users) {
                targetUserId = users.id;
            }
        }

        if (!targetUserId) {
            // We can't link subscription to a user. Log error.
            console.error('Webhook Error: Could not link subscription to user', userEmail);
            return NextResponse.json({ message: 'User not found, event logged' }, { status: 200 });
        }

        // 2. Process Events
        if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'subscription_resumed') {
            const subscriptionData = {
                id: payload.id,
                user_id: targetUserId,
                status: payload.attributes.status,
                plan_id: payload.attributes.variant_id.toString(),
                current_period_end: payload.attributes.renews_at || payload.attributes.ends_at,
                customer_id: customerId.toString(),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase.from('subscriptions').upsert(subscriptionData);

            if (error) {
                console.error('Supabase Upsert Error:', error);
                throw error;
            }

            // Sync Profile Tier
            const tier = payload.attributes.status === 'active' ? 'pro' : 'free';
            // Logic: Update user profile tier and potentially token limits
            const tokenLimit = tier === 'pro' ? 100000 : 1500; // Example pro limit

            await supabase.from('user_profiles').update({
                tier: tier,
                tokens_monthly_limit: tokenLimit,
                // Don't overwrite tokens_remaining directly unless it's a renewal? 
                // Simpler logic: Pro gives high limit.
            }).eq('id', targetUserId);

        }
        else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
            await supabase.from('subscriptions').update({
                status: payload.attributes.status,
                updated_at: new Date().toISOString()
            }).eq('id', payload.id);

            // Downgrade to free if expired (not if just cancelled but still in period)
            if (payload.attributes.status === 'expired') {
                await supabase.from('user_profiles').update({
                    tier: 'free',
                    tokens_monthly_limit: 1500
                }).eq('id', targetUserId);
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('Webhook Handler Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
