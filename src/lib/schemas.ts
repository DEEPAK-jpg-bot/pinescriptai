import { z } from 'zod';

// Checkout Schema
export const checkoutSchema = z.object({
    variantId: z.string().min(1, 'Variant ID is required'),
    userId: z.string().optional(), // Passed for linking if needed
});

// Generate Request Schema
export const messageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Message content cannot be empty'),
});

export const generateSchema = z.object({
    messages: z.array(messageSchema).min(1, 'At least one message is required'),
});

// Webhook Payload Schema (simplified for validation)
export const webhookSchema = z.object({
    meta: z.object({
        event_name: z.string(),
        custom_data: z.any().optional(),
    }),
    data: z.any(),
});
