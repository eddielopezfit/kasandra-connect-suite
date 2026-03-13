---
name: kasandra-project-overview
description: General orientation for the Kasandra Connect Suite codebase. Use this when onboarding to the project, exploring unfamiliar areas, or when a task requires understanding the overall system architecture before making changes.
---

# Kasandra Connect Suite — Project Overview

## What This Is
A production AI-powered real estate Digital Concierge OS for Kasandra Prieto (Associate Broker, Corner Connect / Realty Executives Arizona Territory). Live at kasandraprietorealtor.com. Built and maintained by Performance Systems Group LLC (Eddie Lopez).

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (26 Edge Functions, Deno runtime)
- **AI**: Lovable AI Gateway — primary model `google/gemini-3-flash-preview`, fallback `openai/gpt-4o-mini`
- **CRM**: GoHighLevel (GHL) — pipeline routing, SMS nurture, contact management
- **Voice**: ElevenLabs
- **Data enrichment**: Firecrawl (property scraping), Perplexity (neighborhood profiles)
- **State**: TanStack Query + Supabase Realtime
- **Routing**: React Router v6, 28 routes

## Key Directory Structure
```
src/
  components/v2/          # All active UI components (v2 namespace)
  pages/v2/              # All active page components
  context/               # SelenaChatContext.tsx (refactored provider ~689 lines)
  hooks/                 # useMarketPulse, useGoogleReviews, etc.
  lib/                   # Supabase client, utilities
supabase/
  functions/             # 26 Deno edge functions
    selena-chat/         # PRIMARY AI ENDPOINT — index.ts is 3,673 lines (monolith)
    _shared/             # Shared modules: cors.ts, rateLimit.ts
    upsert-lead-profile/ # Lead capture + CRM sync
    notify-handoff/      # GHL handoff notification (fire-and-forget)
    fetch-google-reviews/# Google Places reviews
    scrape-market-pulse/ # Firecrawl market data (protected: x-admin-secret)
    generate-guide-image/# AI image generation (protected: x-admin-secret)
.lovable/memory/         # Lovable AI knowledge files (architecture docs)
directives/              # Project directives for AI agents
docs/                    # Additional documentation
```

## Database Tables (11 total)
| Table | Purpose |
|-------|---------|
| `lead_profiles` | Core lead records — email, intent, timeline, GHL sync |
| `session_snapshots` | Per-session state — tools used, guides read, readiness score |
| `decision_receipts` | Seller Decision tool output receipts |
| `saved_scenarios` | Calculator results, monitoring flags |
| `lead_reports` | Generated reports, verification gates |
| `lead_handoffs` | Handoff records — channel, priority, booking data |
| `market_pulse_settings` | Tucson market data — DOM, holding costs, sale-to-list |
| `neighborhood_profiles` | ZIP-based neighborhood intelligence (EN/ES jsonb) |
| `seller_leads` | Seller-specific lead capture with property + calc data |
| `event_log` | Event tracking — session_id, event_type, payload |
| `rate_limits` | Rate limit tracking — key, endpoint, request_count, window |

## Core AI Persona: Selena
Selena is the AI concierge. She operates with:
- **4-mode progression**: Orientation → Clarity → Confidence → Handoff
- **3-state journey engine**: explore → evaluate → decide
- Decision Certainty Engine
- Earned-access booking gates (function: `hasEarnedBookingAccess`)
- 33-guide bilingual content library (EN/ES) across 3 CTA tiers
- GuardState KB hierarchy — never bypass (see guard-state-system skill)

## Brand Colors (Tailwind custom tokens)
- `cc-navy` — primary dark (#1B2B4B)
- `cc-gold` — accent (#C9A96E)
- `cc-charcoal` — body text
- `cc-sand` — warm background
- `cc-cream` — lightest background

## Active Flagship Pages
- `/` → V2Home
- `/buy` → V2Buy
- `/sell` → V2Sell
- All use `GlassmorphismHero` component with per-page intent props

## Key Architectural Rules
1. Never delete or bypass the GuardState system in selena-chat
2. All cost-bearing edge functions require `x-admin-secret` header auth
3. SMS workflows are gated — TCPA consent required before activation
4. SelenaChatContext.tsx is the provider; selena-chat/index.ts is the edge function — these are separate
5. `notify-handoff` is fire-and-forget — no retry logic by design
6. PhoneVerificationGate.tsx is ACTIVE — do not delete (used in V2PrivateCashReview)

## Secrets (Supabase environment — Deno.env.get names)
| Variable | Purpose |
|----------|---------|
| `LOVABLE_API_KEY` | AI gateway — Gemini 3 Flash / GPT-4o-mini (NOT GEMINI_API_KEY) |
| `GHL_WEBHOOK_URL` | GoHighLevel webhook (NOT GHL_API_KEY) |
| `FIRECRAWL_API_KEY` | Scraping via scrape-market-pulse |
| `PERPLEXITY_API_KEY` | Neighborhood profiles |
| `GOOGLE_PLACES_API_KEY` | Google reviews |
| `YOUTUBE_API_KEY` | Podcast page videos |
| `ADMIN_SECRET` | Cost-bearing function guard |
| `SUPABASE_URL` | All functions |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions |

## Frontend Env Vars (.env)
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
