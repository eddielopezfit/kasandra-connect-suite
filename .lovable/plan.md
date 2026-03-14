

## Replace "Meet Kasandra" Video

### What happens
Replace the existing `public/videos/kasandra-welcome.mp4` with the uploaded video file. No code changes required — every page referencing this path (homepage, about, private cash review) will automatically use the new video.

### Affected pages (no code edits needed)
- **V2Home.tsx** — 3 breakpoint variants of the "Meet Kasandra (60 seconds)" section
- **V2About.tsx** — about page video embed
- **V2PrivateCashReview.tsx** — cash review page video

### Build errors
The two TypeScript errors in `guideRegistry.ts` are pre-existing and unrelated to this change. They involve invalid `DisclaimerType` and `AuthorityTheme` values. I will fix those in the same pass:
- Line 1166: `"market_data"` → correct `DisclaimerType` value
- Line 1177: `"market_intelligence"` → correct `AuthorityTheme` value

### Steps
1. Copy uploaded video to `public/videos/kasandra-welcome.mp4` (overwrite)
2. Fix the two `guideRegistry.ts` type errors

