---
name: kasandra-project-overview
description: High-level overview of the Kasandra Connect Suite — stack, structure, production status, and architectural constraints. Read this first at the start of any Claude Code session on this repo.
---

# Kasandra Connect Suite — Project Overview

## What This Is
A production AI-powered real estate Digital Concierge OS for Kasandra Prieto (Associate Broker, Corner Connect / Realty Executives Arizona Territory). Live at kasandraprietorealtor.com. Built by Performance Systems Group LLC (Eddie Lopez).

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Supabase — 26 Deno edge functions, 11 DB tables |
| AI Gateway | Lovable AI Gateway — Gemini 3 Flash (primary), GPT-4o-mini (fallback) |
| CRM | GoHighLevel (webhook integration via GHL_WEBHOOK_URL) |
| Voice | ElevenLabs |
| Data | Firecrawl (Redfin scraping), Perplexity (neighborhood profiles), Google Places, YouTube Data API |
| State | TanStack Query v5 + Supabase Realtime |
| Routing | React Router v6 — 35+ routes + redirects |

## Core AI — Selena
Selena is the AI concierge. She is NOT a generic chatbot.
- 4 psychological modes: Orientation → Clarity → Confidence → Handoff
- 3 journey states: explore → evaluate → decide (separate from modes)
- 14 dynamic context blocks assembled per request
- Bilingual (EN/ES)
- `max_tokens: 150` is intentional — do not change
- GuardState hierarchy enforces brand/legal compliance on every response

## Production Security Status (CURRENT — March 2026)
4 edge functions use x-admin-secret auth:
- `scrape-market-pulse` ✅ protected
- `generate-guide-image` ✅ protected
- `generate-all-guide-images` ✅ protected
- `generate-neighborhood-heroes` ✅ protected (added March 2026)

Remaining 22 edge functions have no auth — rate limit only or nothing.
All paid API callers are now protected.

**Deleted stubs:**
- `check-availability` — DELETED (was returning fake hardcoded slots)
- `SlotPicker.tsx` — DELETED (UI component for the stub)

## Brand Tokens
| Token | Hex |
|-------|-----|
| `cc-navy` | #1F2A44 |
| `cc-navy-dark` | #161E33 |
| `cc-gold` | #E1B54A |
| `cc-ivory` | #FAF8F5 |
| `cc-sand` | #F5F1EB |
| `cc-charcoal` | #2B2B2B |

Fonts: Playfair Display (serif headings), Inter (sans body)

## Homepage Structure (V2Home.tsx — ~740 lines)
Render order: JsonLd → GlassmorphismHero (showMarketPulse={false}) → Buyer/Seller Fork → About (inline) → HomepageNeighborhoodCards → TrustBar → Services (inline) → Selena AI Section (inline, has CTAs) → Testimonials → Podcast → Community → CTASection

**WARNING:** About, Services, Selena AI Section, Testimonials, Podcast, Community are all INLINE JSX in V2Home.tsx — not separate components. Section reordering must be done in Claude Code, not Lovable, to avoid breakage.

## New Pages Added (March 2026)
- `/about` → V2About.tsx (~260 lines) — Kasandra bio, credentials bento, recognition
- `/contact` → V2Contact.tsx (~140 lines) — Phone, address, social links, Selena CTA
- `/selena-ai` → V2SelenaAI.tsx (~150 lines) — AI concierge explainer, compliance

## Key UX Features (March 2026)
- **Buyer/Seller fork**: Below hero, two cards open Selena with `buyer_fork`/`seller_fork` source
- **Proactive Selena trigger**: Fires at 50% scroll + 15s elapsed, single-fire, skips if already open
- **GlassmorphismHero**: Accepts `showMarketPulse` prop — false on homepage (shows social proof), true on /buy and /sell
- **ZIP explorer chips**: 85718, 85742, 85719, 85629 suggestion chips on /buy
- **Neighborhood shimmer**: Animated pulse placeholder while card images load
- **"Your Best Friend in Real Estate"**: Gold tagline above hero headline on all pages, gold text in desktop nav

