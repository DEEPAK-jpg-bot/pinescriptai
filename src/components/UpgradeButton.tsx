"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function UpgradeButton({ userId, email }: { userId: string, email: string }) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // Replace with your actual Variant ID from Lemon Squeezy product settings
            const variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID || "567890"; // Fallback/Test ID

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId,
                    userId,
                    email
                })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Payment failed to initiate';
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap className="mr-2 fill-white" size={16} />}
            Upgrade to Pro
        </Button>
    );
}
