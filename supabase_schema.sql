-- PINESCRIPT AI: MASTER COMMERCIAL SCHEMA v2.0
-- 1. AGGRESSIVE CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.check_token_quota(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.deduct_user_tokens(uuid, int, uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.record_request(uuid, int) CASCADE;
DROP FUNCTION IF EXISTS public.check_rate_limit(uuid) CASCADE;

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;

-- 2. UTILS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CORE TABLES
-- User Profiles (The Central Logic Node)
CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'trader', 'pro_trader')),
  tokens_monthly_limit bigint DEFAULT 10,
  tokens_remaining bigint DEFAULT 10,
  last_reset_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversations (Connected to Profiles)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  total_tokens bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages (Connected to Conversations)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  tokens bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions (Connected to Profiles)
CREATE TABLE public.subscriptions (
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
CREATE TABLE public.webhook_events (
  id bigserial PRIMARY KEY,
  event_type text,
  payload jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. PERFORMANCE INDICES
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 5. SECURITY & PERMISSIONS (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users manage own convs" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage messages" ON public.messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users view own subs" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 6. ENGINE FUNCTIONS
-- Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, tier, tokens_monthly_limit, tokens_remaining)
  VALUES (new.id, new.email, 'free', 10, 10);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Atomic Token Deduction (One-Way / No Reversal)
CREATE OR REPLACE FUNCTION public.deduct_user_tokens(
    p_user_id uuid, 
    p_tokens_to_deduct int,
    p_unused_1 uuid DEFAULT NULL,
    p_unused_2 text DEFAULT NULL
)
RETURNS json AS $$
DECLARE v_remaining bigint;
BEGIN
    UPDATE public.user_profiles
    SET tokens_remaining = tokens_remaining - p_tokens_to_deduct, updated_at = now()
    WHERE id = p_user_id AND tokens_remaining >= p_tokens_to_deduct
    RETURNING tokens_remaining INTO v_remaining;
    
    IF v_remaining IS NULL THEN 
        RETURN json_build_object('success', false, 'error', 'insufficient_quota'); 
    END IF;
    
    RETURN json_build_object('success', true, 'data', json_build_object('tokens_remaining', v_remaining));
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Monthly Quota Check & Reset
CREATE OR REPLACE FUNCTION public.check_token_quota(p_user_id uuid)
RETURNS json AS $$
DECLARE v_profile record;
BEGIN
  SELECT * INTO v_profile FROM public.user_profiles WHERE id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN json_build_object('allowed', false, 'reason', 'profile_not_found');
  END IF;

  -- 30-Day Monthly Cycle Reset
  IF v_profile.last_reset_at < now() - interval '30 days' THEN
    UPDATE public.user_profiles 
    SET tokens_remaining = tokens_monthly_limit, 
        last_reset_at = now() 
    WHERE id = p_user_id;
    
    RETURN json_build_object(
        'allowed', true, 
        'remaining', v_profile.tokens_monthly_limit, 
        'limit', v_profile.tokens_monthly_limit, 
        'tier', v_profile.tier
    );
  END IF;

  RETURN json_build_object(
      'allowed', v_profile.tokens_remaining > 0,
      'remaining', v_profile.tokens_remaining,
      'limit', v_profile.tokens_monthly_limit,
      'tier', v_profile.tier,
      'resetAt', v_profile.last_reset_at + interval '30 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RELOAD
NOTIFY pgrst, 'reload schema';
