# Kasandra Connect Suite — Project Overview
**Last Updated:** March 2026 (full sprint session)
**Site:** kasandraprietorealtor.com
**Lovable Hub:** kasandra-connect-suite.lovable.app
**Repo:** github.com/eddielopezfit/kasandra-connect-suite (main branch)
**Client:** Kasandra Prieto, Associate Broker, Corner Connect / Realty Executives Arizona Territory

---

## Three-Tool Operating System
- **This Chat** — Strategy, analysis, prompts, direct git push
- **Lovable** — UI changes, new components, layout
- **Claude Code** — Refactors, edge functions, surgical edits

---

## Tech Stack
- React 18 + Vite
- 25+ Supabase Edge Functions (Deno runtime)
- Gemini Flash via Lovable AI Gateway (env var: LOVABLE_API_KEY — NOT GEMINI_API_KEY)
- TanStack Query, Tailwind/shadcn
- GoHighLevel CRM integration (GHL_WEBHOOK_URL — not GHL_API_KEY for webhooks)
- Firecrawl web scraping (FIRECRAWL_API_KEY)
- Perplexity live research (PERPLEXITY_API_KEY)
- ElevenLabs voice (future)
- Google Places API (GOOGLE_PLACES_API_KEY)

---

## Kasandra Brand Voice — Critical Reference
- Tagline: "Your Best Friend in Real Estate" / "Tu Mejor Amiga en Bienes Raíces"
- Formality: 3/10 (very casual), Warmth: 10/10, Energy: 8/10
- First-person always: "I've helped...", "I'm in this market every week..."
- Signature phrases: "Let's turn those dreams into keys", "Hold your hand through the process"
- Spanglish intentional: "cafecito", "amig@", "vamos juntos"
- Never pressures — every CTA soft and warm
- Celebrates every win
- "Best friend" framing throughout — not agent, not advisor

---

## Corner Connect Strategic Positioning (CRITICAL)
- Realty Executives Arizona Territory = licensed brokerage (MLS, compliance, Global Luxury cert)
- Corner Connect = Kasandra's own team brand within Realty Executives
- Cash offers come from Corner Connect's PERSONAL vetted buyer network — NOT an iBuyer
- Approved framing: "Corner Connect isn't an iBuyer service — it's Kasandra's direct buyer network built over years in Tucson"
- NEVER use "iBuyer" to describe Corner Connect
- Selena KB updated with this positioning (both EN and ES prompts)

---

## Kasandra Contact Info (verified)
- Phone: (520) 349-3248
- Address: 4007 E Paradise Falls Dr, Suite 125, Tucson AZ 85712
- License: #SA682372000
- Brokerage: Corner Connect / Realty Executives Arizona Territory
- Instagram: @prietorealestate
- Facebook: facebook.com/prietorealestategroup
- LinkedIn: linkedin.com/in/kasandraprieto
- TikTok: @kasandraprieto
- YouTube: @KasandraPrietoTucson

---

## Complete Route Map (35+ routes, all confirmed live)
`/` `/buy` `/sell` `/cash-offer-options` `/guides` `/guides/:guideId`
`/neighborhoods` `/neighborhoods/:slug` `/about` `/contact` `/selena-ai`
`/book` `/book/confirmed` `/podcast` `/community` `/market`
`/buyer-readiness` `/seller-readiness` `/cash-readiness` `/seller-decision`
`/seller-timeline` `/off-market` `/buyer-closing-costs` `/neighborhood-compare`
`/private-cash-review` `/thank-you`
Dev-only (gated): `/qa-cta` `/qa-determinism`

---

## Guide Library (33+ guides, all live)

### Existing Guides (pre-March 2026 sprint)
first-time-buyer-guide, selling-for-top-dollar, buying-home-noncitizen-arizona,
military-pcs-guide, cash-offer-guide, cash-vs-traditional-sale, cost-to-sell-tucson,
divorce-selling, distressed-preforeclosure, home-prep-staging, how-long-to-sell-tucson,
inherited-probate-property, life-change-selling, move-up-buyer, pricing-strategy,
relocating-to-tucson, sell-now-or-wait, sell-or-rent-tucson, selling-for-top-dollar,
senior-downsizing, tucson-neighborhoods, tucson-suburb-comparison, understanding-home-valuation,
arizona-first-time-buyer-programs, arizona-real-estate-glossary, pima-county-property-taxes,
capital-gains-home-sale-arizona, + story guides

### New SEO Guides (March 2026 sprint — all written in Kasandra brand voice)
- itin-loan-guide → "how to buy a house in Tucson with ITIN number"
- tucson-market-update-2026 → "Tucson real estate market update 2026"
- bad-credit-home-buying-tucson → "how to buy a house in Tucson with bad credit"
- down-payment-assistance-tucson → "down payment assistance Tucson Arizona 2026"
- fha-loan-pima-county-2026 → "FHA loan limits Pima County 2026"
- divorce-home-sale-arizona → "selling house during divorce Arizona"
- va-home-loan-tucson → "VA home loan Tucson Davis-Monthan AFB"
- first-time-buyer-programs-pima-county → "first time home buyer programs Pima County 2026"

All guide intros rewritten in Kasandra first-person voice (commit d69d4d1)

