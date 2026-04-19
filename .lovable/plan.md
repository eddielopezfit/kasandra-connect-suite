

# Full Hub Audit — UI/UX, Selena AI System Prompt, KB, Code Health

## Executive Summary

System is **architecturally production-grade** but has **9 concrete code/config issues** to fix before calling it locked. Selena's KB stack (KB-0 through KB-14, with KB-7.1 voice addendum and KB-9 containment overlay) is internally consistent and properly hierarchized. Guard state enforcement is intact. The issues are real but isolated — no architectural rework needed.

## Findings

### 🔴 Critical (fix now)

1. **Google Places API key invalid** — every page load logs `API key not valid. Please pass a valid API key.` from `fetch-google-reviews`. Reviews silently fall back, but the key in `GOOGLE_PLACES_API_KEY` is rejected by Google. Needs key rotation OR enable "Places API (New)" in Google Cloud Console for the existing key.

2. **`useVIP.ts` violates Rules of Hooks** — `useMemo` is called inside a try/catch fallback after `useVIPContext()` may have thrown. React will misbehave on the rare fallback path. Fix: call hooks unconditionally, then branch on whether context exists.

3. **Dead code path in ConciergeTabPanels.tsx** (line 459) — `{false && leadId && (...)}` is a permanently-disabled "View Latest Report" button. Either wire it to real report state (`reportManager.ts` already exists) or remove it.

### 🟡 Code Health (lint errors — 45 total, all real)

4. **Sparse arrays in 5 guide files** — `capital-gains-home-sale-arizona.ts`, `distressed-preforeclosure.ts`, `pricing-strategy.ts`, `sell-now-or-wait.ts`, `sell-or-rent-tucson.ts`, `understanding-home-valuation.ts` have `[ , ]` patterns (likely accidental trailing commas creating undefined slots). Could break runtime if iterated.

5. **`useSessionEnrichment.ts`** — 6 `any` types on session enrichment functions. Should be typed against `SessionContext`.

6. **`metaPixel.ts:104`** — uses `.apply()` instead of spread; minor but flagged.

7. **Empty interfaces** in `command.tsx` (line 24) and `textarea.tsx` (line 5) — shadcn defaults; safe to convert to type aliases.

### 🟢 Selena KB / System Prompt — Verified Healthy

KB inventory in `systemPromptBuilder.ts` (1,574 lines, EN+ES):
- **KB-0** (Constitution, non-overrideable) ✅
- **KB-4** (Capabilities & Limits) ✅
- **KB-6** (Real Estate Education, neutral) ✅
- **KB-7 / KB-7.1** (Voice — 7.1 supersedes 7 for tone) ✅
- **KB-8** (Corner Connect Platform, factual-only) ✅
- **KB-9 / 9.1–9.6** (Silence & Restraint / Containment) ✅
- **KB-10** (Concierge Routing Doctrine) ✅
- **KB-11** (Persona Authority) ✅
- **KB-12** (Session Trail Awareness) ✅
- **KB-13** (Fair Housing & AZ Law) ✅
- **KB-14** (Platform Hub Awareness) ✅

Hierarchy is consistent: every KB declares "Subordinate to KB-0." `guardState.ts` enforces KB-0 + KB-9 at runtime. Mode/journey separation is clean. Bilingual parity confirmed (EN block lines 14–777, ES block lines 778+).

**No KB drift, no contradictions, no missing boundary statements.**

### 🟢 Backend / Security — Verified Healthy

- Supabase linter: 2 advisory warnings only (1 generic policy template, 1 leaked-password protection — both non-blocking advisories, not actual vulnerabilities on our tables)
- All sensitive tables (`lead_profiles`, `lead_reports`, `lead_handoffs`, `seller_leads`, `conversation_memory`) have `Deny public read/write` RLS — correct
- `featured_listings` correctly public-readable for `active|pending|sold` only
- Edge function admin guards in place on cost-bearing functions
- TypeScript compile: clean (0 errors)

### 🟢 Console / Runtime — Clean

No browser console errors. No runtime errors. Network requests all 200 except the Google Places key issue (which is server-side and handled gracefully).

---

## Plan

### Phase A — Critical Fixes (must ship)

1. **Fix `useVIP.ts` Rules of Hooks violation** — restructure to call `useMemo` unconditionally, branch on context availability via a ref or separate hook.
2. **Remove dead `{false && leadId && ...}` block** in `ConciergeTabPanels.tsx` (or wire to report manager — recommend remove for now since report tracking state isn't wired).
3. **Document Google Places key issue** — add a console warning + user-facing note. The key needs rotation OR Places API (New) enabled in Google Cloud. I'll add a `.lovable/memory/` note since this requires user action in Google Cloud Console.

### Phase B — Code Health (cleanup pass)

4. **Fix sparse arrays in 6 guide files** — remove stray commas in EN/ES content arrays.
5. **Type `useSessionEnrichment.ts`** — replace 6 `any` with proper `SessionContext` partials.
6. **Fix `metaPixel.ts:104`** — replace `.apply()` with spread operator.
7. **Convert empty interfaces** in `command.tsx` + `textarea.tsx` to type aliases.

### Phase C — Verification

8. Re-run `npx eslint src --quiet` → expect 0 errors
9. Re-run `npx tsc -p tsconfig.app.json --noEmit` → expect 0 errors
10. Confirm Selena chat still loads and chip governance still routes deterministically

### NOT Doing (intentional, per architecture rules)

- Not touching `guardState.ts` KB hierarchy — verified intact
- Not touching `systemPromptBuilder.ts` KB blocks — verified consistent
- Not refactoring `selena-chat/index.ts` (1,672 lines) — already extracted to 6 modules
- Not changing `notify-handoff` fire-and-forget pattern — intentional
- Not removing `check-availability` stub TODO — tracked work item
- Not changing the 2 Supabase advisory warnings — they're informational, not vulnerabilities

### Risk

Low. Phase A is surgical (3 files). Phase B is mechanical (data + minor utility). No edge function logic, no KB content, no chip registry, no RLS changes.

