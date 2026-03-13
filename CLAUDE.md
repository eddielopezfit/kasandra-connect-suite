# Kasandra Connect Suite — Master Context for Claude Code

> Read this file before touching anything. Then load relevant skills from `.claude/skills/`.

## What This Is
Production AI-powered real estate Digital Concierge OS for Kasandra Prieto (Associate Broker, Corner Connect / Realty Executives Arizona Territory). Live at kasandraprietorealtor.com. Built by Performance Systems Group LLC (Eddie Lopez, founder).

## Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Radix UI
- **Backend**: Supabase — 26 Deno edge functions, 11 DB tables
- **AI Gateway**: Lovable AI Gateway (`LOVABLE_API_KEY`) — Gemini 3 Flash preview / GPT-4o-mini fallback
- **CRM**: GoHighLevel via `GHL_WEBHOOK_URL` (webhook, not REST API key)
- **Voice**: ElevenLabs
- **Data**: Firecrawl (scraping), Perplexity (neighborhood profiles), Google Places (reviews), YouTube Data API
- **State**: TanStack Query v5 + Supabase Realtime
- **Routing**: React Router v6 — 29 routes (28 active + wildcard)

## Critical Files — Read Before Editing
| File | Lines | Why It Matters |
|------|-------|----------------|
| `supabase/functions/selena-chat/index.ts` | 3,673 | Core AI — monolith, cannot edit in single pass |
| `supabase/functions/selena-chat/guardState.ts` | 549 | KB containment — NEVER bypass or reorder |
| `supabase/functions/selena-chat/modeContext.ts` | 297 | Mode context injection |
| `supabase/functions/selena-chat/journeyState.ts` | 153 | Journey state classifier |
| `src/context/selena/greetingEngine.ts` | 670 | Greeting generation — largest context module |
| `src/context/selena/chipGovernance.ts` | 249 | Client-side chip filtering |
| `src/context/selena/reportManager.ts` | 252 | Report generation/retrieval |
| `src/context/SelenaChatContext.tsx` | 686 | React provider — separate from edge function |
| `src/pages/v2/V2SellerTimeline.tsx` | 770 | Large page — careful editing |
| `src/pages/v2/V2OffMarketBuyer.tsx` | 644 | Large page — careful editing |

## Non-Negotiable Rules

### 1. GuardState Hierarchy — NEVER BYPASS
```
KB-0 > Brokerage Truth > Conversational Doctrine > STATE GUARD > Mode Instructions
```
KB-0 always wins. Never reorder. Never add exceptions to KB-0. See `.claude/skills/guard-state-system/SKILL.md`.

### 2. Edge Function Security
Cost-bearing functions require `x-admin-secret` header:
- `scrape-market-pulse` ✅ protected
- `generate-guide-image` ✅ protected
- `generate-all-guide-images` ✅ protected
- `generate-neighborhood-heroes` ⚠️ NOT protected — known gap, do not call in production without fixing

### 3. Environment Variables — Correct Names
```
LOVABLE_API_KEY        # AI gateway (Gemini/GPT) — NOT GEMINI_API_KEY
GHL_WEBHOOK_URL        # GoHighLevel webhook — NOT GHL_API_KEY
FIRECRAWL_API_KEY      # Scraping
PERPLEXITY_API_KEY     # Neighborhood profiles
GOOGLE_PLACES_API_KEY  # Reviews
YOUTUBE_API_KEY        # Podcast page
ADMIN_SECRET           # Cost-bearing function guard
SUPABASE_URL           # All functions
SUPABASE_SERVICE_ROLE_KEY  # All functions (use service role, not anon)
```

### 4. Do Not Re-introduce Dead Code
- `hasReports` state — permanently removed
- `ConsultationIntakeForm.tsx` — deleted
- `GHLCalendarEmbed.tsx` — deleted
- `GoHighLevelForm.tsx` — deleted
- `GoogleSignInButton.tsx` — deleted
- `PhoneVerificationGate.tsx` — ACTIVE, do not delete (used in V2PrivateCashReview)

### 5. Confirmed Orphans (Still Present, Unused)
- `src/hooks/useConsultationForm.ts`
- `src/components/v2/ConsultationFormFields.tsx`
Safe to delete in a cleanup pass.

### 6. SelenaChatContext ≠ selena-chat/index.ts
These are completely separate systems:
- `src/context/SelenaChatContext.tsx` — React provider, client-side state
- `supabase/functions/selena-chat/index.ts` — Deno edge function, server AI

### 7. notify-handoff Is Fire-and-Forget
No retry logic. No await on response. This is intentional.

### 8. check-availability Returns Stub Data
Fake time slots. Real calendar integration is a pending TODO. Do not remove the TODO comment.

## Selena AI System — Quick Reference
- **4 modes**: Orientation → Clarity → Confidence → Handoff
- **3 journey states**: explore → evaluate → decide
- **14 context blocks** assembled per request (see selena-chat-architecture skill)
- **max_tokens**: 150 — intentional, do not increase without explicit instruction
- **Booking gate**: `hasEarnedBookingAccess()` — earned access only, never surface prematurely
- **Chip governance**: `getGovernedChips()` — intent-filtered (buy/sell/neutral)
- **Bilingual**: EN/ES throughout — edit both or neither

## Database Tables (11)
`lead_profiles`, `session_snapshots`, `decision_receipts`, `saved_scenarios`, `lead_reports`, `lead_handoffs`, `market_pulse_settings`, `neighborhood_profiles`, `seller_leads`, `event_log`, `rate_limits`

Storage bucket: `guide-assets` (public)

## Brand Tokens
| Token | Value |
|-------|-------|
| `cc-navy` | #1F2A44 |
| `cc-navy-dark` | #161E33 |
| `cc-gold` | #E1B54A |
| `cc-ivory` | #FAF8F5 |
| `cc-sand` | #F5F1EB |
| `cc-charcoal` | #2B2B2B |

Fonts: Playfair Display (serif/headings), Inter (sans/body)

## Active Skills
Load these for specialized tasks:
- `.claude/skills/kasandra-project-overview/SKILL.md` — general orientation
- `.claude/skills/selena-chat-architecture/SKILL.md` — AI edge function refactor
- `.claude/skills/guard-state-system/SKILL.md` — KB hierarchy rules
- `.claude/skills/supabase-edge-conventions/SKILL.md` — edge function patterns
