

# Kasandra's Oasis: Digital Concierge Hub -- Full Structural Audit

---

## Executive Summary

### What Exists
A fully bilingual (EN/ES) real estate digital concierge hub built around Kasandra Prieto's personal brand, with 18 distinct pages across two route families (`/v2/*` for the main hub and `/ad/*` for paid ad funnels). The hub includes a Selena AI chat concierge present on every V2 page, 5 interactive tools (Path Quiz, Seller Quiz, Buyer Readiness Check, Net-to-Seller Calculator, Ad Funnel Quiz), 4 lead capture mechanisms, 13 educational guides, and full CRM integration via GoHighLevel webhooks through Supabase Edge Functions.

### What Works
- Bilingual toggle is globally consistent across all V2 pages via `LanguageContext`
- Selena chat is wired into every V2 page with context-aware greetings based on entry source and intent
- Session context persistence (`selena_context_v2` in localStorage) tracks UTMs, intent, timeline, tool usage, and journey signals across navigation
- Lead creation pipeline (`submit-consultation-intake`, `upsert-lead-profile`, `submit-seller`) is functional and maps to GHL custom fields
- The "Selena as Router" policy is enforced -- direct `/v2/book` links are restricted to authorized surfaces
- 3-Tier Fallback architecture is implemented for Google Reviews (Live API, Cache, Static)
- CTA tracking via `logCTAClick` with standardized `CTA_NAMES` constants

### What Is Missing
- No dedicated buyer ad funnel (equivalent of `/ad/seller` for buyers)
- No off-market/VIP buyer access pathway
- Ad funnel pages (`/ad/*`) are English-only -- no ES support
- No TCPA consent capture on quiz-based lead forms (`V2HomePathQuiz`, `V2SellerQuiz`)
- `quiz_completed` bug in `/v2/quiz` payload still unfixed (dossier spread overwrites to `false`)
- No lead scoring mechanism exists in the frontend
- `/v2/private-cash-review` is gated by phone verification but has no pathway from navigation -- effectively hidden
- No Meta Pixel or CAPI integration exists yet

### Overall Readiness Score: 72 / 100

The hub is architecturally sound with strong bilingual support, session identity, and CRM wiring. The primary gaps are: consent compliance on quiz forms, the ad funnel being English-only, missing buyer conversion pathways, and no ad pixel telemetry.

---

## Current Hub Inventory

### A. Pages / Routes

| Route | Page Component | Layout | Access | Purpose | Bilingual |
|---|---|---|---|---|---|
| `/v2` | V2Home | V2Layout | Public | Lobby -- orientation, trust, Kasandra intro video | Yes |
| `/v2/buy` | V2Buy | V2Layout | Public | Buyer orientation -- process steps, readiness CTA, guides | Yes |
| `/v2/sell` | V2Sell | V2Layout | Public | Seller orientation -- protection approach, cash vs listing options | Yes |
| `/v2/cash-offer-options` | V2CashOfferOptions | V2Layout | Public | Evaluation -- interactive calculator, cash vs traditional education | Yes |
| `/v2/guides` | V2Guides | V2Layout | Public | Education hub -- 13 guides, personalized recommendations, cognitive progress | Yes |
| `/v2/guides/:guideId` | V2GuideDetail | V2Layout | Public | Individual guide content with scroll tracking and Selena handoff | Yes |
| `/v2/podcast` | V2Podcast | V2Layout | Public | Trust/authority -- radio show, YouTube embed | Yes |
| `/v2/community` | V2Community | V2Layout | Public | Trust/authority -- nonprofit leadership, Google Reviews, Google Sign-In | Yes |
| `/v2/book` | V2Book | V2Layout | Public | Commitment gate -- ConsultationIntakeForm with intent-based header | Yes |
| `/v2/quiz` | V2HomePathQuiz | QuizFunnelLayout | Public | Orientation -- 4-path quiz (buy/sell/cash/explore) + contact capture | Yes |
| `/v2/seller-quiz` | V2SellerQuiz | QuizFunnelLayout | Public | Orientation -- 3-path seller-only quiz (sell/cash/compare) + contact capture | Yes |
| `/v2/buyer-readiness` | V2BuyerReadiness | V2Layout | Public | Diagnostic -- 4-question buyer readiness scoring tool | Yes |
| `/v2/private-cash-review` | V2PrivateCashReview | V2Layout | Gated (phone) | Decision chamber -- personalized cash review for returning leads | Yes |
| `/v2/thank-you` | V2ThankYou | V2Layout | Public | Post-conversion -- intent-specific confirmation with next steps | Yes |
| `/ad/seller` | SellerLanding | SellerFunnelLayout | Public | Ad landing -- inherited property hook, CTA to quiz | **No (EN only)** |
| `/ad/seller-quiz` | SellerQuiz | SellerFunnelLayout | Public | Ad funnel -- 5-step property quiz (situation/condition/timeline/value/address) | **No (EN only)** |
| `/ad/seller-result` | SellerResult | SellerFunnelLayout | Public | Ad funnel -- gated net sheet results, email capture, lead creation | **No (EN only)** |
| `*` | NotFound | None | Public | 404 catch-all | Partial |

