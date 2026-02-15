export type User = {
    id: string;
    email: string;
    tier?: string;
    gens_monthly_limit?: number;
    gens_remaining?: number;
};

export type Message = {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    gens?: number;
};

export type Conversation = {
    id: string;
    user_id: string;
    title: string;
    created_at?: string;
    updated_at: string;
    total_gens: number;
};

export type QuotaInfo = {
    remaining: number;
    limit: number;
    resetAt: string | null;
    isExceeded: boolean;
    waitSeconds: number;
    tier: string;
};