## Known Production Bugs (March 2026)
- **Buyer chip rendering bug**: Buyer flow chips render as `[bracket text]` instead of clickable buttons. Seller flow works fine. Under investigation in selena-chat/index.ts.
- **/buy and /sell blank render**: ~4 second white screen on cold load. Fast pages: /, /about, /cash-offer-options. Under investigation.

## Luxury Upgrade Queue (Next Sprints)
Priority components from 21st.dev:
1. Testimonials Columns (Efferd) — homepage
2. Bento Grid (Aceternity) — /about credentials
3. Two-column contact layout — /contact rebuild
4. Timeline (Aceternity) — /buy buying process
5. Pricing Comparison (Tommy Jepsen) — /sell options

## Deleted Files (March 2026 — do not re-introduce)
- `src/hooks/useConsultationForm.ts` — deleted, zero imports
- `src/components/v2/ConsultationFormFields.tsx` — deleted, zero imports
- `src/components/v2/booking/SlotPicker.tsx` — deleted, was calling fake check-availability stub

## Dev-Only Routes (properly gated behind import.meta.env.DEV)
- `/qa-cta` → V2CTAQualityAssurance (redirects to / in production)
- `/qa-determinism` → V2QADeterminism (redirects to / in production)

## GHL Integration
All GHL calls use `GHL_WEBHOOK_URL` env var. 6 edge functions sync to GHL:
submit-consultation-intake, submit-seller, upsert-lead-profile, update-lead-score, notify-handoff, selena-log-event

Pipeline routing: Cash / Sell / Buy / Dual / Explore — based on intent signals in notify-handoff.

## Key Architectural Rules
1. Never re-introduce deleted components (ConsultationIntakeForm, GHLCalendarEmbed, GoHighLevelForm, GoogleSignInButton are permanently deleted)
2. Never expose GuardState internals to the client
3. SelenaChatContext.tsx (React) and selena-chat/index.ts (Deno) are completely separate — never mix logic
4. LOVABLE_API_KEY is the AI gateway env var — not GEMINI_API_KEY or OPENAI_API_KEY
5. GHL_WEBHOOK_URL is the GHL env var — not GHL_API_KEY

## Environment Variables Summary
**Client-side (VITE_):** VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
**Server-side:** SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY, GHL_WEBHOOK_URL, GHL_API_KEY, ADMIN_SECRET, FIRECRAWL_API_KEY, PERPLEXITY_API_KEY, GOOGLE_PLACES_API_KEY, YOUTUBE_API_KEY

## Luxury Upgrades Completed (March 2026)
- **Homepage testimonials**: Replaced dot-carousel with TestimonialColumns.tsx — staggered 3-col navy masonry, gold stars, real client names, source badges, Spanish review preserved
- **About bento grid**: CredentialsBentoGrid.tsx — 6-cell asymmetric grid, Luxury Specialist as 2-col anchor with gold border, Diaper Bank logo embedded
- **Market Pulse insight lines**: Plain-English translations under each metric (Sale-to-List, Days on Market, Holding Cost) on /buy and /sell
- **Buying process timeline**: BuyingTimeline.tsx — animated vertical gold connector, scroll-triggered fade-up, alternating desktop layout, bilingual
- **/sell blank render fixed**: GoogleReviewsSection lazy-loaded (commit 673c618)

## Remaining Luxury Upgrade Queue
- `/sell` — Traditional vs Cash split-panel comparison (Lovable)
- `/contact` — Two-column with Kasandra headshot + form (Lovable)
- `/selena-ai` — Expandable chat preview mockup (Lovable)
- `/neighborhoods` — Display Cards with hover reveal (Lovable)
- Schema markup — LocalBusiness, Article, Review, BreadcrumbList (Claude Code)
- Aggregated review trust bar — "4.9 stars · 126+ reviews" (Lovable)
- Instant Answer Widget — affordability + home value calculator (Lovable — approved plan ready)
- Entry source personalization — Selena opens knowing buyer/seller context (Claude Code — Phase 2 symphony)
