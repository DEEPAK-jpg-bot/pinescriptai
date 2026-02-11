import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

// Ensure this is called
export const configureLemonSqueezy = () => {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
        // console.warn("LEMONSQUEEZY_API_KEY is missing"); // Avoid log spam in build
        return;
    }
    lemonSqueezySetup({ apiKey });
};