**Legacy Redirects:**
- `/` redirects to `/v2`
- `/cash-offer` redirects to `/v2/cash-offer-options`
- `/podcast/episodes` redirects to `/v2/podcast`

---

### B. Navigation and Entry Points

**Global Header (V2Navigation):**
- Links: Home, Buy, Sell, Cash Offer Options, Guides, Podcast, Community
- "Book a Consultation" gold CTA button (routes to `/v2/book`)
- Language toggle (EN/ES) in header right side
- Mobile hamburger menu with all links + language toggle

**Global Footer (V2Footer):**
- Quick Links: Buy, Sell, Cash Offer Options, Podcast
- Contact: Phone (520-349-3248), Email, Social icons (Instagram, Facebook, LinkedIn, TikTok, YouTube)
- Selena nudge button ("Have a question? I'm here 24/7")
- Equal Housing Opportunity badge + disclaimer

**Floating Elements (on all V2 pages):**
- Selena floating chat button (bottom-right FAB) -- context-aware on guide pages
- Selena chat drawer (slide-up panel with message history, suggested replies, actions)

**Ad Funnel Layout (SellerFunnelLayout):**
- No navigation header
- Selena voice widget + floating button + chat drawer
- Compliance footer with Equal Housing logo

---

### C. Forms and Intakes

| Form | Location | Fields | Language | Submission Target | Consent |
|---|---|---|---|---|---|
| ConsultationIntakeForm | `/v2/book` | Name, Email, Phone, Language, Intent, Timeline, Property Address (conditional), Pre-approved (conditional), Neighborhoods, Price Range, Notes, Consent (comms + AI) | Yes | `submit-consultation-intake` edge function | Yes (TCPA + AI disclosure) |
| Path Quiz Contact Step | `/v2/quiz` | Name, Email, Phone | Yes | `submit-consultation-intake` edge function | **No** |
| Seller Quiz Contact Step | `/v2/seller-quiz` | Name, Email, Phone | Yes | `submit-consultation-intake` edge function | **No** |
| Ad Funnel Email Gate | `/ad/seller-result` | Name, Email | **EN only** | `submit-seller` edge function | **No** |
| LeadCaptureModal | Selena-triggered (any page) | Email (required), Name (optional), Phone (optional) | Yes | `upsert-lead-profile` edge function | **No** |
| PhoneVerificationGate | `/v2/private-cash-review` | Phone number | Yes | `verify-lead-phone` edge function | **No** |

---

### D. Tools and Interactive Elements

