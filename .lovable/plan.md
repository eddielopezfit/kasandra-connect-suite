

# Guide Registry Audit Report

## Summary

**38 guides registered** — all status `'live'`, all have data loaders, all have routes via `/guides/:guideId`, all have at least one CTA (`primaryAction`), all are linked from the `/guides` hub page.

No orphan guides. No missing CTAs. No duplicate IDs.

---

## Issues Found

### 1. ERRORS — ActionSpec Validation Failures

| Guide ID | Issue |
|---|---|
| `va-home-loan-tucson` | `secondaryAction` uses `{ type: 'navigate', path: '/buyer-readiness' }` but `/buyer-readiness` is **not in `NAVIGATE_WHITELIST`** in `actionSpec.ts`. This action will fail `isActionValid()`. Should use `{ type: 'open_tool', toolId: 'buyer-readiness' }` instead. |

### 2. WARNINGS — Duplicate `sortOrder` Values

Two pairs of guides share the same `sortOrder`, which makes grid ordering nondeterministic:

| sortOrder | Guides |
|---|---|
| **35** | `cash-vs-traditional-sale`, `va-home-loan-tucson` |
| **36** | `move-up-buyer`, `divorce-home-sale-arizona` |

**Fix:** Assign unique sortOrder values to the newer ghost guides (e.g., `va-home-loan-tucson: 46`, `divorce-home-sale-arizona: 41`).

### 3. WARNINGS — Near-Duplicate Content Topics

| Guide A | Guide B | Overlap |
|---|---|---|
| `divorce-selling` | `divorce-home-sale-arizona` | Both cover selling a home during divorce in Arizona with community property law. Different registry entries, different data files, but very similar SEO targets. |
| `first-time-buyer-programs-pima-county` | `arizona-first-time-buyer-programs` | Both cover first-time buyer assistance programs in the same geography. |

These aren't broken — they may be intentional (one broader, one local) — but they risk keyword cannibalization.

### 4. WARNINGS — Missing `lifeEvent` Values

Five guides have `lifeEvent: undefined`:

- `itin-loan-guide`
- `tucson-market-update-2026`
- `bad-credit-home-buying-tucson`
- `down-payment-assistance-tucson`
- `fha-loan-pima-county-2026`

This means Selena chat context won't carry the life event when users enter from these guides. Not a build error, but reduces personalization quality.

### 5. INFO — Hero Image Dependency on Storage

All Tier 1/2 guides (except the 4 original Tier 1 guides that use `.webp`) reference hero images at `${STORAGE_BASE}/guides/{id}/hero.jpg`. These are external URLs — if any image hasn't been uploaded to the storage bucket, it will 404 silently (the `GuideImage` component returns `null` when `src` is missing, but does NOT handle failed loads).

**Guides with media slots defined:** 38/38 (all have at least one slot defined in `guideMediaSlots.ts`).

Tier 3 stories have slots defined but `src` is correctly stripped by `getGovernedMediaSlots()` — working as designed.

---

## Implementation Plan (3 fixes)

### Fix 1: `va-home-loan-tucson` secondaryAction
**File:** `src/lib/guides/guideRegistry.ts` line 1323
Change `{ type: 'navigate', path: '/buyer-readiness', ... }` to `{ type: 'open_tool', toolId: 'buyer-readiness', ... }`.

### Fix 2: Deduplicate sortOrder values
**File:** `src/lib/guides/guideRegistry.ts`
- `va-home-loan-tucson` sortOrder: `35` → `46`
- `divorce-home-sale-arizona` sortOrder: `36` → `41`

### Fix 3: Add missing lifeEvent values
**File:** `src/lib/guides/guideRegistry.ts`
- `itin-loan-guide`: `'first_time_buying'`
- `tucson-market-update-2026`: `'general_selling'`
- `bad-credit-home-buying-tucson`: `'first_time_buying'`
- `down-payment-assistance-tucson`: `'first_time_buying'`
- `fha-loan-pima-county-2026`: `'first_time_buying'`

All three fixes are in one file, no other files affected.

