-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
-- Note: auth.users table is auto-created by Supabase
-- We extend it with user_profiles

CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  
  -- Subscription Info
  plan TEXT NOT NULL DEFAULT 'hobby' CHECK (plan IN ('hobby', 'starter', 'pro', 'business')),
  
  -- Token Management
  tokens_monthly_limit INTEGER NOT NULL DEFAULT 1000,
  tokens_remaining INTEGER NOT NULL DEFAULT 1000,
  tokens_used_this_month INTEGER NOT NULL DEFAULT 0,
  max_input_tokens INTEGER NOT NULL DEFAULT 5000,
  
  -- Billing
  billing_cycle_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  
  -- Preferences
  code_theme TEXT DEFAULT 'dark' CHECK (code_theme IN ('light', 'dark')),
  email_notifications BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);
CREATE INDEX idx_user_profiles_plan ON public.user_profiles(plan);

-- ============================================
-- 2. THREADS TABLE
-- ============================================
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  
  -- Thread Info
  title TEXT NOT NULL DEFAULT 'New Thread',
  
  -- Token Tracking
  total_tokens_used INTEGER NOT NULL DEFAULT 0,
  
  -- Persistence
  is_saved BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ, -- NULL for saved threads, NOW() + 24h for hobby
  
  -- Metadata
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own threads"
  ON public.threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON public.threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON public.threads FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own threads
CREATE POLICY "Users can delete own threads"
  ON public.threads FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_threads_user_id ON public.threads(user_id);
CREATE INDEX idx_threads_created_at ON public.threads(created_at DESC);
CREATE INDEX idx_threads_expires_at ON public.threads(expires_at);
CREATE INDEX idx_threads_is_saved ON public.threads(is_saved);

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads ON DELETE CASCADE,
  
  -- Message Content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  -- Token Tracking
  tokens_used INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages from their threads
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own threads"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- ============================================
-- 4. SCRIPTS TABLE (Saved Scripts)
-- ============================================
CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  thread_id UUID REFERENCES public.threads ON DELETE SET NULL,
  
  -- Script Content
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  strategy_type TEXT CHECK (strategy_type IN ('indicator', 'strategy', 'other')),
  tokens_used INTEGER,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own scripts"
  ON public.scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts"
  ON public.scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON public.scripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts"
  ON public.scripts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX idx_scripts_created_at ON public.scripts(created_at DESC);

-- ============================================
-- 5. TOKEN USAGE TABLE (Analytics)
-- ============================================
CREATE TABLE public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  thread_id UUID REFERENCES public.threads ON DELETE SET NULL,
  
  -- Usage Info
  action TEXT NOT NULL CHECK (action IN ('generate', 'explain', 'refine')),
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL,
  
  -- AI Model
  model TEXT DEFAULT 'gemini-2.0-flash',
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can view own usage"
  ON public.token_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_threads_updated_at
  BEFORE UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON public.scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
