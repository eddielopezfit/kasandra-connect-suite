

# Fix: selling-for-top-dollar "Max 1 Human Element" Rule Violation

## Status of Previous Concerns

The renderer calls (`MediaSlotRenderer`) are **already correct and compiling**. The component is defined as a proper React component with JSX syntax and stable `key={slot.id}` props. No fix needed there.

The only actionable issue is the `selling-for-top-dollar` config violating the "max 1 human element" rule.

---

## The Problem

In `src/lib/guides/guideMediaSlots.ts`, `selling-for-top-dollar` has:
- `sell-trust`: type `video` (human element)
- `sell-clarity`: type `pull-quote-image` (human element)

The `validateMediaSlots` guard will fire a console warning once the video slot gets a `src`. The rule says: max 1 human element per guide.

## The Fix

**File**: `src/lib/guides/guideMediaSlots.ts` (lines 99-109)

Change `sell-clarity` from `pull-quote-image` to `image` type and remove the `quote`/`quoteEs` fields. The quote text ("A good decision comes from understanding your options, not from pressure.") is already present in the guide prose, so elevating it as a standalone pull-quote is redundant once the video slot is active.

| Field | Before | After |
|-------|--------|-------|
| `type` | `pull-quote-image` | `image` |
| `purpose` | No-pressure reinforcement after sell vs wait comparison | Calm visual anchor after sell vs wait comparison |
| `quote` | "A good decision comes from understanding..." | (removed) |
| `quoteEs` | "Una buena decision viene de entender..." | (removed) |

This is a 1-slot config change in a single file. No rendering logic, routing, or content changes.

## Files Changed

| File | Lines | Change |
|------|-------|--------|
| `src/lib/guides/guideMediaSlots.ts` | 99-109 | Change sell-clarity type from pull-quote-image to image, remove quote fields |

## What Is NOT Touched

- No rendering logic changes
- No guide content changes
- No routing or analytics changes
- No other guide slot configs

