-- ============================================
-- ATOMIC SECURITY PATCH
-- ============================================

-- This function deducts tokens atomically to prevent race conditions
-- It checks the balance and updates the user profile in a single transaction
CREATE OR REPLACE FUNCTION public.deduct_user_tokens(
    p_user_id UUID,
    p_tokens_to_deduct INTEGER,
    p_thread_id UUID,
    p_action TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tokens_remaining INTEGER;
    v_updated_profile RECORD;
BEGIN
    -- 1. Get current balance with a row-level lock (FOR UPDATE)
    SELECT tokens_remaining INTO v_tokens_remaining
    FROM public.user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- 2. Check if user has enough tokens
    IF v_tokens_remaining < p_tokens_to_deduct THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'insufficient_tokens',
            'remaining', v_tokens_remaining
        );
    END IF;

    -- 3. Update user profile
    UPDATE public.user_profiles
    SET 
        tokens_remaining = tokens_remaining - p_tokens_to_deduct,
        tokens_used_this_month = tokens_used_this_month + p_tokens_to_deduct,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING * INTO v_updated_profile;

    -- 4. Record usage in analytics table
    INSERT INTO public.token_usage (
        user_id,
        thread_id,
        action,
        total_tokens,
        model,
        created_at
    ) VALUES (
        p_user_id,
        p_thread_id,
        p_action,
        p_tokens_to_deduct,
        'gemini-2.0-flash',
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', to_jsonb(v_updated_profile)
    );
END;
$$;
