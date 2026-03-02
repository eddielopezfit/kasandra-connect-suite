
# KB-7.1, KB-8, System Prompt Rewrite — SHIPPED

## Changes Applied

| File | Change |
|------|--------|
| `selena-chat/index.ts` (EN prompt) | Replaced identity header (lines 774-798) with KB-7.1-aware header: Associate Broker title, Corner Connect platform reference, KB-7.1 voice authority |
| `selena-chat/index.ts` (EN KB-7) | Pruned tone-governing language from KB-7, added KB-7.1 override header, restructured as "structural rules only" |
| `selena-chat/index.ts` (EN KB-7.1) | Added full KB-7.1 Brand Voice Calibration Addendum after KB-7 boundary |
| `selena-chat/index.ts` (EN KB-8) | Added full KB-8 Corner Connect Platform Context after KB-6 boundary |
| `selena-chat/index.ts` (ES prompt) | Mirrored all EN changes: new header, KB-7 restructure, KB-7.1, KB-8 — all native Spanish |
| `selena-chat/index.ts` (ES voice rules) | Changed from "tú always" to "usted default, tú only if user initiates" per KB-7.1 |
| `selena-chat/index.ts` (sellerDecisionHint) | Made bilingual — now generates Spanish hint when language is 'es' |
| `selena-chat/modeContext.ts` | Fixed Mode 2 Spanish chip: "Quick seller readiness check" → "Check rápido de preparación para vender" |

## Key Behavioral Changes

- **Spanish register**: Default changed from "tú" to "usted" for first-time interactions
- **Kasandra title**: Updated from "solo practitioner" to "Associate Broker"
- **Corner Connect**: Now a defined platform entity with verified capabilities (6,000+ transactions, S.M.A.R.T. system, dual seller pathways)
- **Voice authority**: KB-7.1 is now the single authoritative source for tone decisions
