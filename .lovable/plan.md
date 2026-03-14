

## Fix Build Errors — Double Commas in 5 Guide Files

### Problem
All 5 files have `],,` (double comma) at the end of the `sections` array, which breaks TypeScript parsing of everything after it (including `externalLinks`).

### Changes

**1. `src/data/guides/buying-home-noncitizen-arizona.ts` line 90**
Change `],,` → `],`

**2. `src/data/guides/down-payment-assistance-tucson.ts` line 83**
Change `],,` → `],`

**3. `src/data/guides/fha-loan-pima-county-2026.ts` line 83**
Change `],,` → `],`

**4. `src/data/guides/first-time-buyer-guide.ts` line 125**
Change `],,` → `],`

**5. `src/data/guides/va-home-loan-tucson.ts` line 83**
Change `],,` → `],`

All 5 are identical one-character fixes. No other changes needed — the `externalLinks` blocks are already correctly structured after the double comma is fixed.

