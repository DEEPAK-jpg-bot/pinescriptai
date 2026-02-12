"use client";

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useChatStore } from '@/store/useChatStore';

/**
 * AuthSync Component
 * Automatically synchronizes the Supabase session and user state 
 * with the global Zustand store across the entire application.
 */
export default function AuthSync() {
    const supabase = createClient();
    const { setUser, setSession, fetchConversations, checkRateLimit } = useChatStore();

    useEffect(() => {
        // 1. Initial Session Check
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email! });
                setSession(session);
                // Pre-fetch data if user exists
                fetchConversations();
                checkRateLimit();
            }
        };
        initSession();

        // 2. Listen for Auth Changes (Sign In, Sign Out, Token Refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email! });
                setSession(session);
            } else {
                setUser(null);
                setSession(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setSession, fetchConversations, checkRateLimit, supabase]);

    return null; // This is a logic-only component
}
