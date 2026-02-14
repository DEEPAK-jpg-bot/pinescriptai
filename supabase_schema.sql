-- 1. AGGRESSIVE CLEANUP
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.check_rate_limit(uuid) cascade;
drop function if exists public.record_request(uuid, int) cascade;

-- Drop tables in reverse order of dependency
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.webhook_events cascade;

-- 2. UTILS
create extension if not exists "uuid-ossp";

-- 3. USER PROFILES
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  tier text default 'free' check (tier in ('free', 'pro')),
  tokens_monthly_limit bigint default 1500,
  tokens_remaining bigint default 1500,
  last_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. CONVERSATIONS
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  total_tokens bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens bigint default 0,
  created_at timestamptz default now()
);

-- 6. SUBSCRIPTIONS
create table public.subscriptions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  status text not null,
  plan_id text,
  current_period_end timestamptz,
  customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. WEBHOOK EVENTS
create table public.webhook_events (
  id bigserial primary key,
  event_type text,
  payload jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

-- 8. RLS
alter table public.user_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_events enable row level security;

-- 9. POLICIES
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can manage own conversations" on public.conversations for all using (auth.uid() = user_id);
create policy "Users can manage messages" on public.messages for all using (
    exists (select 1 from public.conversations where id = conversation_id and user_id = auth.uid())
);

-- 10. FUNCTIONS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, tier, tokens_monthly_limit, tokens_remaining)
  values (new.id, new.email, 'free', 1500, 1500);
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.check_token_quota(p_user_id uuid)
returns json as $$
declare
  v_profile record;
begin
  select * into v_profile from public.user_profiles where id = p_user_id;
  
  if v_profile is null then
    insert into public.user_profiles (id, email)
    select id, email from auth.users where id = p_user_id
    on conflict do nothing;
    select * into v_profile from public.user_profiles where id = p_user_id;
  end if;

  if v_profile is null then
      return json_build_object('allowed', false, 'reason', 'profile_not_found');
  end if;

  if v_profile.last_reset_at < now() - interval '24 hours' then
    update public.user_profiles
    set tokens_remaining = tokens_monthly_limit,
        last_reset_at = now()
    where id = p_user_id;
    return json_build_object('allowed', true, 'remaining', v_profile.tokens_monthly_limit, 'limit', v_profile.tokens_monthly_limit, 'tier', v_profile.tier);
  end if;

  if v_profile.tokens_remaining > 0 then
    return json_build_object('allowed', true, 'remaining', v_profile.tokens_remaining, 'limit', v_profile.tokens_monthly_limit, 'tier', v_profile.tier);
  else
    return json_build_object('allowed', false, 'reason', 'daily_quota_exceeded', 'remaining', 0, 'limit', v_profile.tokens_monthly_limit, 'tier', v_profile.tier, 'resetAt', v_profile.last_reset_at + interval '24 hours');
  end if;
end;
$$ language plpgsql security definer;

-- Backward compatibility wrapper
create or replace function public.check_rate_limit(p_user_id uuid)
returns json as $$
begin
  return public.check_token_quota(p_user_id);
end;
$$ language plpgsql security definer;

create or replace function public.record_request(p_user_id uuid, p_tokens_used int)
returns void as $$
begin
  update public.user_profiles
  set tokens_remaining = tokens_remaining - p_tokens_used,
      updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- Atomic token deduction for Python backend compatibility
create or replace function public.deduct_user_tokens(
    p_user_id uuid, 
    p_tokens_to_deduct int,
    p_thread_id uuid default null,
    p_action text default 'generate'
)
returns json as $$
declare
    v_remaining bigint;
begin
    update public.user_profiles
    set tokens_remaining = tokens_remaining - p_tokens_to_deduct,
        updated_at = now()
    where id = p_user_id
    returning tokens_remaining into v_remaining;

    return json_build_object('success', true, 'data', json_build_object('tokens_remaining', v_remaining));
exception when others then
    return json_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer;

-- 11. TRIGGERS
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 12. RELOAD
NOTIFY pgrst, 'reload schema';
