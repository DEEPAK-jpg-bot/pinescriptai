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

### 1. Product Description Template (High Performance)
Copy this into your product description for a premium, high-conversion look:
```markdown
# 💎 PineGen Institutional Alpha
Deploy the definitive Pine Script v6 logic engine to your trading stack.

### 🚀 Why Professional Traders Source Logic from PineGen:
- ✅ **v6 Native Compiler**: Guaranteed compliance with the latest TradingView v6 standards.
- ✅ **Institutional Logic**: Strategies engineered around order blocks, liquidity, and volume profiles.
- ✅ **Neural Validation**: AI-driven syntax checking eliminates 99% of run-time mapping errors.
- ✅ **Zero Look-Ahead Bias**: Built-in verification protocols ensure non-repainting precision.

### 📊 Performance Capacity:
*   **Generations**: 200 - 1500 Generations/month (Tier Dependent)
*   **Persistence**: Up to 90-Day Cloud History Retrieval
*   **Compute**: Priority Queue Access for Instant v6 Compilation

---
*Powered by the PineGen v6 Logic Network.*
```

### 2. Branding Settings (Visual Excellence)
- **Storefront Color**: `#4f46e5` (Institutional Indigo).
- **Product Image**: Upload a high-resolution dark-mode render of the dashboard.
- **Button Text**: Change to "Initialize Access" or "Sync Subscription".

## ✨ High-Conversion Checkout Assets
Use these bullet points in the **Feature List** section of the Lemon Squeezy Checkout:

*   ✅ **Alpha Discovery Unit**: 1500 Generations/month (Pro Trader)
*   ✅ **Logic Persistence**: Infinite history and state recall
*   ✅ **v6 Compliance**: Guaranteed TradingView v6 logic safety
*   ✅ **Neural Support**: 24/7 Priority Technical Access

### 3. Payment Button
- **Label**: "Unfreeze Bandwidth" or "Sync Subscription"
- **Color**: `#4f46e5` (Institutional Indigo)

## 📊 Usage & Cycle Logic
- **Generation**: Each time a user hits "Enter", **1 Generation** is deducted.
- **Tracking**: This is recorded in the `user_profiles` table under `gens_remaining`.
- **Protocol Recovery**: Quotas reset on a standard **30-day cycle** for Free users (10 Gens/mo). Pro users have monthly capacity resets synced with their billing cycle (e.g., 200, 600, or 1500 Gens).

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
