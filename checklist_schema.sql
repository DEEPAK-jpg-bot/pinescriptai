/*
    Pinescript AI Generator - Checklist Implementation Schema
    
    This includes:
    1. Conversations, Messages, and User Profiles
    2. Quota Tracking for Rate Limiting
    3. Triggers and RLS Policies from Checklist
    
    Please run this in your Supabase SQL Editor.
*/

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Drop existing tables if they conflict (Optional, use carefully)
-- drop table if exists messages;
-- drop table if exists conversations;
-- drop table if exists quota_tracking;
-- drop table if exists user_profiles;

-- 3. USER PROFILES TABLE (Syncs with auth.users)
create table if not exists public.user_profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text,
    tier text default 'free', -- 'free' | 'pro' | 'business'
    tokens_remaining int default 1500,
    tokens_reset_at timestamptz default (CURRENT_DATE + INTERVAL '1 day'),
    created_at timestamptz default now()
);

-- 4. CONVERSATIONS TABLE
create table if not exists public.conversations (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    title text default 'New Conversation',
    total_tokens int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 5. MESSAGES TABLE
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    tokens int default 0,
    created_at timestamptz default now()
);

-- 6. QUOTA TRACKING TABLE (Rate Limits)
create table if not exists public.quota_tracking (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    tokens_used int default 0,
    created_at timestamptz default now()
);

-- 7. RLS POLICIES (Row Level Security)
alter table public.user_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.quota_tracking enable row level security; -- Even logs should be protected

-- Profiles
create policy "Users can view own profile" on public.user_profiles
    for select using (auth.uid() = id);

create policy "Users can update own profile" on public.user_profiles
    for update using (auth.uid() = id);

-- Conversations
create policy "Users can view own conversations" on public.conversations
    for select using (auth.uid() = user_id);

create policy "Users can insert own conversations" on public.conversations
    for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations" on public.conversations
    for update using (auth.uid() = user_id);

create policy "Users can delete own conversations" on public.conversations
    for delete using (auth.uid() = user_id);

-- Messages (Users can only access messages in their conversations)
create policy "Users can view own messages" on public.messages
    for select using (
        exists (select 1 from public.conversations 
        where conversations.id = messages.conversation_id 
        and conversations.user_id = auth.uid())
    );

create policy "Users can insert own messages" on public.messages
    for insert with check (
        exists (select 1 from public.conversations 
        where conversations.id = messages.conversation_id 
        and conversations.user_id = auth.uid())
    );

-- Quota Tracking (Internal mostly, but secure it)
create policy "Users can view own quota logs" on public.quota_tracking
    for select using (auth.uid() = user_id);

-- 8. FUNCTIONS & TRIGGERS

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (id, email, tier, tokens_remaining, tokens_reset_at)
    values (
        new.id, 
        new.email, 
        'free', 
        1500, 
        (CURRENT_DATE + INTERVAL '1 day')::timestamptz
    );
    return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Rate Limiting Check Function from Checklist
create or replace function check_rate_limit(p_user_id uuid)
returns jsonb as $$
declare
  v_profile public.user_profiles%ROWTYPE;
  v_recent_count integer;
  v_wait_seconds integer;
begin
  -- Get user profile with lock
  select * into v_profile 
  from public.user_profiles 
  where id = p_user_id 
  for update;
  
  -- Check if reset needed (Daily Reset Logic)
  if v_profile.tokens_reset_at < now() then
    update public.user_profiles 
    set tokens_remaining = 1500, 
        tokens_reset_at = (CURRENT_DATE + INTERVAL '1 day')::timestamptz
    where id = p_user_id;
    v_profile.tokens_remaining := 1500;
    v_profile.tokens_reset_at := (CURRENT_DATE + INTERVAL '1 day')::timestamptz;
  end if;
  
  -- Check daily limit (Tokens)
  if v_profile.tokens_remaining <= 0 then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'resetAt', v_profile.tokens_reset_at,
      'reason', 'daily_quota_exceeded'
    );
  end if;
  
  -- Check per-minute limit (last 15 requests)
  select count(*) into v_recent_count
  from public.quota_tracking
  where user_id = p_user_id 
    and created_at > now() - interval '1 minute';
  
  if v_recent_count >= 15 then
    -- Calculate wait time
    select extract(epoch from (
      now() - min(created_at) - interval '60 seconds'
    ))::integer into v_wait_seconds
    from (
      select created_at 
      from public.quota_tracking 
      where user_id = p_user_id 
        and created_at > now() - interval '1 minute'
      order by created_at asc 
      limit 1
    ) t;
    
    return jsonb_build_object(
      'allowed', false,
      'remaining', v_profile.tokens_remaining,
      'waitSeconds', coalesce(abs(v_wait_seconds), 60), -- Ensure positive number
      'reason', 'rate_limit_exceeded'
    );
  end if;
  
  -- Allow request
  return jsonb_build_object(
    'allowed', true,
    'remaining', v_profile.tokens_remaining,
    'resetAt', v_profile.tokens_reset_at
  );
end;
$$ language plpgsql security definer;

-- Record Request Function from Checklist
create or replace function record_request(
  p_user_id uuid,
  p_tokens_used integer
)
returns void as $$
begin
  -- Decrement quota
  update public.user_profiles 
  set tokens_remaining = tokens_remaining - 1 -- Decrement by 1 request or actual tokens? Checklist implies request count vs token count ambiguity, assuming 1 'credit' per request for simplicity or actual tokens. 
                                              -- The prompt says "Decrement on each successful request" under Daily Quota Tracking.
                                              -- But the function takes p_tokens_used. Let's assume usage of tokens.
                                              -- Actually, prompt says "Decrement on each successful request" suggesting 1500 request quota? 
                                              -- "Daily: 1500 requests". Okay, so tokens_remaining is actually requests_remaining.
  where id = p_user_id;
  
  -- Record timestamp
  insert into public.quota_tracking (user_id, tokens_used)
  values (p_user_id, p_tokens_used);
  
  -- Clean up old tracking records (>1 hour old) to keep table small
  delete from public.quota_tracking
  where user_id = p_user_id 
    and created_at < now() - interval '1 hour';
end;
$$ language plpgsql security definer;

-- 9. PERFORMANCE INDEXES
create index idx_conversations_user_id on public.conversations(user_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_quota_tracking_user_created on public.quota_tracking(user_id, created_at);
