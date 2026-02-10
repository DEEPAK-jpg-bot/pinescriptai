-- ============================================
-- AFFILIATION SYSTEM SCHEMA
-- ============================================

-- 1. INFLUENCERS TABLE
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate_percent FLOAT NOT NULL DEFAULT 10.0,
  
  -- Payout Info
  total_earned DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  stripe_account_id TEXT, -- For Stripe Connect payouts if needed later
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Influencers can view own data"
  ON public.influencers FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_influencers_referral_code ON public.influencers(referral_code);

-- 2. UPDATE USER PROFILES
ALTER TABLE public.user_profiles 
ADD COLUMN referred_by_code TEXT;

-- 3. COMMISSIONS TABLE
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subscription_id TEXT, -- Stripe Subscription ID
  checkout_session_id TEXT, -- Stripe Checkout Session ID
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  
  -- Metadata
  is_first_payment BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Influencers can view own commissions"
  ON public.commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.influencers
      WHERE influencers.id = commissions.influencer_id
      AND influencers.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_commissions_influencer_id ON public.commissions(influencer_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_referred_user ON public.commissions(referred_user_id);

-- 4. TRIGGER FOR UPDATED_AT
CREATE TRIGGER update_influencers_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
