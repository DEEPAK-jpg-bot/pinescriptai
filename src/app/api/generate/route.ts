import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Google AI
const apiKey = process.env.GOOGLE_AI_SERVER_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize Supabase (Service Role optional, but safer to use Standard Client if possible, 
// but checklist implies server-side operations. We will use the client created with env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Prefer Service Key for server ops if available, else Anon
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 30; // 30s timeout as per checklist

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: 'Google AI API key not configured' }, { status: 500 });
    }

    try {
        // 1. Verify Auth
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { messages, conversationId } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        // 3. Prepare Prompt
        const lastMessage = messages[messages.length - 1];
        const systemPrompt = `You are an expert Pine Script v6 developer for TradingView. Generate clean, production-ready code.

RULES:
1. ALWAYS use Pine Script v6 syntax (start with //@version=6)
2. For indicators: Use indicator() function
3. For strategies: Use strategy() function with strategy.entry() and strategy.exit()
4. Include input parameters for all configurable values
5. Add clear comments explaining complex logic
6. Follow TradingView naming conventions (camelCase)
7. Include plot() statements for visual output
8. Keep explanation brief and focused.

OUTPUT FORMAT:
1. Provide complete Pine Script code in a \`\`\`pinescript code block
2. Then provide brief explanation of strategy/indicator logic

---USER_PROMPT_START---
${lastMessage.content}
---USER_PROMPT_END---`;

        // 4. Format History (excluding last message which is in system prompt context/user prompt)
        // Actually, Gemini expects history + new message.
        // Checklist says: history: slice(0, -1), message: last.
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 5. Call Gemini
        // Checklist requested 'gemini-2.0-flash-exp'. If unavailable, fallback logic isn't here but user can change string.
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.7,
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
                } catch (e) {
                    console.error('Streaming error:', e);
                    controller.error(e);
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
