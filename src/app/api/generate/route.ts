import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
// Next.js automatically loads environment variables from .env / .env.local
// Manual dotenv config can break Vercel Turbopack builds

// Initialize Google AI
// Moved inside POST to use dynamic API keys and avoid initialization errors
// in environments without initial env vars.

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increased duration for detailed response

import { generateSchema } from '@/lib/schemas';

// ... (existing imports)

export async function POST(req: Request) {
    const dynamicApiKey = process.env.GOOGLE_AI_SERVER_KEY || process.env.GEMINI_API_KEY || '';

    if (!dynamicApiKey) {
        return NextResponse.json({ error: 'AI Service configuration missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(dynamicApiKey);

    const supabase = createAdminClient();
    if (!supabase) {
        console.error('Supabase admin client not initialized');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    try {
        // ... (auth logic)
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth Verification Failed:', {
                message: authError?.message,
                status: authError?.status,
                tokenPresent: !!token,
                tokenLength: token?.length
            });
            return NextResponse.json({
                error: `Authentication failed: ${authError?.message || 'Invalid session'}. Please refresh the page.`
            }, { status: 401 });
        }

        // 2. Quota & Reset Logic (Trigger via RPC)
        const { data: quota, error: quotaError } = await supabase.rpc('check_gen_quota', { p_user_id: user.id });

        if (quotaError) {
            console.error('Quota Check Failed:', quotaError);
            return NextResponse.json({
                error: `Failed to verify account quota: ${quotaError.message}. (Note: Ensure Supabase functions are updated with the latest supabase_schema.sql)`
            }, { status: 500 });
        }

        if (quota && !quota.allowed) {
            return NextResponse.json({
                error: `Quota exceeded: ${quota.reason === 'daily_quota_exceeded' ? 'You have used your daily limit.' : quota.reason}. Resets at: ${quota.resetAt}`
            }, { status: 429 });
        }

        // 3. Parse Body & Validate
        const body = await req.json();
        const validation = generateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { messages } = validation.data;

        // 4. Prepare Prompt Rules (Clean System Instruction)
        const systemPrompt = `You are an expert Pine Script v6 developer for TradingView. 
STRICT V6 RULES:
1. ALWAYS start with \`//@version=6\`.
2. NEVER use \`transp\` parameter in color functions. Use \`color.new(color.red, 50)\`.
3. \`int\`/\`float\` are NOT auto-cast to \`bool\`. Use \`bool(nz(val))\` for conditions.
4. Boolean values can NEVER be \`na\`.
5. Use \`for i in range(start, end)\` for loops. Old \`for i = 0 to 10\` syntax is REMOVED.
6. Arrays: Use \`array.get(arr, index)\`. Indexing \`arr[0]\` is INVALID.
7. Use \`indicator()\` or \`strategy()\` declaration immediately after version.

OUTPUT INSTRUCTIONS:
- Return ONLY the valid Pine Script code in a \`\`\`pinescript block.
- Followed by a very short explanation.
- If the user asks to "fix" code, explain the specific v6 breaking change you fixed (e.g. "Removed deprecated 'transp' parameter").`;

        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 5. Model Fallback Logic (Total Resilience v3)
        // Using versioned names + explicit API versioning to bypass regional 404s
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash-8b',
            'gemini-pro'
        ];

        let result;
        let lastGenerationError;
        let firstGenerationError;

        for (const modelId of modelsToTry) {
            try {
                // Try stable v1 first for these models
                const testModel = genAI.getGenerativeModel({
                    model: modelId,
                    systemInstruction: {
                        role: 'system',
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 8192,
                    }
                }, { apiVersion: 'v1' });

                const chat = testModel.startChat({ history });

                // Verify connectivity with a real stream initiation
                const lastMessage = messages[messages.length - 1];
                result = await chat.sendMessageStream(lastMessage.content);

                console.log(`Verified stable link with: ${modelId} (v1)`);
                break;
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                console.warn(`v1 check failed for ${modelId}: ${msg}. Trying v1beta...`);

                try {
                    // Fallback to v1beta for the same model
                    const betaModel = genAI.getGenerativeModel({
                        model: modelId,
                        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
                        generationConfig: { temperature: 0.5, maxOutputTokens: 8192 }
                    }, { apiVersion: 'v1beta' });

                    const betaChat = betaModel.startChat({ history });
                    const lastMessage = messages[messages.length - 1];
                    result = await betaChat.sendMessageStream(lastMessage.content);

                    console.log(`Verified beta link with: ${modelId} (v1beta)`);
                    break;
                } catch (be: unknown) {
                    const bMsg = be instanceof Error ? be.message : String(be);
                    console.error(`Both v1 and v1beta failed for ${modelId}: ${bMsg}`);
                    if (!firstGenerationError) firstGenerationError = be;
                    lastGenerationError = be;
                }
            }
        }

        if (!result) {
            const primaryErr = firstGenerationError instanceof Error ? firstGenerationError.message : 'Primary connection failed';
            const lastErr = lastGenerationError instanceof Error ? lastGenerationError.message : 'All failover gates exhausted';
            throw new Error(`AI Service Unavailable. Connection diagnostics: [Primary: ${primaryErr}] [Final: ${lastErr}]. Verify your API key has "Generative Language API" enabled in Google AI Studio.`);
        }

        // 6. Stream Response Handler

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));

                    await supabase.rpc('deduct_user_gens', {
                        p_user_id: user.id,
                        p_gens_to_deduct: 1
                    });

                } catch (e: unknown) {
                    controller.error(e);
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
        });

    } catch (error: unknown) {
        console.error('API Error:', error);

        const errorMsg = error instanceof Error ? error.message : String(error);
        const status = (error as { status?: number })?.status || (errorMsg.includes('429') ? 429 : 500);

        // Return a clear diagnostic message
        return NextResponse.json({
            error: `AI Service Error (${status}): ${errorMsg}`,
            suggestion: status === 429 ? 'You may have reached your Google AI daily quota or per-minute rate limit. Please try again later or check your Google Cloud console.' : 'Please try refreshing the page.'
        }, { status });
    }
}
