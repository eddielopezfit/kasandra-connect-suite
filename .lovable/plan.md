

# ZIP Explorer: Two Fixes

Single file: `src/components/v2/neighborhood/NeighborhoodExplorer.tsx`

## Fix 1 — Falsy check (line 45)

Change `data?.negotiation_gap` to `data?.negotiation_gap != null` so a value of `0` isn't treated as falsy.

## Fix 2 — ZIP suggestion chips (after line 181)

Add a row of clickable ZIP chips below the input: `85718 · 85742 · 85719 · 85629`. Clicking a chip sets the ZIP and auto-triggers explore. Styled as small muted pill buttons matching the `cc-*` system.

```text
┌──────────────────────────────────┐
│  [  Enter ZIP code  ] [Explore]  │
│  Try: 85718 · 85742 · 85719     │  ← new chips row
└──────────────────────────────────┘
```

Implementation: after the `</div>` closing the flex row (line 181), add a `<div>` with 4 `<button>` elements. Each `onClick` sets `setZip(code)` then calls `handleExplore()` via a small helper (need to extract the trimmed zip from state won't work — pass zip directly). Simplest: set zip then use `useEffect` or just inline the explore call with the known zip. Cleanest approach: extract explore logic into a `doExplore(zipCode: string)` function, call it from both `handleExplore` and chip clicks.

**1 file, ~25 lines changed.**

