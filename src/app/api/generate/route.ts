import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Google AI
const apiKey = process.env.GOOGLE_AI_SERVER_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Must use Service Key for RLS bypass to check sub if needed, or rely on RLS
// Ideally we rely on token validation.
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increased duration for detailed response

import { generateSchema } from '@/lib/schemas';

// ... (existing imports)

export async function POST(req: Request) {
    if (!apiKey) return NextResponse.json({ error: 'Google AI API key not configured' }, { status: 500 });

    try {
        // ... (auth logic)
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

        // ... (quota logic)
        const { data: profile } = await supabase.from('user_profiles').select('tokens_remaining, tier').eq('id', user.id).single();

        if (profile) {
            if (profile.tokens_remaining <= 0) {
                return NextResponse.json({ error: 'Quota exceeded. Please upgrade to Pro.' }, { status: 429 });
            }
        }

        // 3. Parse Body & Validate
        const body = await req.json();
        const validation = generateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { messages } = validation.data;

        // 4. Prepare Prompt
        const lastMessage = messages[messages.length - 1];

        // This System Prompt is derived from your rag.md file
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
- If the user asks to "fix" code, explain the specific v6 breaking change you fixed (e.g. "Removed deprecated 'transp' parameter").

---USER_PROMPT_START---
${lastMessage.content}
---USER_PROMPT_END---`;

        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 5. Call Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.5, // Lower temperature for code precision
                maxOutputTokens: 8192,
            }
        });

        const chat = model.startChat({
            history: history,
            systemInstruction: systemPrompt
        });

        // 6. Stream Response
        const result = await chat.sendMessageStream(lastMessage.content);

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

                    // 7. Deduct Token Quota (Server-side enforcement)
                    // We do this asynchronously or after stream? 
                    // Ideally we decrement 1 "request" credit here.
                    await supabase.rpc('record_request', { p_user_id: user.id, p_tokens_used: 1 });

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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
