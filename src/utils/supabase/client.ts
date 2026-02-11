import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase configuration missing. Auth will be disabled.');
        // Return a dummy object to prevent "cannot read property of null"
        return {
            auth: {
                signInWithOAuth: async () => { throw new Error("Supabase keys are missing. Please connect Supabase in Vercel settings.") },
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                getUser: async () => ({ data: { user: null }, error: null }),
                signOut: async () => { },
            },
            from: () => ({
                select: () => ({ order: () => ({ limit: () => ({ data: [], error: null }), eq: () => ({ single: () => ({ data: null, error: null }) }) }), eq: () => ({ single: () => ({ data: null, error: null }) }) }),
                insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
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
