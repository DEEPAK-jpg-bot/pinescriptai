# PineGen Commercial Deployment Guide

## 💰 Lemon Squeezy Integration (Phase 1 Complete)

### 1. Webhook Endpoint
The endpoint is live at `/api/webhooks/lemonsqueezy`.
It handles:
- `subscription_created` -> Sets User Tier to 'pro'.
- `subscription_cancelled` -> Updates status.
- `subscription_expired` -> Downgrades to 'free'.

## 🚀 Final Steps to Launch (CRITICAL)

### 1. Configure Vercel Environment Variables
Since `.env.local` is ignored by GitHub for security, you MUST manually add these keys to your **Vercel Project Settings**:

Go to: `Vercel Dashboard` > `pinescript-ai` > `Settings` > `Environment Variables`

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `LEMONSQUEEZY_API_KEY` | `eyJ0e...` | Private Store API Key |
| `LEMONSQUEEZY_STORE_ID` | `280595` | Your Lemon Squeezy Store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | `pinegen_secure_2026` | webhook validation secret |
| `GEMINI_API_KEY` | `AIzaSy...` | AI Generation Logic Key |
|| `NEXT_PUBLIC_APP_URL` | `https://pinescript.vercel.app` | Production App URL |

### 2. Configure Lemon Squeezy Webhooks
1. Go to `Lemon Squeezy Dashboard` > `Settings` > `Webhooks`.
2. Push "Add Webhook".
3. URL: `https://your-app.vercel.app/api/webhooks/lemonsqueezy`
4. Secret: `pinegen_secure_2026` (Must match your Vercel Env Var).
5. Events: `subscription_created`, `subscription_cancelled`, `subscription_expired`.

### 3. Deploy
`git push` to trigger a new build with the environment variables active.

## 🎨 Lemon Squeezy Store Aesthetics (Professional Polish)
To make your store look institutional and premium, use these settings in your **Lemon Squeezy Dashboard**:

### 1. Product Description Template
Copy this into your product description for a professional "SaaS" look:
```markdown
# PineGen Institutional AI Logic
Generate error-free Pine Script v6 indicators and strategies instantly.

### Why Traders Choose PineGen:
- **v6 Engine**: Built specifically for the modern TradingView standard.
- **Institutional Logic**: Strategy generation based on real-world order blocks and liquidity.
- **Zero Errors**: AI-validated syntax reduces code-fixing time by 90%.

*Standard Plan Includes: 200 Gens / mo, 30-day History, Priority Queue.*
```

### 2. Branding Settings
- **Storefront Color**: Set to `#4f46e5` (Institutional Indigo) to match the app.
- **Product Image**: Use a clean, dark-mode screenshot of the PineGen dashboard.
- **Button Text**: Change from "Buy Now" to "Initialize Access" for a more technical feel.

## ✨ Checkout Beautification Template
To make your checkout page look premium, add these to your **Lemon Squeezy Product** settings:

### 1. Banner Image (Recommended)
Use an image with a dark indigo gradient and a subtle Pine Script code overlay. 
*   **Text on Image**: "PineGen v6: Alpha Compute Node"
*   **Style**: Glassmorphism or Carbon Fiber texture.

### 2. High-Conversion Features List
Paste this into the **Product Description** for the checkout:
```markdown
✅ **Institutional Performance**: 600+ Generations/mo (Trader Tier)
✅ **v6 Native**: Guaranteed TradingView v6 logic compliance
✅ **Alpha Discovery**: Access to exclusive institutional risk-management templates
✅ **Cloud Sync**: 90-day strategy history with instant recall
```

### 3. Payment Button
- **Label**: "Unfreeze Bandwidth" or "Sync Subscription"
- **Color**: `#4f46e5` (Institutional Indigo)

## 📊 Usage & Cycle Logic
- **Generation**: Each time a user hits "Enter", **1 token** is deducted.
- **Tracking**: This is recorded in the `user_profiles` table.
- **Protocol Recovery**: Quotas reset on a standard 24-hour cycle for Free users, ensuring they return to the app daily. Pro users have monthly capacity resets synced with their billing cycle.

### 2. Required Setup
1.  **Environment Variables**:
    - `LEMONSQUEEZY_WEBHOOK_SECRET`: Must match the secret you provide in Lemon Squeezy Dashboard.
2.  **Product Setup**:
    - Create a subscription product in your Lemon Squeezy store.
    - Copy the **Checkout Link** (e.g. `https://store.lemonsqueezy.com/checkout/buy/...`).
3.  **Update Code**:
    - Open `src/components/UpgradeButton.tsx`.
    - Replace the placeholder URL with your **Actual Checkout URL**.

## 🧠 AI Optimization (RAG Integration)
The API route `src/app/api/generate/route.ts` has been updated with "Strict v6 Rules" derived from your `rag.md` file. It now strictly enforces:
- `array.get()` syntax.
- `color.new()` transparency.
- `bool()` casting.
