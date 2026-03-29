

# Kasandra Connect Suite — Full Production Audit

## Verdict: Production Ready at 8.5/10 — with 12 optimization gaps

The hub is significantly more advanced than what Realty Executives' own website offers (their site is a basic lead-capture template with mortgage calculators). Kasandra's hub is a decision-intelligence platform. But she's not yet fully leveraging the Realty Executives brand connection or maximizing several existing features.

---

## What's Working Excellently

### Architecture (Ship-worthy)
- 38 lazy-loaded pages with code splitting
- 37 edge functions with rate limiting, retry logic, 3-tier data resilience
- 850-line chips registry with full EN/ES bilingual parity and fuzzy matching
- ActionSpec semantic routing prevents dead-end chips
- Session context persistence across visits with snapshot restoration
- Journey-aware UI adaptation (hero copy, CTA positioning, tool completion states)

### Selena AI (Best-in-class)
- 4-mode Decision Certainty Engine with guard state hierarchy
- 100-150 token responses (cost-efficient, no rambling)
- Server-side chip governance prevents prompt injection
- Bilingual throughout with proper register (usted vs tu)
- Memory persistence across sessions

### Content Depth
- 32 guides covering every life situation (divorce, military PCS, ITIN, inherited, senior downsizing, bad credit, relocation)
- 22 neighborhood profiles with cinematic detail pages
- Cash vs. Traditional calculator, Buyer Closing Costs, Net-to-Seller, Affordability, BAH Calculator
- Buyer/Seller/Cash readiness diagnostics
- Seller Decision wizard with dual-path comparison

### Compliance (Already addressed)
- Branding lockup strip with REALTOR/Fair Housing icons at top of every page (just implemented)
- Educational disclaimer at top of every guide (line 499 of V2GuideDetail.tsx)
- GuideComplianceFooter at bottom of guides
- Privacy/Terms pages
- TCPA consent checkboxes
- Fair Housing compliance in Selena's KB-13

---

## 12 Gaps to Close

### Category A: Kasandra's Direct Feedback (Still pending)

**1. Podcast name needs updating**
- Current: "Lifting You Up with Kasandra Prieto" everywhere
- Kasandra said it's: **"Lifting You Up: Todo empieza en casita"**
- Affects: V2Home, V2About, V2Podcast, CredentialsBentoGrid, schemaGenerators (PodcastSeries JSON-LD)
- 6 files, ~15 string replacements

**2. Community page missing two sections**
- **Construction Course**: Kasandra took a 6-month course and built 15 tiny homes. This is on V2About but NOT on the Community page where it belongs as community impact
- **Tony Robbins / Personal Development**: Multiple seminars invested in — mentioned on About page but not Community
- The Community page only has 3 sections: Diaper Bank, Rumbo al Exito, Tucson Appliance

**3. Diaper Bank framing needs past-tense emphasis**
- Current copy says "served" (correct) but Kasandra wanted to explicitly frame it as past community work she's proud of — not current involvement
- About page says "Former Vice Chair" (correct)
- Home page says "Former Vice Chair" (correct)
- Community page says "served... for five years" (correct but could be more prominent)

### Category B: Realty Executives Leverage (Untapped)

**4. No link to Kasandra's Realty Executives agent profile**
- realtyexecutives.com has agent search — Kasandra should have a profile page there
- Her hub doesn't link to it anywhere, missing bidirectional SEO authority
- Should add to Footer and About page as an external trust signal

**5. No "Realty Executives" brand equity positioning**
- The footer mentions "Corner Connect / Realty Executives Arizona Territory" in small text
- No section anywhere explains what Realty Executives IS (international brokerage, 50+ years, global presence)
- Kasandra is underselling the institutional backing — RE is a top-tier brand name
- Opportunity: Add a "Backed by Realty Executives" trust section on About page or homepage TrustBar

**6. Realty Executives has calculators — Kasandra's are better but not framed competitively**
- RE's site offers: Mortgage Calculator, Affordability Calculator, Rental Calculator, Land Tax Calculator
- Kasandra has: Net-to-Seller, Cash vs. Traditional, Buyer Closing Costs, Affordability, BAH — MORE and better
- Opportunity: Frame the tools section as "More tools than most brokerages offer" or "Beyond what your typical agent website provides"

