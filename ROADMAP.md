# 🗺️ Product Commercialization Roadmap to become a "Complete Product"

This roadmap outlines the steps to evolve PineGen from a functional MVP into a commercial-grade SaaS product comparable to specialized tools like "ChatGPT for Pine Script".

## 🏗️ Phase 1: Commercial Infrastructure (The Money Layer)
**Goal**: Enable payments, subscriptions, and usage tiers.

- [ ] **Stripe Integration**
    - [ ] Create `src/lib/stripe.ts` for Stripe SDK.
    - [ ] Implement Webhook Endpoint (`/api/webhooks/stripe`) to handle `checkout.session.completed`, `customer.subscription.updated`.
    - [ ] Create Database Tables: `subscriptions` (linked to `user_profiles`).
    - [ ] Update Rate Limiting Logic: Check `subscriptions` status (Active vs Canceled) instead of just static `tier` field.
    - [ ] **Pricing Page**: Wire up "Upgrade" buttons to Stripe Checkout.
    - [ ] **Customer Portal**: Allow users to cancel/manage billing.

## 💻 Phase 2: Professional Editor & "Artifacts" (The Canvas)
**Goal**: Move beyond a simple chat interface to a workspace where code lives side-by-side with chat.

- [ ] **"Artifacts" UI Layout**
    - [ ] Split screen: Chat on Left (40%), Code Editor on Right (60%).
    - [ ] "Open in Editor" button for every code block.
- [ ] **Monaco Editor Integration**
    - [ ] Utilize `@monaco-editor/react`.
    - [ ] **Syntax Highlighting**: Custom Pine Script tokenizer for Monaco (keywords: `strategy`, `indicator`, `plot`, etc.).
    - [ ] **Action Buttons**: `Copy`, `Download .pine`, `Diff View` (Previous Version vs New Version).
- [ ] **Version Control**:
    - [ ] Save script versions (`v1`, `v2`) so users can revert changes made by AI.

## 👁️ Phase 3: Vision & Multimodal Input (The "Wow" Factor)
**Goal**: Allow users to replicate strategies from screenshots.

- [ ] **Image Upload Support**
    - [ ] Add `File Input` to Chat Interface.
    - [ ] Upload image to Supabase Storage.
    - [ ] Pass image URL to `gemini-pro-vision` or `gemini-1.5-flash` (multimodal).
    - [ ] **Prompt**: "Generate Pine Script code that replicates the indicators and signals shown in this chart screenshot."

## 📚 Phase 4: Strategy Library & RAG (The Knowledge Base)
**Goal**: Expert-level knowledge that standard LLMs miss.

- [ ] **Knowledge Base**
    - [ ] Scrape Pine Script Reference Manual v6.
    - [ ] Index common community scripts (Open Source).
- [ ] **RAG System (Retrieval Augmented Generation)**
    - [ ] When user asks "How to use `request.security` with non-repainting?", retrieve exact doc examples.
    - [ ] Feed these examples into the System Prompt context.

## 🔄 Phase 5: Refinement Workflow (The UX Polish)
**Goal**: Frictionless iteration.

- [ ] **Edit & Regenerate**
    - [ ] Allow users to edit their previous prompt.
    - [ ] "Regenerate" button for bad responses.
- [ ] **User Personalization**
    - [ ] "Custom Instructions" setting (e.g., "Always use `overlay=true`", "Prefer EMA over SMA").
    - [ ] Store these in `user_profiles` and inject into System Prompt.

---

## 🚀 Recommended Next Step
**Choice A (Revenue Focused)**: Implement **Stripe Integration** so you can start charging.
**Choice B (Product Focused)**: Implement **Monaco Editor / Artifacts UI** to make it feel like a pro tool.

*My suggestion: Go with **Phase 2 (Editor/Artifacts)** first. A paid tool needs to look premium before you ask for credit cards.*
