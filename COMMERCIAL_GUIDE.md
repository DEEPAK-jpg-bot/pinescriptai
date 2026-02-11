# PineGen Commercial Deployment Guide

## 💰 Lemon Squeezy Integration (Phase 1 Complete)

### 1. Webhook Endpoint
The endpoint is live at `/api/webhooks/lemonsqueezy`.
It handles:
- `subscription_created` -> Sets User Tier to 'pro'.
- `subscription_cancelled` -> Updates status.
- `subscription_expired` -> Downgrades to 'free'.

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

## 🚀 Final Steps to Launch
1.  **Deploy to Vercel**: `git push`
2.  **Configure Webhooks**: Point Lemon Squeezy webhook to `https://your-app.vercel.app/api/webhooks/lemonsqueezy`.
3.  **Test**: Buy a test subscription and verify your profile updates to "Pro".
