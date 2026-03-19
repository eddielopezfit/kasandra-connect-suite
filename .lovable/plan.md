

# Fix 9 Build Errors — Plan

All errors are pre-existing bugs from duplicate auth patterns and a `checkRateLimit` signature mismatch. No functional changes — just fixing TypeScript errors.

---

## Error Group 1: `checkRateLimit` called with 4 args (expects 3)

**Files**: `fetch-google-reviews`, `update-lead-score`, `verify-lead-phone`

**Root cause**: `checkRateLimit(supabase, key, endpoint)` takes 3 args. These callers pass a 4th arg (custom max requests) that the function doesn't accept. The function uses a hardcoded `ENDPOINT_LIMITS` map — but these 3 endpoints aren't in that map, so they fall back to a permissive default (20 req/60s).

**Fix**: Add all 3 endpoints to `ENDPOINT_LIMITS` in `_shared/rateLimit.ts` with the limits the callers intended, then remove the 4th argument from each call site:

```
'fetch-google-reviews': { maxRequests: 5, windowSeconds: 60 },
'update-lead-score':    { maxRequests: 10, windowSeconds: 60 },
'verify-lead-phone':    { maxRequests: 5, windowSeconds: 60 },
```

**Call site changes** (remove 4th arg):
- `fetch-google-reviews/index.ts` line 48: `checkRateLimit(supabase, rlKey, 'fetch-google-reviews')`
- `update-lead-score/index.ts` line 48: `checkRateLimit(supabase, rlKey, 'update-lead-score')`
- `verify-lead-phone/index.ts` line 42: `checkRateLimit(supabase, rlKey, 'verify-lead-phone')`

---

## Error Group 2: Duplicate `authHeader` declarations

**Files**: `generate-guide-image/index.ts`, `generate-all-guide-images/index.ts`

**Root cause**: Two auth blocks were added sequentially — a JWT check (lines 20-29) and an admin-secret check (lines 33-39) — both declaring `const authHeader`. Per project conventions, cost-bearing functions should use only the `x-admin-secret` pattern.

**Fix**: Remove the JWT auth block entirely (lines 19-30 in `generate-guide-image`, lines 44-54 in `generate-all-guide-images`). Keep only the `x-admin-secret` check, renamed to `const adminSecret`:

```typescript
const adminSecret = req.headers.get('x-admin-secret');
if (adminSecret !== Deno.env.get('ADMIN_SECRET')) {
  return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

---

## Error Group 3: Type mismatch in `selena-chat/index.ts`

**Line 3780**: `closingCostData: context.closing_cost_data` — the value can be `null` but the `EntryContext` type expects `undefined`.

**Fix**: `closingCostData: context.closing_cost_data ?? undefined`

---

## Error Group 4: Missing property in `submit-valuation-request`

**Line 226**: `payload.estimatedValue` doesn't exist on `ValuationPayload` interface.

**Fix**: Add `estimatedValue?: number;` to the `ValuationPayload` interface (around line 25).

---

## Summary

| File | Fix |
|------|-----|
| `_shared/rateLimit.ts` | Add 3 endpoints to `ENDPOINT_LIMITS` |
| `fetch-google-reviews/index.ts` | Remove 4th arg from `checkRateLimit` |
| `update-lead-score/index.ts` | Remove 4th arg from `checkRateLimit` |
| `verify-lead-phone/index.ts` | Remove 4th arg from `checkRateLimit` |
| `generate-guide-image/index.ts` | Remove duplicate JWT block, keep admin-secret |
| `generate-all-guide-images/index.ts` | Remove duplicate JWT block, keep admin-secret |
| `selena-chat/index.ts` | Add `?? undefined` to `closingCostData` |
| `submit-valuation-request/index.ts` | Add `estimatedValue` to interface |

8 files, 9 errors fixed. No behavior changes.