| Tool | Location | Inputs | Outputs | Personalized | CRM Connected | Selena Aware |
|---|---|---|---|---|---|---|
| Path Quiz | `/v2/quiz` | Intent, Timeline, Experience, Friction, Contact | Result path (buying/selling/cash/exploring) + CTAs | Yes (result-path specific) | Yes (submit-consultation-intake) | Yes (quiz_result entry source) |
| Seller Quiz | `/v2/seller-quiz` | Intent (sell/cash/compare), Timeline, Experience, Friction, Contact | Result path (selling/cash/selling_compare) + CTAs | Yes (3 variants) | Yes (submit-consultation-intake) | Yes (quiz_result entry source) |
| Buyer Readiness Check | `/v2/buyer-readiness` | Situation, Lender status, Priorities, Budget | Readiness score (0-100) + stage-specific guidance | Yes (score-based) | **Partial** (updates SessionContext, no direct CRM write) | Yes (via SelenaHandoff component) |
| TucsonAlpha Calculator | `/v2/cash-offer-options` | Estimated value, Motivation, Timeline | Cash vs Traditional net proceeds comparison | Yes (input-driven) | **No** (updates SessionContext only) | Yes (calculator entry source) |
| Ad Funnel Quiz | `/ad/seller-quiz` | Situation, Condition, Timeline, Value Range, Address | URL params for result page calculations | No | Yes (via submit-seller on result page) | Yes (via SellerFunnelLayout) |
| Google Reviews | `/v2/community` | None | Live Google Reviews carousel | No | No | No |

---

### E. Selena Touchpoints

**Launch Points:**
1. Floating chat button (every V2 page)
2. Footer nudge button (every V2 page)
3. Hero CTA buttons ("Chat with Selena") on: Home, Buy, Sell, Community
4. Result screen CTAs on: Path Quiz, Seller Quiz, Buyer Readiness Check
5. Calculator "Ask Selena" CTA on Cash Offer Options
6. Guide detail page Selena handoff component
7. SelenaTextTrigger on ad landing page
8. Post-booking prompt on Thank You page
9. Private Cash Review "Start My Review" button
10. Cash Offer Review "Request a Review" CTA

**Context Awareness:**
- Page path: Yes (via `useLocation`)
- User intent: Yes (from SessionContext)
- Language: Yes (from LanguageContext)
- Calculator results: Yes (via `setCalculatorResult` and entry context)
- Guide context: Yes (guideId, guideTitle, guideCategory passed via openChat)
- Quiz results: Yes (intent passed via openChat source='quiz_result')
- Post-booking state: Yes (source='post_booking' with userName and intent)

