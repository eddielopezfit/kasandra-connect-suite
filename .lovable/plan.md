

# Wire All Image Slots to Public Asset Paths

## What Changes

**Single file**: `src/lib/guides/guideMediaSlots.ts`

- Remove the two `import` statements for `ftb-orientation.jpg` and `sell-orientation.jpg`
- Replace imported references with public path strings
- Add `src` fields to all 16 image/checklist-image slots that are currently missing them

## Path Convention

All paths follow: `/guides/<guide-slug>/<asset-name>.jpg`

| Slot ID | Type | Path |
|---------|------|------|
| ftb-orientation | image | `/guides/first-time-buyer-guide/orientation.jpg` |
| ftb-clarity | checklist-image | `/guides/first-time-buyer-guide/checklist.jpg` |
| sell-orientation | image | `/guides/selling-for-top-dollar/orientation.jpg` |
| sell-clarity | image | `/guides/selling-for-top-dollar/clarity.jpg` |
| val-orientation | image | `/guides/understanding-home-valuation/orientation.jpg` |
| val-clarity | image | `/guides/understanding-home-valuation/clarity.jpg` |
| cash-orientation | image | `/guides/cash-offer-guide/orientation.jpg` |
| cash-clarity | checklist-image | `/guides/cash-offer-guide/checklist.jpg` |
| ftbs-orientation | image | `/guides/first-time-buyer-story/orientation.jpg` |
| ftbs-clarity | image | `/guides/first-time-buyer-story/clarity.jpg` |
| bbs-orientation | image | `/guides/budget-buyer-story/orientation.jpg` |
| bbs-clarity | image | `/guides/budget-buyer-story/clarity.jpg` |
| sms-orientation | image | `/guides/seller-stressful-market-story/orientation.jpg` |
| sms-clarity | image | `/guides/seller-stressful-market-story/clarity.jpg` |
| ssc-orientation | image | `/guides/spanish-speaking-client-story/orientation.jpg` |
| ssc-clarity | image | `/guides/spanish-speaking-client-story/clarity.jpg` |

## What Is NOT Changed

- **Video slots** (`sell-trust`, `cash-trust`): no `src` added (no video files yet)
- **Pull-quote-image slots**: no `src` added (they render via `quote` text + Kasandra headshot, no background image needed)
- No guide text, routing, scoring, analytics, or schema changes
- No other files modified

## Important Note

The public folder directories (`/public/guides/<slug>/`) and actual image files need to exist for the images to render. Once the `src` paths are wired, `GuideImage` will attempt to load them. Missing files will simply show a broken image -- but the slot system itself will be fully configured and ready for asset drops.

## Technical Detail

Lines 1-2 (imports) are removed. The `src` field on `ftb-orientation` (line 59) changes from `ftbOrientationImg` to a string. The `src` field on `sell-orientation` (line 92) changes similarly. All other image/checklist-image slots gain a new `src: '/guides/...'` line.

