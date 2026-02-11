-- 1. UTILS: Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. TABLES
-- User Profiles
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  tier text default 'free' check (tier in ('free', 'pro')),
  tokens_monthly_limit bigint default 1500,
  tokens_remaining bigint default 1500,
  last_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  total_tokens bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens bigint default 0,
  created_at timestamptz default now()
);

-- Subscriptions (Lemon Squeezy Sync)
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  status text not null,
  plan_id text,
  current_period_end timestamptz,
  customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Webhook Events (Audit Log)
create table if not exists public.webhook_events (
  id bigserial primary key,
  event_type text,
  payload jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

-- 3. RLS POLICIES (Row Level Security)
alter table public.user_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security; -- Admin only usually

-- User Profiles: Users can read their own profile
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);

-- Conversations: Users can manage their own conversations
create policy "Users can manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- Messages: Users can manage messages in their conversations
create policy "Users can manage messages" on public.messages
  for all using (
    exists (
      select 1 from public.conversations
      where id = public.messages.conversation_id
      and user_id = auth.uid()
    )
  );

-- 4. FUNCTIONS & TRIGGERS

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, tier, tokens_monthly_limit, tokens_remaining)
  values (new.id, new.email, 'free', 1500, 1500);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Rate Limit Check RPC
create or replace function public.check_rate_limit(p_user_id uuid)
returns json as $$
declare
  v_profile public.user_profiles%rowtype;
begin
  select * into v_profile from public.user_profiles where id = p_user_id;
  
  -- Daily Reset Logic (Example: every 24h)
  if v_profile.last_reset_at < now() - interval '24 hours' then
    update public.user_profiles
    set tokens_remaining = tokens_monthly_limit,
        last_reset_at = now()
    where id = p_user_id;
    
    return json_build_object(
      'allowed', true,
      'remaining', v_profile.tokens_monthly_limit,
      'tier', v_profile.tier
    );
  end if;

  if v_profile.tokens_remaining > 0 then
    return json_build_object(
      'allowed', true,
      'remaining', v_profile.tokens_remaining,
      'tier', v_profile.tier
    );
  else
    return json_build_object(
      'allowed', false,
      'reason', 'daily_quota_exceeded',
      'resetAt', v_profile.last_reset_at + interval '24 hours'
    );
  end if;
end;
$$ language plpgsql security definer;

-- Record Request RPC
create or replace function public.record_request(p_user_id uuid, p_tokens_used int)
returns void as $$
begin
  update public.user_profiles
  set tokens_remaining = tokens_remaining - p_tokens_used,
      updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;