---

## All Features Shipped (March 2026 Full Sprint)

### Bug Fixes (8/8 verified passing)
- Seller fork card → fresh greeting (not "Welcome back") ✅
- Spanish chips auto-detect from user message in edge function ✅
- Buyer chips no bracket text ✅
- /buy + /sell no white flash on load ✅
- All booking funnel routes confirmed ✅

### Guide System Integrity
- CognitiveProgressBar wired into V2GuideDetail.tsx
- PersonalizedHero returning visitor fix (clearLastGuideId on mount)
- Market data reconciled: all guides show $365K / 38 days
- FHA year label corrected 2025→2026 in DACA guide
- Guide search bar (filters EN+ES title+description simultaneously)

### Luxury Upgrades — ALL COMPLETE
- /sell Corner Connect split-panel comparison (Traditional vs Cash, Corner Connect framing)
- /selena-ai full overhaul with SelenaConversationDemo.tsx (auto-playing bilingual VA/DACA conversation)
- /contact two-column rebuild (portrait, response time badge, social icons, dual CTA)
- /neighborhoods hover-reveal cards (stat pills, gold CTA, mobile fallback)
- Animated Market Pulse counters — hero section AND /market page odometer
- Instant Answer Widget (second viewport, affordability + home value tabs, Selena reads the number)
- Aggregated trust bar: "★★★★★ 4.9 · 126+ reviews · Google · Realtor.com · Zillow"
- Testimonials: show 6 by default + expand toggle "See all 12 reviews"

### SEO & Schema
- LocalBusiness + RealEstateAgent schema (homepage) — full spec with geo, aggregateRating, sameAs
- Article schema on all guide pages (datePublished, dateModified, inLanguage)
- BreadcrumbList on guide pages (Home > Guides > [title])
- BreadcrumbList on neighborhood pages (Home > Neighborhoods > [name])
- FAQPage schema on guides with FAQ sections (already existed, confirmed correct)

### Selena Intelligence
- Corner Connect KB block in both EN + ES system prompts (line 1245 EN, 1975 ES)
- Instant Answer Widget context: Selena reads estimated_budget/estimated_value
- estimated_budget added to context interface in edge function
- Timeline chips added to chipsRegistry (ASAP, 1-3 months, 3-6 months, Just exploring) with EN/ES

---

## Key Architectural Rules
1. Never re-introduce deleted components (ConsultationIntakeForm, GHLCalendarEmbed, GoHighLevelForm, GoogleSignInButton permanently deleted)
2. Never expose GuardState internals to the client
3. SelenaChatContext.tsx (React) and selena-chat/index.ts (Deno) are completely separate
4. LOVABLE_API_KEY is the AI gateway env var — not GEMINI_API_KEY or OPENAI_API_KEY
5. GHL_WEBHOOK_URL is the GHL env var — not GHL_API_KEY
6. max_tokens: 150 in selena-chat is INTENTIONAL — do not change
7. KB-0 is supreme, non-overrideable — never touch it

---

## Environment Variables
**Client-side (VITE_):** VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
**Server-side:** SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY, GHL_WEBHOOK_URL, GHL_API_KEY, ADMIN_SECRET, FIRECRAWL_API_KEY, PERPLEXITY_API_KEY, GOOGLE_PLACES_API_KEY, YOUTUBE_API_KEY

---

## Remaining Work Queue

### HIGH PRIORITY — Do Next Session
- GHL dashboard: fix Privacy/Terms URLs on /book form (currently example.com) — 5 min dashboard fix
- A2P 10DLC clearance → activate GHL Track A/B/C nurture sequences + SMS workflows
- Automated daily guide pipeline: Supabase Edge Function (generate-daily-guide)
  - Cron: 6 AM MST daily
  - Topic selection → Perplexity research → Firecrawl data → Gemini generation
  - status: 'pending_review' → GHL notification → Kasandra approves → publish
  - NEVER auto-publish

### MEDIUM PRIORITY
- Google Rich Results validation (search.google.com/test/rich-results)
- Kasandra review of 8 new guides before client-facing
- IDX live listing integration (Phase 2 — requires IDX provider decision)
- /selena-ai expandable chat preview (Page score was 5.5/10 before overhaul — verify improvement)
- Unused dead code cleanup: getGuideTier, getBookingCTA, handleBookConsultation in V2Guides.tsx

### LOW PRIORITY
- A2P SMS clearance → activate GHL nurture sequences
- selena-chat/index.ts refactor — extract systemPrompt.ts (3,673 lines, monolith)
- Unused Supabase secrets cleanup (keep GHL_LOCATION_ID — needed for GHL agents)
- TypeScript type assertion: Math.max() in selena-chat/index.ts (no runtime impact)

---

## GHL Pipeline Structure
Cash / Sell / Buy / Dual / Explore — based on intent signals in notify-handoff

## Data Architecture Notes
- `selena-chat/index.ts` = 3,673 lines (monolith — never let Lovable touch)
- `SelenaChatContext.tsx` = ~700 lines
- `chipsRegistry.ts` = 689 lines, 82+ entries (41+ semantic keys × EN+ES)
- `greetingEngine.ts` = ~670 lines
- `journeyState.ts` = 153 lines
