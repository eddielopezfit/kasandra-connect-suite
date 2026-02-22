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

## Phase A: Critical Fixes ✅ Complete

- 1.1 — Fixed `quiz_completed` dossier override bug in V2HomePathQuiz
- 1.2 — Added TCPA consent checkbox to V2HomePathQuiz + V2SellerQuiz
- 1.3 — Added Private Cash Review CTA to CalculatorNextSteps
- 1.4 — Added Buyer Readiness lead capture modal with 3 guardrails + fallback save link

## Phase B: Calculator & Buyer Readiness Enrichment ✅ Complete

- B1 — Calculator next-steps CTA enriches SessionContext and routes to `/v2/private-cash-review`
- B2 — Buyer Readiness auto LeadCaptureModal with guardrails (lead_id check, stored email check, namespaced prompted flag)

## Phase C: Ad Funnel Bilingual ✅ Complete

- C1 — SellerFunnelLayout: language toggle header + unified brokerage footer
- C2 — SellerLanding + SelenaTextTrigger fully bilingual with proper accents/punctuation
- C3 — SellerQuiz: dynamic `getQuizSteps(t)` with full ES accents
- C4 — SellerResult: bilingual chart, form, proactive Selena message; removed "Certified" claim

## Phase D: Meta Pixel Integration ✅ Complete

### D1 — Pixel Utility + RouteAnalytics
- **New:** `src/lib/metaPixel.ts` — lazy init, PII-safe, debug/suppress modes
- **New:** `src/components/RouteAnalytics.tsx` — fires PageView on route change (deduplicated)
- **Edit:** `src/App.tsx` — RouteAnalytics mounted inside BrowserRouter
- Env vars: `VITE_META_PIXEL_ID`, `VITE_PIXEL_DEBUG`, `VITE_PIXEL_SUPPRESS`

### D2 — Funnel Event Wiring
| Page | Events Fired |
|---|---|
| `/ad/seller` | ViewContent (mount), SellerQuizStarted (CTA click) |
| `/ad/seller-quiz` | ViewContent (mount), SellerQuizCompleted (navigate to results) |
| `/ad/seller-result` | ViewContent (mount, once), Lead + SellerReportUnlocked (form submit) |
| `/v2/seller-quiz` | Lead + V2QuizCompleted (submit success) |
| `/v2/buyer-readiness` | BuyerReadinessCompleted (score reveal), Lead + BuyerReadinessLeadCaptured (modal submit) |
| Calculator Next Steps | PrivateCashReviewRequested (CTA click) |

### D3 — PII & Safety Guardrails
- No email/phone/name/address in any event params
- Dollar amounts bucketed via `getDifferenceBand()`: 0-10k, 10-25k, 25-50k, 50k+
- Readiness scores bucketed via `getScoreBand()`: 0-39, 40-59, 60-79, 80-100
- Debug mode logs + fires; Suppress mode logs only (no fbq calls)

### D4 — Bugs Fixed
- `init()` race condition: handles pre-existing `window.fbq` correctly
- ViewContent spam: separated into own `useEffect([], [])` on SellerResult

---

## Phase E: Unified Lead Scoring ✅ Complete

### E1 — Shared `computeLeadScore()` in `_shared/normalizeLead.ts`
- Rubric: intent(25) + timeline(25) + quiz(10) + phone(10) + address(10) + tool(5) + readiness(5) + consent(5) + report(5) = 100 max
- Buckets: >=75 hot, >=45 warm, else cold
- `shouldSkipScoreLog()` dedupe helper (Guardrail 4: no spam within 10 min if score unchanged)

### E2 — DRY refactor `submit-consultation-intake`
- Replaced 80-line inline `computeLeadScore()` with shared import
- Persists `lead_score` + `lead_grade` to `lead_profiles`
- Uses deduped event log

### E3 — Scoring added to `upsert-lead-profile`
- Accepts `tool_used`, `readiness_score`, `quiz_completed`, `has_viewed_report`, `timeline`, `consent_communications`
- Guardrail 3: `consent_communications` defaults false — only true when explicitly collected
- GHL payload includes `selena_lead_score`, `lead_score_bucket`, `lead_score_reasons`

### E4 — Scoring + `lead_profiles` upsert added to `submit-seller`
- Guardrail 1: email-primary dedup with session_id fallback; reuses canonical lead_id
- Guardrail 2: `quiz_completed = true` only when >=3 of 4 quiz fields (situation/condition/timeline/value) are non-empty
- Upserts into `lead_profiles` with intent=sell, timeline, situation, condition
- GHL payload includes scoring fields

### E5 — Frontend `LeadCaptureModal` enriched
- Passes `tool_used`, `readiness_score`, `quiz_completed`, `has_viewed_report`, `timeline` from SessionContext
- Guardrail 3: `consent_communications: false` explicitly set

---

## Phase F: Nice-to-Have (Future)

- Buyer ad funnel (`/ad/buyer`)
- Off-market/VIP buyer access gate
- Guide read history sync to CRM
- Calculator lead capture
- Google Sign-In repositioning
- Server-side Conversions API edge function (CAPI — Phase D2.5)
