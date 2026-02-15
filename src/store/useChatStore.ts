import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { User, Message, Conversation, QuotaInfo } from '@/lib/types';
import { Session } from '@supabase/supabase-js';

// Utility for formatting input
const sanitizeInput = (input: string) => {
    return input
        .trim()
        .slice(0, 2000)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
};

interface RateLimitResponse {
    allowed: boolean;
    remaining?: number;
    resetAt?: string | null;
    tier?: string;
    reason?: string;
    waitSeconds?: number;
}

type ChatStore = {
    user: User | null;
    session: Session | null;

    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];

    isGenerating: boolean;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    currentError: string | null;

    quotaInfo: QuotaInfo;

    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setError: (error: string | null) => void;
    clearError: () => void;

    fetchConversations: () => Promise<void>;
    createConversation: (title?: string) => Promise<string | null>;
    deleteConversation: (id: string) => Promise<void>;
    renameConversation: (id: string, title: string) => Promise<void>;
    setActiveConversation: (id: string) => void;

    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    checkRateLimit: () => Promise<RateLimitResponse>;
};

const supabase = createClient();

export const useChatStore = create<ChatStore>((set, get) => ({
    user: null,
    session: null,
    conversations: [],
    activeConversationId: null,
    messages: [],
    isGenerating: false,
    isLoadingConversations: false,
    isLoadingMessages: false,
    currentError: null,
    quotaInfo: {
        remaining: 10,
        limit: 10,
        resetAt: null,
        isExceeded: false,
        waitSeconds: 0,
        tier: 'free',
    },

    setUser: (user: User | null) => set({ user }),
    setSession: (session: Session | null) => set({ session }),
    setError: (error: string | null) => set({ currentError: error }),
    clearError: () => set({ currentError: null }),

    fetchConversations: async () => {
        set({ isLoadingConversations: true });
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(50);

        if (error) {
            set({ currentError: error.message, isLoadingConversations: false });
            return;
        }
        set({ conversations: data as Conversation[] || [], isLoadingConversations: false });
    },

    createConversation: async (title?: string) => {
        const user = get().user;
        if (!user) return null;

        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user_id: user.id,
                title: title || 'New Conversation',
                total_gens: 0,
            })
            .select()
            .single();

        if (error) {
            set({ currentError: error.message });
            return null;
        }

        set((state) => ({
            conversations: [data, ...state.conversations],
            activeConversationId: data.id,
            messages: [],
        }));

        return data.id;
    },

    deleteConversation: async (id: string) => {
        const { error } = await supabase.from('conversations').delete().eq('id', id);
        if (error) {
            set({ currentError: error.message });
            return;
        }
        set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
    },

    renameConversation: async (id: string, title: string) => {
        if (!title.trim()) return;
        const { error } = await supabase.from('conversations').update({ title: title.trim() }).eq('id', id);
        if (error) {
            set({ currentError: error.message });
            return;
        }
        set((state) => ({
            conversations: state.conversations.map((c) => c.id === id ? { ...c, title: title.trim() } : c)
        }));
    },

    setActiveConversation: (id: string) => {
        set({ activeConversationId: id });
        get().fetchMessages(id);
    },

    fetchMessages: async (conversationId: string) => {
        if (!conversationId) return;
        set({ isLoadingMessages: true });
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            set({ currentError: error.message, isLoadingMessages: false });
            return;
        }
        set({ messages: data as Message[] || [], isLoadingMessages: false });
    },

    checkRateLimit: async () => {
        const user = get().user;
        if (!user) return { allowed: false };

        const { data, error } = await supabase.rpc('check_gen_quota', { p_user_id: user.id });

        if (error) {
            console.error('Rate limit check failed:', error);
            return { allowed: true };
        }

        const safeLimit = data.limit || 10;
        set({
            quotaInfo: {
                remaining: (data.remaining !== undefined && data.remaining !== null) ? data.remaining : safeLimit,
                limit: safeLimit,
                resetAt: data.resetAt,
                isExceeded: !data.allowed,
                waitSeconds: data.waitSeconds || 0,
                tier: data.tier || 'free',
            },
        });
        return data;
    },

    sendMessage: async (content: string) => {
        const { user, activeConversationId, checkRateLimit, setError } = get();
        if (!user) {
            setError("You must be logged in to generate logic.");
            return;
        }

        // 1. Initial State Activation
        set({ isGenerating: true, currentError: null });

        try {
            const sanitized = sanitizeInput(content);
            if (!sanitized) {
                set({ isGenerating: false });
                return;
            }

            // 2. Quota Verification
            const rateCheck = await checkRateLimit();
            if (rateCheck && !rateCheck.allowed) {
                set({
                    currentError: rateCheck.reason === 'daily_quota_exceeded'
                        ? `Daily quota exceeded. Resets at ${new Date(rateCheck.resetAt!).toLocaleString()}`
                        : `Protocol Execution Blocked: ${rateCheck.reason || 'Insufficient Quota'}`,
                    isGenerating: false
                });
                return;
            }

            // 3. Conversation Resolution
            let conversationId = activeConversationId;
            if (!conversationId) {
                conversationId = await get().createConversation(sanitized.slice(0, 30) + '...');
                if (!conversationId) {
                    throw new Error("Failed to initialize logic session.");
                }
            }

            // 4. Optimistic Message Display
            const tempUserMsg: Message = {
                role: 'user',
                content: sanitized,
                conversation_id: conversationId,
                created_at: new Date().toISOString(),
                id: 'temp-' + Date.now()
            } as any;

            set((state) => ({
                messages: [...state.messages, tempUserMsg],
            }));

            // 5. Database Synchronization (User Message)
            const { data: userMessage, error: userError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    role: 'user',
                    content: sanitized,
                    gens: 0,
                })
                .select()
                .single();

            if (userError) throw userError;

            // Replace temp user message with DB version (to get real ID)
            set((state) => ({
                messages: state.messages.map(m => m.id === tempUserMsg.id ? userMessage : m),
            }));

            // 6. AI Placeholder Initialization
            set((state) => ({
                messages: [
                    ...state.messages,
                    { role: 'assistant', content: '', id: 'temp-ai', conversation_id: conversationId, created_at: new Date().toISOString() } as any
                ]
            }));

            try {
                let response;
                let attempt = 0;
                const maxAttempts = 3;

                while (attempt < maxAttempts) {
                    try {
                        if (attempt > 0) await new Promise(r => setTimeout(r, 1000));

                        let { session } = get();
                        if (!session) {
                            const { data } = await supabase.auth.getSession();
                            session = data.session;
                            set({ session });
                        }

                        response = await fetch('/api/generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session?.access_token}`
                            },
                            body: JSON.stringify({
                                messages: get().messages.filter(m => m.id !== 'temp-ai').map(m => ({ role: m.role, content: m.content })),
                                conversationId: conversationId,
                            }),
                        });

                        if (response.ok) break;
                        if (response.status !== 429 && response.status < 500) break;
                    } catch (e) {
                        if (attempt === maxAttempts - 1) throw e;
                    }
                    attempt++;
                }

                if (!response || !response.ok) {
                    const errorData = await response?.json().catch(() => ({}));
                    const errorMessage = errorData?.suggestion
                        ? `${errorData.error} - ${errorData.suggestion}`
                        : (errorData?.error || 'AI generation failed');
                    throw new Error(errorMessage);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) throw new Error('No response body');

                let aiResponse = '';
                let loop = true;

                while (loop) {
                    const { done, value } = await reader.read();
                    if (done) {
                        loop = false;
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') {
                                loop = false;
                                break;
                            }
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    aiResponse += parsed.text;
                                    // Simple update strategy
                                    set((state) => ({
                                        messages: state.messages.map(m =>
                                            m.id === 'temp-ai' ? { ...m, content: aiResponse } : m
                                        )
                                    }));
                                }
                            } catch { /* ignore */ }
                        }
                    }
                }

                // Save AI Message
                const { data: aiMessage, error: aiError } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversationId,
                        role: 'assistant',
                        content: aiResponse,
                        gens: 1,
                    })
                    .select()
                    .single();

                if (aiError) throw aiError;

                // Final Update: Swap temp for real
                set((state) => ({
                    messages: [...state.messages.filter(m => m.id !== 'temp-ai'), aiMessage],
                    isGenerating: false,
                }));

                await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
                await checkRateLimit();

            } catch (innerError: any) {
                // If anything fails in the stream, clean up the temp AI message
                set((state) => ({
                    messages: state.messages.filter(m => m.id !== 'temp-ai'),
                    isGenerating: false,
                    currentError: innerError.message || 'Logic generation failed.'
                }));
            }
        } catch (outerError: any) {
            set({
                currentError: outerError.message || 'Protocol Failure.',
                isGenerating: false
            });
        }
    },
}));
