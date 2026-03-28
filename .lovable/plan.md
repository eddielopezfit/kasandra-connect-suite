

# Optimization Audit — 5 Fixes

All 5 issues from the audit are confirmed in the codebase. Here's the implementation plan.

## Fix 1: Add rate limiting to `selena-memory` (Medium-High)

**File:** `supabase/functions/selena-memory/index.ts`

Import `checkRateLimit`, `extractRateLimitKey`, `rateLimitResponse` from `_shared/rateLimit.ts`. After the Supabase client init and body parse (line 43), extract the rate limit key and check before processing. Add `'selena-memory'` entry to `_shared/rateLimit.ts` endpoint limits (10 req/min — matches its write-heavy nature).

## Fix 2: Remove PII logging from `create-handoff` (Medium)

**File:** `supabase/functions/create-handoff/index.ts`

Replace line 254:
```
console.log('[create-handoff] 🔔 NOTIFICATION TO KASANDRA:', JSON.stringify(notifyPayload, null, 2));
```
With:
```
console.log(`[create-handoff] 🔔 Handoff notification fired for lead=${lead_id}, priority=${priority}, channel=${channel}`);
```

## Fix 3: Add rate limiting to `check-availability` (Low-Medium)

**File:** `supabase/functions/check-availability/index.ts`

Import rate limiting from `_shared/rateLimit.ts`. Add check after body parse, before processing. Add `'check-availability'` entry to `_shared/rateLimit.ts` (10 req/min).

## Fix 4: Move GHL Calendar/Location IDs to secrets with fallback (Low)

**File:** `supabase/functions/check-availability/index.ts`

Replace hardcoded constants:
```typescript
const GHL_CALENDAR_ID = Deno.env.get("GHL_CALENDAR_ID") ?? "N7himS3BLf5KxaVbQPz6";
const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID") ?? "kGfxAFqz1M7sxRFm52L1";
```

Note: `GHL_LOCATION_ID` is already set as a secret. `GHL_CALENDAR_ID` is not — will need to be added.

## Fix 5: Reduce `generate-daily-guide` max_tokens (Cost)

**File:** `supabase/functions/generate-daily-guide/index.ts`

Change line 176 from `max_tokens: 8000` to `max_tokens: 5000`. Guides are structured JSON with ~3-4K tokens typical output.

## Shared change

**File:** `supabase/functions/_shared/rateLimit.ts`

Add two new entries to `ENDPOINT_LIMITS`:
```typescript
'selena-memory': { maxRequests: 10, windowSeconds: 60 },
'check-availability': { maxRequests: 10, windowSeconds: 60 },
```

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/_shared/rateLimit.ts` | Add 2 endpoint entries |
| `supabase/functions/selena-memory/index.ts` | Add rate limiting (3 lines) |
| `supabase/functions/create-handoff/index.ts` | Replace PII log with safe log |
| `supabase/functions/check-availability/index.ts` | Add rate limiting + env-based GHL IDs |
| `supabase/functions/generate-daily-guide/index.ts` | Reduce max_tokens 8000→5000 |

## Secret to add

| Secret | Value |
|--------|-------|
| `GHL_CALENDAR_ID` | `N7himS3BLf5KxaVbQPz6` |

`GHL_LOCATION_ID` already exists as a secret.

