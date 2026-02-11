/*
    Pinescript AI Generator - Lemon Squeezy Integration Schema
    
    This includes:
    1. Subscriptions Table
    2. Webhook Event Tracking
    3. RLS Policies
    
    Please run this in your Supabase SQL Editor.
*/

-- 1. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
    id text primary key, -- Lemon Squeezy Subscription ID
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    status text not null, -- 'active', 'past_due', 'unpaid', 'cancelled', 'expired'
    plan_id text not null, -- Lemon Squeezy Variant ID
    current_period_end timestamptz not null,
    customer_id text not null, -- Lemon Squeezy Customer ID
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. WEBHOOK EVENTS TABLE (For debugging/audit)
create table if not exists public.webhook_events (
    id uuid default uuid_generate_v4() primary key,
    event_type text not null,
    payload jsonb not null,
    processed boolean default false,
    created_at timestamptz default now()
);

-- 3. RLS POLICIES
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on public.subscriptions
    for select using (auth.uid() = user_id);

-- Only service role (backend) can insert/update subscriptions via webhooks
-- No user update policy needed.

-- FUNCTIONS

-- Function to check subscription status (Can be used in RLS or App Logic)
create or replace function public.get_user_subscription_status(p_user_id uuid)
returns text as $$
declare
    v_status text;
begin
    select status into v_status
    from public.subscriptions
    where user_id = p_user_id
    limit 1;
    
    return coalesce(v_status, 'free');
end;
$$ language plpgsql security definer;

-- INDEXES
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_customer_id on public.subscriptions(customer_id);
