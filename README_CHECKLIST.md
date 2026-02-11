# PineGen Development Checklist & Setup Guide

## 🚨 Critical Setup Steps
Before the application will work correctly, you must complete the following manual steps:

### 1. Database Setup (Supabase)
The application relies on specific tables and functions for Rate Limiting and User Management.

1.  Open your **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Open the file `checklist_schema.sql` from your project folder.
4.  Copy the entire content.
5.  Paste it into the Supabase SQL Editor and click **Run**.
    *   *Note: This creates tables for `conversations`, `messages`, `user_profiles`, and RPC functions for rate limiting.*

### 2. Environment Variables (Vercel)
You must configure the following Environment Variables in your Vercel Project Settings:

| Variable Name | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `SUPABASE_SERVICE_KEY` | Your Supabase Service Key (Role: service_role) - **Required for API Route Auth/RLS Bypass** |
| `GOOGLE_AI_SERVER_KEY` | Your Google AI API Key (Gemini) |

### 3. Authentication Configuration
1.  In Supabase Dashboard, go to **Authentication -> Providers**.
2.  Enable **Google** (and GitHub/others if desired).
3.  Set the **Redirect URL** to:
    *   `https://<your-vercel-domain>.vercel.app/auth/callback`
    *   `http://localhost:3000/auth/callback` (for local development)

---

## ✅ Feature Checklist Implemented

### Core Functionality
- [x] **AI Integration**: Implemented via `src/app/api/generate/route.ts` using `gemini-2.0-flash-exp`.
- [x] **Streaming**: Server-Sent Events (SSE) implemented for real-time AI responses.
- [x] **Conversation Management**: Full CRUD in `useChatStore.ts` connected to Supabase.
- [x] **Rate Limiting**: RPC functions (`check_rate_limit`) and Store logic (`checkRateLimit`) implemented.

### Security
- [x] **Input Sanitization**: `sanitizeInput` utility in Store.
- [x] **Auth Verification**: API Route verifies Supabase JWT before generation.
- [x] **RLS Policies**: Row Level Security enabled on all tables in `checklist_schema.sql`.

### UI/UX
- [x] **Chat Interface**: Consolidated into `src/app/dashboard/page.tsx` with auto-scroll and markdown rendering.
- [x] **Settings Page**: Basic profile view and Logout functionality in `src/app/settings/page.tsx`.
- [x] **Sidebar**: Updated to reflect real user state (optional: further customization in `src/components/Sidebar.tsx`).

### Next Steps due to User Report
- **Issue**: "Signup redirected to dashboard without proper signup".
- **Fix**: The new flow uses `supabase.auth.signInWithOAuth`.
    *   **Action**: Ensure you have enabled **Google Provider** in Supabase and set the **Redirect URL** correctly. If Redirect URL is missing in Supabase, the OAuth flow fails or redirects weirdly.

---
**Deployment**:
1. Commit changes: `git add . && git commit -m "Complete Checklist Implementation"`
2. Push to GitHub: `git push`
3. Verify Vercel Deployment builds successfully.
