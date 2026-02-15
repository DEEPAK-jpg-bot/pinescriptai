import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase configuration missing. Auth will be disabled.');
        // Return a dummy object to prevent "cannot read property of null"
        const missingKeyError = () => {
            const msg = "Supabase configuration missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel Environment Variables.";
            console.error(msg);
            throw new Error(msg);
        };

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
                select: () => ({ order: () => ({ limit: () => ({ data: [], error: null }), eq: () => ({ single: () => ({ data: null, error: null }) }) }), eq: () => ({ single: () => ({ data: null, error: null }) }) }),
                insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
                update: () => ({ eq: () => ({ data: null, error: null }) }),
                delete: () => ({ eq: () => ({ error: null }) }),
            }),
            rpc: async () => ({ data: null, error: null }),
        } as any;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
