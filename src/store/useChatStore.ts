import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { User, Message, Conversation, QuotaInfo } from '@/lib/types';

// Utility for formatting input
const sanitizeInput = (input: string) => {
    return input
        .trim()
        .slice(0, 2000)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
};

type ChatStore = {
    user: User | null;
    session: any | null; // Supabase session type

    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];

    isGenerating: boolean;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    currentError: string | null;

    quotaInfo: QuotaInfo;

    setUser: (user: User | null) => void;
    setSession: (session: any | null) => void;
    setError: (error: string | null) => void;
    clearError: () => void;

    fetchConversations: () => Promise<void>;
    createConversation: (title?: string) => Promise<string | null>;
    deleteConversation: (id: string) => Promise<void>;
    setActiveConversation: (id: string) => void;

    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    checkRateLimit: () => Promise<any>;
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
        remaining: 1500,
        limit: 1500,
        resetAt: null,
        isExceeded: false,
        waitSeconds: 0,
        tier: 'free',
    },

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setError: (error) => set({ currentError: error }),
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

    createConversation: async (title) => {
        const user = get().user;
        if (!user) return null;

        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user_id: user.id,
                title: title || 'New Conversation',
                total_tokens: 0,
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
            messages: [], // Clear messages for new convo
        }));

        return data.id;
    },

    deleteConversation: async (id) => {
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

    setActiveConversation: (id) => {
        set({ activeConversationId: id });
        get().fetchMessages(id);
    },

    fetchMessages: async (conversationId) => {
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

        const { data, error } = await supabase.rpc('check_rate_limit', { p_user_id: user.id });

        if (error) {
            console.error('Rate limit check failed:', error);
            // Fail open if check fails? Or closed? Let's be permissive if DB is down but warn.
            return { allowed: true };
        }

        set({
            quotaInfo: {
                remaining: data.remaining || 0,
                limit: data.tier === 'pro' ? 100000 : 1500,
                resetAt: data.resetAt,
                isExceeded: !data.allowed,
                waitSeconds: data.waitSeconds || 0,
                tier: data.tier || 'free',
            },
        });
        return data;
    },

    sendMessage: async (content) => {
        const { user, activeConversationId, checkRateLimit } = get();
        if (!user) {
            set({ currentError: "You must be logged in." });
            return;
        }

        // 1. Check Quota
        const rateCheck = await checkRateLimit();
        if (rateCheck && !rateCheck.allowed) {
            set({
                currentError: rateCheck.reason === 'daily_quota_exceeded'
                    ? `Daily quota exceeded. Resets at ${new Date(rateCheck.resetAt).toLocaleString()}`
                    : `Rate limit exceeded. Wait ${rateCheck.waitSeconds} seconds.`,
            });
            return;
        }

        let conversationId = activeConversationId;
        // 2. Auto-create conversation if none active
        if (!conversationId) {
            conversationId = await get().createConversation(content.slice(0, 30) + '...');
            if (!conversationId) return; // Error handled inside createConversation
        }

        // 3. Save User Message
        const { data: userMessage, error: userError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: 'user',
                content: sanitizeInput(content),
                tokens: 0,
            })
            .select()
            .single();

        if (userError) {
            set({ currentError: userError.message });
            return;
        }

        // Optimistic UI update
        set((state) => ({
            messages: [...state.messages, userMessage],
            isGenerating: true,
        }));

        try {
            // 4. Call API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: get().messages.map(m => ({ role: m.role, content: m.content })),
                    conversationId: conversationId,
                }),
            });

            if (!response.ok) throw new Error('AI generation failed');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            let loop = true;

            // 5. Stream Handling
            while (loop) {
                const { done, value } = await reader.read();
                if (done) {
                    loop = false;
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                // We expect SSE format: 'data: {"text": "..."}\n\n'
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
                                // Optional: Update a "streaming" message in UI here if needed
                                // set(state => ({ streamingMessageContent: aiResponse })); 
                            }
                        } catch (e) {
                            // ignore partial JSON parse errors
                        }
                    }
                }
            }

            // 6. Save Assistant Message
            const { data: aiMessage, error: aiError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: aiResponse,
                    tokens: Math.ceil(aiResponse.length / 4),
                })
                .select()
                .single();

            if (aiError) throw aiError;

            set((state) => ({
                messages: [...state.messages, aiMessage],
                isGenerating: false,
            }));

            // 7. Update Quota
            await supabase.rpc('record_request', {
                p_user_id: user.id,
                p_tokens_used: 1 // Increment by 1 request as per checklist daily limit logic
            });
            await checkRateLimit();

        } catch (error: any) {
            set({ currentError: error.message, isGenerating: false });
        }
    },
}));
