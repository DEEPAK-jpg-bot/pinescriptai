-- PINESCRIPT AI: MASTER COMMERCIAL SCHEMA v4.0 (Non-Destructive Update)
-- 1. UTILS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create strategy_type Enum safely
DO $$ BEGIN
    CREATE TYPE public.strategy_type AS ENUM ('indicator', 'strategy', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CORE TABLES (Ensuring non-destruction)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'trader', 'pro_trader')),
  gens_monthly_limit bigint DEFAULT 10,
  gens_remaining bigint DEFAULT 10,
  last_reset_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add is_saved to conversations if missing
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  total_gens bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$ BEGIN
    ALTER TABLE public.conversations ADD COLUMN is_saved boolean DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  gens bigint DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Saved Scripts (Institutional Storage)
CREATE TABLE IF NOT EXISTS public.saved_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  code text NOT NULL,
  version text DEFAULT 'v6',
  type public.strategy_type DEFAULT 'strategy',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Response Cache (Performance & Cost Optimization)
CREATE TABLE IF NOT EXISTS public.response_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash text UNIQUE NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  plan_id text,
  current_period_end timestamptz,
  customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhook Audit Log
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id bigserial PRIMARY KEY,
  event_type text,
  payload jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. PERFORMANCE INDICES (Safe)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON public.saved_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_cache_hash ON public.response_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 4. SECURITY & PERMISSIONS (Safe)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Re-runable Policies
DROP POLICY IF EXISTS "Users view own profile" ON public.user_profiles;
CREATE POLICY "Users view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own convs" ON public.conversations;
CREATE POLICY "Users manage own convs" ON public.conversations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage messages" ON public.messages;
CREATE POLICY "Users manage messages" ON public.messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users manage own scripts" ON public.saved_scripts;
CREATE POLICY "Users manage own scripts" ON public.saved_scripts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public view scripts" ON public.saved_scripts;
CREATE POLICY "Public view scripts" ON public.saved_scripts FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users view cache" ON public.response_cache;
CREATE POLICY "Users view cache" ON public.response_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users view own subs" ON public.subscriptions;
CREATE POLICY "Users view own subs" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 5. ENGINE FUNCTIONS (Atomic Overwrite)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, tier, gens_monthly_limit, gens_remaining)
  VALUES (new.id, new.email, 'free', 10, 10)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe Trigger Attach
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- Atomic Generation Deduction with Conversation Sync
CREATE OR REPLACE FUNCTION public.deduct_user_gens(
    p_user_id uuid, 
    p_gens_to_deduct int,
    p_conversation_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE v_remaining bigint;
BEGIN
    -- 1. Deduct from Profile
    UPDATE public.user_profiles
    SET gens_remaining = gens_remaining - p_gens_to_deduct, updated_at = now()
    WHERE id = p_user_id AND gens_remaining >= p_gens_to_deduct
    RETURNING gens_remaining INTO v_remaining;
    
    IF v_remaining IS NULL THEN 
        RETURN json_build_object('success', false, 'error', 'insufficient_quota'); 
    END IF;

    -- 2. Sync with Conversation Analytics
    IF p_conversation_id IS NOT NULL THEN
        UPDATE public.conversations
        SET total_gens = total_gens + p_gens_to_deduct, updated_at = now()
        WHERE id = p_conversation_id;
    END IF;
    
    RETURN json_build_object('success', true, 'data', json_build_object('gens_remaining', v_remaining));
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Monthly Quota Check & Reset (with Auto-Recovery)
CREATE OR REPLACE FUNCTION public.check_gen_quota(p_user_id uuid)
RETURNS json AS $$
DECLARE 
  v_profile record;
  v_user_email text;
BEGIN
  SELECT * INTO v_profile FROM public.user_profiles WHERE id = p_user_id;
  
  -- AUTO-RECOVERY
  IF v_profile IS NULL THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
    IF v_user_email IS NOT NULL THEN
      INSERT INTO public.user_profiles (id, email, tier, gens_monthly_limit, gens_remaining)
      VALUES (p_user_id, v_user_email, 'free', 10, 10)
      RETURNING * INTO v_profile;
    ELSE
      RETURN json_build_object('allowed', false, 'reason', 'profile_not_found');
    END IF;
  END IF;

  -- 30-Day Cycle Reset
  IF v_profile.last_reset_at < now() - interval '30 days' THEN
    UPDATE public.user_profiles 
    SET gens_remaining = v_profile.gens_monthly_limit, last_reset_at = now() 
    WHERE id = p_user_id;
    
    RETURN json_build_object(
        'allowed', true, 
        'remaining', v_profile.gens_monthly_limit, 
        'limit', v_profile.gens_monthly_limit, 
        'tier', v_profile.tier
    );
  END IF;

  RETURN json_build_object(
      'allowed', v_profile.gens_remaining > 0,
      'remaining', v_profile.gens_remaining,
      'limit', v_profile.gens_monthly_limit,
      'tier', v_profile.tier,
      'resetAt', (v_profile.last_reset_at + interval '30 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RELOAD
NOTIFY pgrst, 'reload schema';
