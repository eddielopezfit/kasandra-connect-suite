

# Add Kasandra's Branding Lockup to Navigation

## What Kasandra Asked
"Top of every page needs to have: logos and Realtor and Fair Housing icons" — she provided her official branding image containing all required elements.

## Approach

**Copy the uploaded image** into `public/images/kasandra-brand-lockup.png` and add a slim compliance/branding strip above the main navigation on every page.

### Design
- A narrow bar (~28-32px tall) sitting **above** the main nav, always visible
- White/light background with the branding lockup image centered, scaled to fit the strip height
- On mobile: image scales down proportionally, remains centered
- Does not scroll away — fixed position like the nav itself
- Nav `top` offset adjusts to account for the strip

### Files Changed

| File | Action |
|------|--------|
| `public/images/kasandra-brand-lockup.png` | Copy uploaded image here |
| `src/components/v2/V2Navigation.tsx` | Add branding strip above `<nav>`, adjust nav positioning |
| `src/components/v2/V2Layout.tsx` | Adjust top padding to account for taller header (strip + nav) |

### Implementation Detail
- The strip renders as a `<div>` before the `<nav>`, both inside a fixed container
- Background: white (`bg-white`) with a subtle bottom border
- Image rendered as `<img>` with `h-7 md:h-8 object-contain` for responsive sizing
- Nav `top` shifts from `top-0` to `top-8` (or use a flex column wrapper)
- V2Layout's `pt-` value increases by the strip height (~32px)

