import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

// Next.js handles environment variables automatically.
// Manual dotenv can break Vercel Turbopack builds.

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createAdminClient();
    const results: any = {
        timestamp: new Date().toISOString(),
        environment: {
            node_env: process.env.NODE_ENV,
            has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            has_supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            has_supabase_service_key: !!process.env.SUPABASE_SERVICE_KEY,
            has_gemini_key: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_SERVER_KEY),
        },
        database: {
            status: 'unknown',
            tables: {}
        }
    };

    if (!supabase) {
        results.database.status = 'Client Error: Missing Credentials';
        return NextResponse.json(results, { status: 500 });
    }

    try {
        // Check core tables
        const tables = ['user_profiles', 'conversations', 'messages', 'subscriptions'];
        for (const table of tables) {
            const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
            results.database.tables[table] = error ? `Error: ${error.message}` : 'Healthy';
        }
        results.database.status = 'Connected';
    } catch (e: any) {
        results.database.status = `Connection Failed: ${e.message}`;
    }

    return NextResponse.json(results);
}
