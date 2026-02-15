import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Supabase configuration missing.');
        }

        const missingKeyError = () => {
            const msg = "Supabase credentials missing. Check your environment variables.";
            throw new Error(msg);
        };

        // Return a structural fallback to avoid early crashes in CI or build steps
        return {
            auth: {
                signInWithOAuth: missingKeyError,
                signInWithPassword: missingKeyError,
                signUp: missingKeyError,
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                getUser: async () => ({ data: { user: null }, error: null }),
                signOut: async () => { },
            },
            from: () => ({
                select: () => ({
                    order: () => ({ limit: () => ({ data: [], error: null }), eq: () => ({ single: () => ({ data: null, error: null }) }) }),
                    eq: () => ({ single: () => ({ data: null, error: null }) })
                }),
                insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
                update: () => ({ eq: () => ({ data: null, error: null }) }),
                delete: () => ({ eq: () => ({ error: null }) }),
            }),
            rpc: async () => ({ data: null, error: null }),
        } as unknown as SupabaseClient;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
