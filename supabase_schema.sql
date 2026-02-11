/*
    PineGen Supabase Schema - Optimized for PineScript AI Generator
    
    This includes:
    1. User Profiles & Plans
    2. Threads (Conversations)
    3. Messages (Chat history)
    4. Scripts (Saved generated scripts)
    5. Subscriptions (Stripe)
    
    Copy and paste this into the Supabase SQL Editor.
*/

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create ENUMs for strict typing
create type plan_type as enum ('hobby', 'starter', 'pro', 'business');
create type message_role as enum ('user', 'assistant', 'system');
create type strategy_type as enum ('indicator', 'strategy', 'other');

-- 3. PROFILES TABLE (Extends default auth.users)
create table public.user_profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    name text,
    plan plan_type default 'hobby',
    tokens_remaining int default 10000,
    tokens_monthly_limit int default 10000,
    tokens_used_this_month int default 0,
    max_input_tokens int default 1000,
    stripe_customer_id text,
    billing_cycle_start timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. THREADS TABLE (Conversations)
create table public.threads (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    title text,
    total_tokens_used int default 0,
    is_saved boolean default true,
    expires_at timestamptz, -- For temporary/hobby threads
    last_activity timestamptz default now(),
    created_at timestamptz default now()
);

-- 5. MESSAGES TABLE (Chat History)
create table public.messages (
    id uuid default uuid_generate_v4() primary key,
    thread_id uuid references public.threads(id) on delete cascade not null,
    role message_role not null,
    content text not null,
    tokens_used int default 0, -- Tokens cost of this specific message
    input_tokens int default 0,
    output_tokens int default 0,
    created_at timestamptz default now()
);

-- 6. SCRIPTS TABLE (Saved Code)
create table public.scripts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    thread_id uuid references public.threads(id) on delete set null,
    name text not null,
    description text,
    code text not null,
    strategy_type strategy_type default 'strategy',
    tokens_used int default 0, -- Total cost to generate this script
    is_public boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 7. CACHE TABLE (For AI Responses - Saves Money)
create table public.response_cache (
    id uuid default uuid_generate_v4() primary key,
    prompt_hash text unique not null,
    prompt text not null,
    response text not null,
    tokens_used int default 0,
    created_at timestamptz default now()
);

-- 8. RLS POLICIES (Row Level Security)
alter table public.user_profiles enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.scripts enable row level security;

-- Users can only see their own profile
create policy "Users can view own profile" on public.user_profiles
    for select using (auth.uid() = id);

create policy "Users can update own profile" on public.user_profiles
    for update using (auth.uid() = id);

-- Threads policies
create policy "Users can view own threads" on public.threads
    for select using (auth.uid() = user_id);

create policy "Users can insert own threads" on public.threads
    for insert with check (auth.uid() = user_id);

create policy "Users can update own threads" on public.threads
    for update using (auth.uid() = user_id);

create policy "Users can delete own threads" on public.threads
    for delete using (auth.uid() = user_id);

-- Messages policies (inherited from threads usually, but explicit here)
create policy "Users can view messages in own threads" on public.messages
    for select using (
        exists (select 1 from public.threads where id = messages.thread_id and user_id = auth.uid())
    );

create policy "Users can insert messages in own threads" on public.messages
    for insert with check (
        exists (select 1 from public.threads where id = messages.thread_id and user_id = auth.uid())
    );

-- Scripts policies
create policy "Users can view own scripts" on public.scripts
    for select using (auth.uid() = user_id);

create policy "Users can insert own scripts" on public.scripts
    for insert with check (auth.uid() = user_id);

create policy "Users can update own scripts" on public.scripts
    for update using (auth.uid() = user_id);

create policy "Users can delete own scripts" on public.scripts
    for delete using (auth.uid() = user_id);

-- 9. TRIGGERS (Auto-create profile on signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (id, email, name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 10. INDEXES (Performance)
create index idx_threads_user_id on public.threads(user_id);
create index idx_messages_thread_id on public.messages(thread_id);
create index idx_scripts_user_id on public.scripts(user_id);
create index idx_cache_hash on public.response_cache(prompt_hash);
