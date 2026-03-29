# Memory: architecture/selena-orchestration-layer
Updated: now

## Phase 3: Selena Orchestration Layer — Complete

### What Changed

#### 1. VIP Injection into Selena Edge Function
- `supabase/functions/selena-chat/index.ts` now builds a `[VISITOR INTELLIGENCE PROFILE]` context block
- Injected between the base system prompt and memory/governance hints
- Includes: journey depth, booking readiness, continuation summary, friction signals
- Bilingual (EN/ES) — mirrors client-side VIP selectors exactly
- Zero new edge functions needed — all data was already available in the handler context

#### 2. VIPNextBestAction Component
- `src/components/v2/VIPNextBestAction.tsx` — uses `useVIP({ localOnly: true })`
- Shows VIP continuation summary + recommended next step CTA
- Renders on: V2Home (returning users), V2Sell (engaged/ready), V2Buy (non-new)
- Self-hiding for new visitors and post-booking users

#### 3. FrictionEscalation Component
- `src/components/v2/FrictionEscalation.tsx` — triggers when `frictionScore > 50`
- Shows calm but assertive booking CTA with "No pressure" subtext
- "Overdue" variant (gold border) for high-engagement users who haven't booked
- Renders on: V2Home, V2Sell, V2Buy

#### 4. VIP-Aware Hero
- GlassmorphismHero already adapts by journeyDepth (new/exploring/engaged/ready)
- Returns personalized headlines with first name when available
- No additional changes needed — existing logic mirrors VIP selectors

### Orchestration Flow
```
Session Start → buildVIPFromLocal() → instant local VIP
   ↓
User sends message → SelenaChatContext sends full context to selena-chat
   ↓
selena-chat handler → builds VIP summary server-side → injects into system prompt
   ↓
Selena responds with journey-aware, friction-aware, depth-aware language
   ↓
UI renders VIPNextBestAction + FrictionEscalation based on local VIP selectors
```

### Files Changed
| File | Change |
|------|--------|
| `supabase/functions/selena-chat/index.ts` | +45 lines: VIP context block assembly + injection into system prompt |
| `src/components/v2/VIPNextBestAction.tsx` | New: VIP-driven next step card |
| `src/components/v2/FrictionEscalation.tsx` | New: friction-triggered booking escalation |
| `src/pages/v2/V2Home.tsx` | Added VIPNextBestAction + FrictionEscalation |
| `src/pages/v2/V2Sell.tsx` | Added VIPNextBestAction + FrictionEscalation |
| `src/pages/v2/V2Buy.tsx` | Added VIPNextBestAction + FrictionEscalation |
