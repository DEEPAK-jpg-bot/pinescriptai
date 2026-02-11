export type User = {
    id: string;
    email: string;
    tier?: string;
    tokens_monthly_limit?: number;
    tokens_remaining?: number;
};

export type Message = {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    tokens?: number;
};

export type Conversation = {
    id: string;
    user_id: string;
    title: string;
    created_at?: string;
    updated_at: string;
    total_tokens: number;
};

export type QuotaInfo = {
    remaining: number;
    limit: number;
    resetAt: string | null;
    isExceeded: boolean;
    waitSeconds: number;
    tier: string;
};