**Behavior:**
- Default: Passive (waits for user to click)
- On ad funnel result page: Semi-proactive (30-second timer opens chat if user hasn't submitted)
- On guide pages: Context-enriched (passes full guide metadata)
- Entry greetings: Context-specific based on 8+ entry sources with distinct copy per source/intent combination

---

## Critical Gaps (Must Fix)

### 1. TCPA Consent Missing on Quiz Forms
**Blocker to:** Compliance and automation
**Affected:** `/v2/quiz` (V2HomePathQuiz), `/v2/seller-quiz` (V2SellerQuiz)
**Detail:** The ConsultationIntakeForm on `/v2/book` has proper `consentCommunications` and `consentAI` checkboxes. Neither quiz form includes these. The `submit-consultation-intake` edge function accepts these fields but they arrive as `undefined` from quiz submissions. This is a legal risk for SMS/email automation in GHL workflows.

### 2. `quiz_completed` Bug in `/v2/quiz`
**Blocker to:** CRM data integrity
**Affected:** V2HomePathQuiz.tsx payload construction
**Detail:** The `...sessionDossier` spread happens after `quiz_completed: true` in the payload object, overwriting it with `false` from the session context (which hasn't been updated yet at submission time). The `/v2/seller-quiz` was built with the correct ordering; `/v2/quiz` still has the bug. GHL contacts from the path quiz never receive the `quiz_completed` tag.

### 3. Ad Funnel is English-Only
**Blocker to:** Spanish-market conversion
**Affected:** `/ad/seller`, `/ad/seller-quiz`, `/ad/seller-result`
**Detail:** All three ad funnel pages use hardcoded English strings with no `t()` calls, no `LanguageContext` consumption, and no language toggle. This means Spanish-language Facebook ads cannot route to a Spanish experience. Given that the Spanish-speaking market is the primary target audience for Kasandra's brand, this is a significant conversion gap.

### 4. No Meta Pixel or CAPI Integration
**Blocker to:** Ad optimization and attribution
**Affected:** All `/ad/*` pages and `/v2/seller-quiz`
**Detail:** No Pixel base snippet in `index.html`. No `fbq()` calls anywhere in the codebase. No server-side Conversions API edge function. Meta cannot optimize for conversions, build lookalike audiences, or track funnel drop-off without this.

### 5. Private Cash Review Page is Hidden
**Blocker to:** Conversion (returning leads)
**Affected:** `/v2/private-cash-review`
**Detail:** This page exists but is not linked from any navigation, CTA, or menu. It is phone-verification gated and designed for returning leads, but there is no pathway to reach it. The only way a user arrives here is by direct URL entry or if code explicitly navigates them (none does currently). This represents a dead Decision Chamber.

---

## Nice-to-Have Gaps (Phase 2)

### 1. No Buyer Ad Funnel
There is no `/ad/buyer` equivalent. If Facebook ads are run for buyer leads, there is no dedicated landing page, quiz, or result flow for buyers. The general `/v2/quiz` or `/v2/buyer-readiness` could serve this role but lacks the ad-optimized layout (no nav, no distractions) and Pixel integration.

### 2. No Off-Market/VIP Buyer Access
The buyer path has no exclusive content gate (e.g., "Get access to pocket listings" or "Pre-market alerts"). This is a common trust-building conversion tool in luxury and competitive markets.

### 3. Buyer Readiness Check Does Not Create a Lead
The Buyer Readiness Check tool computes a score and updates SessionContext but does not call any edge function or create a lead record. Users who complete it remain anonymous unless they subsequently open Selena or navigate to `/v2/book`. Adding a lightweight contact capture after the score display would close this gap.

### 4. Calculator Does Not Create a Lead
The TucsonAlpha Calculator on `/v2/cash-offer-options` updates SessionContext with rich data (`estimated_value`, `calculator_difference`, `calculator_advantage`, `calculator_motivation`) but creates no lead. This data is only useful if the user subsequently chats with Selena or books a consultation.

### 5. Guide Read Data is Local-Only
Guide reading history (`cc_guides_read` in localStorage) is used for personalization and cognitive stage tracking but is never synced to the CRM. GHL agents have no visibility into which guides a lead has consumed. Adding guide activity to the dossier payload would provide valuable conversation context.

### 6. Corner Connect vs Kasandra Brand Confusion
The brand is presented as "KASANDRA PRIETO" in the navigation and footer, with "Corner Connect | Realty Executives Arizona Territory" as a subtitle. The ad funnel uses "Corner Connect Team" in its footer. The relationship between these brands is never explained on any page. For Spanish-speaking audiences unfamiliar with US real estate team structures, this could create trust ambiguity.

### 7. Google Sign-In Button Placement
A Google Sign-In button appears on the Community page but nowhere else. Its purpose (identity bridging via `bridgeAuthToLead`) is valuable but its placement on a trust/authority page is unexpected. Users rarely visit the Community page with conversion intent.

---

## Clarifying Questions

1. **Ad funnel language priority:** Should the `/ad/*` funnel receive full ES translation immediately, or should `/v2/seller-quiz` (which already has ES) serve as the primary entry point for Spanish ad traffic?

2. **Private Cash Review activation:** Should `/v2/private-cash-review` be linked from the navigation or from specific CTAs (e.g., after calculator completion), or is it intentionally hidden pending a workflow trigger (e.g., GHL sends the URL via SMS after lead qualification)?

3. **TCPA consent scope:** Should the quiz-based consent checkboxes match the exact copy from ConsultationIntakeForm (communications consent + AI disclosure), or should a lighter single-checkbox version be used for quiz flows to reduce friction?

4. **Buyer Readiness lead capture:** Is there a design preference for how the Buyer Readiness Check should capture leads -- inline contact form after score display (like the quiz pattern), or a modal trigger (like LeadCaptureModal)?

5. **Lead scoring implementation:** Should lead scoring be computed client-side (from SessionContext signals like `readiness_score`, `quiz_completed`, `has_viewed_report`, `tool_used`) and sent to GHL as a single numeric field, or should GHL handle scoring internally via workflow conditions on existing tags and custom fields?

