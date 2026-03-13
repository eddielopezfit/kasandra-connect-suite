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
| Routing | React Router v6 — 29 routes + redirects |

## Core AI — Selena
Selena is the AI concierge. She is NOT a generic chatbot.
- 4 psychological modes: Orientation → Clarity → Confidence → Handoff
- 3 journey states: explore → evaluate → decide (separate from modes)
- 14 dynamic context blocks assembled per request
- Bilingual (EN/ES)
- `max_tokens: 150` is intentional — do not change
- GuardState hierarchy enforces brand/legal compliance on every response

## Production Security Status (CRITICAL AWARENESS)
19 of 26 edge functions have NO auth protection. Only 3 use x-admin-secret:
- `scrape-market-pulse` ✅ protected
- `generate-guide-image` ✅ protected
- `generate-all-guide-images` ✅ protected

**Unprotected but calling paid APIs:**
- `generate-neighborhood-heroes` — calls LOVABLE_API_KEY with no auth ⚠️

**Known stub:**
- `check-availability` — returns fake hardcoded time slots, not connected to real calendar

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

## Homepage Structure (V2Home.tsx — 638 lines)
Render order: JsonLd → GlassmorphismHero → About (inline ~240 lines) → HomepageNeighborhoodCards → TrustBar → Services (inline) → Selena AI Section (inline) → Testimonials → Podcast → Community → CTASection

**WARNING:** About, Services, Selena AI Section, Testimonials, Podcast, Community are all INLINE JSX in V2Home.tsx — not separate components. Section reordering must be done in Claude Code, not Lovable, to avoid breakage.

## Confirmed Orphaned Files (safe to delete)
- `src/hooks/useConsultationForm.ts`
- `src/components/v2/ConsultationFormFields.tsx`

## Dev-Only Routes (no route guard — publicly accessible)
- `/qa-cta` → V2CTAQualityAssurance
- `/qa-determinism` → V2QADeterminism

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
