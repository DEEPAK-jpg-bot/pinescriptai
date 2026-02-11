import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { variantId } = await req.json();

        if (!variantId) {
            return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 });
        }

        // Initialize LS
        lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

        // Create Checkout Session
        const checkout = await createCheckout(
            process.env.LEMONSQUEEZY_STORE_ID!,
            variantId,
            {
                checkoutData: {
                    email: user.email,
                    custom: {
                        user_id: user.id
                    }
                },
                productOptions: {
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                }
            }
        );

        return NextResponse.json({ url: checkout.data?.data.attributes.url });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
