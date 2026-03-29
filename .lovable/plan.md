

# Add Kasandra's Construction Class Video to About Page

## Strategic Placement

This video is a perfect authority-building asset. It directly supports the **Construction Course** credential card already on the About page (line 207-216). Place the video immediately below that credentials section as a visual proof point.

## Implementation

### Step 1: Copy Video Asset
Copy `user-uploads://...mp4` to `src/assets/kasandra/construction-class-story.mp4`

### Step 2: Add Self-Hosted Video Block to About Page

Insert a new section between the credentials grid (line 246) and the "Backed by Realty Executives" section (line 249). This section will:

- Use a native `<video>` element (not an embed — this is a local file)
- Mobile-optimized with `aspect-[9/16]` since this is a vertical TikTok/Reel-format video
- Tight professional frame: rounded corners, subtle shadow, max-width constrained
- Caption overlay below with the key quote in EN/ES
- Lazy loading with `preload="none"` and poster frame

**Layout:**
- Centered, `max-w-sm` on mobile (full vertical video), `max-w-xs` on desktop (doesn't dominate)
- Gold label above: "FROM THE FIELD" / "DESDE EL CAMPO"
- Caption text below: condensed version of the post caption
- Brand-consistent styling (cc-sand background, cc-navy text)

### Step 3: No Component Changes Needed

Use a simple inline `<video>` tag with controls — no need for `KasandraVideoBlock` (that's for social embeds). This is a self-hosted MP4.

## Files Changed

| File | Action |
|------|--------|
| `src/assets/kasandra/construction-class-story.mp4` | Copy uploaded video |
| `src/pages/v2/V2About.tsx` | Add video section after credentials grid (~15 lines) |