### Category C: UX/CTA Optimization

**7. Homepage "About" section repeats credentials 4 times**
- Desktop, tablet, and mobile each have separate layouts for the About section (lines 196-434)
- The same 4 bullet points (Diaper Bank, GTL, Radio, Luxury Specialist) appear in 3 different responsive layouts
- This is correct responsive design but the bullets themselves need updating per Kasandra's feedback

**8. Footer CTA says "Book a Consultation" — violates brand standard**
- Line 36 of V2Footer: "Book a Consultation" / "Agendar una Consulta"
- Brand standard: Use "Strategy Session" not "Consultation"
- Should be: "Book a Strategy Session" / "Agendar una Sesion de Estrategia"

**9. V2About says "Su REALTOR" (usted) but brand voice standard is "tu"**
- Line 100: "Su REALTOR® de Confianza en Tucson" — uses formal "Su"
- Brand voice standard says to use informal "tu" in Spanish
- Should be: "Tu REALTOR® de Confianza en Tucson"

### Category D: Technical Polish

**10. No WebP images**
- 22+ image files all PNG/JPG — no WebP optimization
- Performance impact on mobile (Kasandra's target audience)
- The branding lockup just added is a JPG — should be optimized

**11. Console statements in production**
- ~183 console.log/warn/error calls across the frontend
- Not all guarded by `import.meta.env.DEV`

**12. `check-availability` still returns stub data**
- The booking flow's slot selection returns fake time slots
- Real GHL calendar integration is pending (Phases 1-5 browser config)
- This is the biggest remaining functional gap

---

## Realty Executives Competitive Comparison

```text
Feature                    | RE Website  | Kasandra Hub
---------------------------|-------------|------------------
MLS Property Search        | Yes         | No (intentional — she routes to MLS)
Mortgage Calculator        | Yes         | Yes (+ 4 more calculators)
Affordability Calculator   | Yes         | Yes (+ BAH for military)
AI Concierge               | No          | Yes (Selena — bilingual, 4-mode)
Neighborhood Profiles      | No          | Yes (22 areas, cinematic)
Educational Guides         | No          | Yes (32 guides, bilingual)
Readiness Diagnostics      | No          | Yes (3 tools)
Cash Offer Comparison      | No          | Yes (calculator + decision wizard)
Bilingual Support          | No          | Yes (full EN/ES throughout)
Session Intelligence       | No          | Yes (journey tracking, adaptive UI)
Lead Dossier for Agent     | No          | Yes (GHL integration)
```

Kasandra's hub is objectively more powerful than the Realty Executives corporate website. The gap is that she doesn't SAY that anywhere. The brand positioning should frame this as "What my brokerage offers, plus everything I've built on top."

---

## Recommended Priority Order

1. Update podcast name to "Lifting You Up: Todo empieza en casita" (quick, Kasandra noticed)
2. Fix footer "Consultation" → "Strategy Session" (brand compliance)
3. Fix "Su REALTOR" → "Tu REALTOR" on About page (brand voice)
4. Add Realty Executives trust positioning on About/Homepage
5. Expand Community page (construction course, personal development sections)
6. Add link to RE agent profile in footer
7. Convert images to WebP
8. Guard remaining console statements

---

## Files That Would Change

| File | Change |
|------|--------|
| `src/pages/v2/V2Home.tsx` | Update podcast name in ~4 places |
| `src/pages/v2/V2About.tsx` | Update podcast name, fix "Su" → "Tu", add RE positioning |
| `src/pages/v2/V2Podcast.tsx` | Update podcast name in title, schema, copy |
| `src/components/v2/CredentialsBentoGrid.tsx` | Update podcast name |
| `src/components/v2/V2Footer.tsx` | "Consultation" → "Strategy Session", add RE profile link |
| `src/pages/v2/V2Community.tsx` | Add construction course + personal development sections |
| `src/lib/seo/schemaGenerators.ts` | Update PodcastSeries name if applicable |

