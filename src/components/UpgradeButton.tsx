"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function UpgradeButton({ userId, email }: { userId: string, email: string }) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        // Direct link logic for now (Simplest integration)
        // In a real app, you might call an internal API that creates a checkout via Lemon Squeezy SDK to pass custom_data

        // IMPORTANT: You MUST replace this URL with your actual Lemon Squeezy Checkout URL
        // And append ?checkout[custom][user_id]=<userId>
        const checkoutUrl = "https://your-store.lemonsqueezy.com/checkout/buy/variant-id";

        // Construct URL with custom data
        const url = new URL(checkoutUrl);
        url.searchParams.append('checkout[custom][user_id]', userId);
        url.searchParams.append('checkout[email]', email);

        window.open(url.toString(), '_blank');
        setLoading(false);
    };

    return (
        <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
        >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap className="mr-2 fill-white" size={16} />}
            Upgrade to Pro
        </Button>
    );
}
