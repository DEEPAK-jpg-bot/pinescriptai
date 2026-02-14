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
