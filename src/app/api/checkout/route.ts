import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { checkoutSchema } from '@/lib/schemas';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Validate with Zod
        const result = checkoutSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { variantId } = result.data;

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

    } catch (error: unknown) {
        console.error('Checkout Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
