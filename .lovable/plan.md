

## Plan: 5 High-Impact Tools — Revised Blueprint

### Approved Revisions (4)

1. **No semantic drift on buyer_criteria**: Property details for valuation requests are stored in the handoff payload (`summary_json` + `summary_md`), NOT in `lead_profiles.buyer_criteria`. The `buyer_criteria` field remains buyer-only.

2. **Home valuation requires name, email, phone**: All three fields are required — this is a high-intent seller lead, not a low-friction opt-in.

3. **Explicit source attribution on all 3 tools**:
   - `source=website` on all lead_profiles upserts
   - `tool_origin=affordability_calculator` / `bah_calculator` / `home_valuation` in event payloads and handoff metadata

4. **No hardcoded market delta in Selena low-offer routing**: The modeContext hint references "current market negotiation context" dynamically via Market Pulse data rather than a fixed 2.5% number.

---

### Implementation Phases

| Phase | Task | Files |
|-------|------|-------|
| 1 | Expand affordabilityAlgorithm (PMI, credit tiers, breakdown) | `src/lib/calculator/affordabilityAlgorithm.ts` |
| 2 | Create bahMortgageAlgorithm | `src/lib/calculator/bahMortgageAlgorithm.ts` |
| 3 | Build V2AffordabilityCalculator page | `src/pages/v2/V2AffordabilityCalculator.tsx` |
| 4 | Build V2BAHCalculator page | `src/pages/v2/V2BAHCalculator.tsx` |
| 5 | Create submit-valuation-request edge function | `supabase/functions/submit-valuation-request/index.ts` |
| 6 | Build V2HomeValuation page (3-step, all fields required) | `src/pages/v2/V2HomeValuation.tsx` |
| 7 | Register routes in App.tsx | `src/App.tsx` |
| 8 | Add analytics event types | `src/lib/analytics/logEvent.ts` |
| 9 | Add Selena keyword hints (4 blocks) | `supabase/functions/selena-chat/modeContext.ts` |
| 10 | Add SEO route meta | `src/lib/seo/seoRouteMeta.ts` |
