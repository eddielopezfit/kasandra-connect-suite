# Kasandra's Oasis: Implementation Roadmap

## Decisions (Approved)

| # | Question | Decision |
|---|---|---|
| 1 | Ad funnel language | **Both** — Translate `/ad/*` pages AND keep `/v2/seller-quiz` as alternate ES entry |
| 2 | Private Cash Review access | **CTA after calculator** — Show CTA on `/v2/cash-offer-options` after calculator completion |
| 3 | TCPA consent format | **Single combined checkbox** — One checkbox covering communications + AI disclosure |
| 4 | Lead scoring | **Edge function** — Compute server-side in submit edge functions before sending to GHL |
| 5 | Buyer lead capture | **Modal trigger** — Pop up LeadCaptureModal after Buyer Readiness score is shown |

---

## Phase 1: Critical Fixes (Must Fix)

### 1.1 — Fix `quiz_completed` bug in V2HomePathQuiz
- **File:** `src/pages/v2/V2HomePathQuiz.tsx`
- **Fix:** Reorder payload so `quiz_completed: true` and `quiz_result_path` come AFTER `...sessionDossier` spread

### 1.2 — Add TCPA consent checkbox to quiz forms
- **Files:** `src/pages/v2/V2HomePathQuiz.tsx`, `src/pages/v2/V2SellerQuiz.tsx`
- **Spec:** Single combined checkbox with bilingual copy via `t()`
- **Behavior:** Block submission until checked; pass `consent_communications: true` and `consent_ai: true` in payload

### 1.3 — Add Private Cash Review CTA after calculator
- **File:** `src/components/v2/calculator/CalculatorNextSteps.tsx` or equivalent
- **Spec:** Bilingual CTA card linking to `/v2/private-cash-review` after results display

### 1.4 — Add Buyer Readiness lead capture modal
- **File:** `src/pages/v2/V2BuyerReadiness.tsx`
- **Spec:** Trigger `LeadCaptureModal` ~2s after readiness score reveal

---

## Phase 2: Ad Funnel Bilingual

### 2.1 — Translate `/ad/seller` (SellerLanding)
### 2.2 — Translate `/ad/seller-quiz` (SellerQuiz)
### 2.3 — Translate `/ad/seller-result` (SellerResult)
### 2.4 — Add language toggle to SellerFunnelLayout

---

## Phase 3: Meta Pixel & Telemetry

### 3.1 — Add Meta Pixel base code to `index.html`
### 3.2 — Implement funnel events (ViewContent, InitiateCheckout, SellerQuizStep, Lead)
### 3.3 — Server-side CAPI edge function (Phase 3b)

---

## Phase 4: Lead Scoring (Edge Function)

### 4.1 — Add scoring logic to submit edge functions
- **Signals:** quiz_completed, readiness_score, tool_used, intent, timeline urgency, consent
- **Output:** Numeric `lead_score` (0-100) → `lead_profiles.lead_score` + GHL

---

## Phase 5: Nice-to-Have (Future)

- Buyer ad funnel (`/ad/buyer`)
- Off-market/VIP buyer access gate
- Guide read history sync to CRM
- Calculator lead capture
- Corner Connect brand clarification
- Google Sign-In repositioning
