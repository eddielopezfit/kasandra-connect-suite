# Memory: architecture/visitor-intelligence-profile
Updated: now

## What It Is
The Visitor Intelligence Profile (VIP) is the canonical single source of truth for all visitor state. It replaces fragmented reads from localStorage, SessionContext, lead_profiles, session_snapshots, conversation_memory, and decision_receipts with a unified typed interface.

## Files
- `src/lib/vip/types.ts` — Canonical VIP schema (Identity, Attribution, Intent, Financial, Journey, Memory)
- `src/lib/vip/builder.ts` — `buildVIPFromLocal()` (sync) + `mergeServerData()` (server hydration)
- `src/lib/vip/selectors.ts` — Pure selector functions: `selectBookingReadiness`, `selectFrictionScore`, `selectRecommendedNextStep`, `selectContinuationSummary`
- `src/lib/vip/index.ts` — Public API barrel
- `src/hooks/useVIP.ts` — React hook with local-first + async server hydration

## Consumers
- `BookingHydrationPanel` — uses `useVIP({ localOnly: true })`
- `useSessionPrePopulation` — delegates to `buildVIPFromLocal()` for identity/intent

## Sync Flow
1. `buildVIPFromLocal()` reads localStorage + SessionContext (instant, no network)
2. `useVIP()` calls `get-session-snapshot` + `get-conversation` edge functions in parallel
3. `mergeServerData()` applies server data with priority: server identity > local identity, local journey > server journey (union for tools/guides)

## Selectors
- `selectBookingReadiness` → not_ready | warming | ready | overdue
- `selectFrictionScore` → 0-100 (higher = more friction)
- `selectRecommendedNextStep` → { type, labelEn, labelEs, destination, priority }
- `selectContinuationSummary` → { en, es, insightsCount }
