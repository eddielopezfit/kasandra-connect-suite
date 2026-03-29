

# Integrate Kasandra's Personal Photos & Videos into the Hub

Based on the social media audit, here's a concrete plan to embed her singing, performing, community leadership, and personal brand content across the hub using existing components and new placements.

---

## Top-Tier Assets to Integrate (starred items from audit)

| # | Content | Source | Placement |
|---|---------|--------|-----------|
| 1 | Karaoke at The Neighborhood Bar (Reel) | IG #1 | About page — singing video block |
| 7 | Dancing with Stars 2024 — 401 likes, 74 comments | IG #7 | Community page — Diaper Bank section |
| 26 | Cowboy hat desert sunset photo | FB | Tucson Living hero background |
| 31 | Professional brand photoshoot (red door, 528 likes) | TikTok | Home page hero or About page gallery |
| 21 | "About Kasandra Prieto" intro video | YouTube | About page — replace/supplement current welcome video |
| 11 | Housing4Good podcast interview (17:48) | YouTube | Community page — inline video embed |
| 4 | Fiestas Patrias 2025 performer promo | IG | Tucson Living — Kasandra's Picks section |

---

## Implementation

### 1. New Asset Directory + Downloaded Media
Create `src/assets/kasandra/` and add downloaded photos/thumbnails. Videos will be YouTube embeds (no hosting needed).

Files to download and add:
- `singing-karaoke.jpg` — thumbnail from IG reel #1
- `dancing-stars-2024.jpg` — thumbnail from IG reel #7
- `desert-sunset-cowboy.jpg` — FB photo #26
- `brand-photoshoot-red-door.jpg` — TikTok screenshot #31
- `fiestas-patrias-performer.jpg` — IG reel #4 thumbnail
- `construction-class.jpg` — from Arizona Daily Star / FB archives

### 2. About Page (`src/pages/v2/V2About.tsx`)

**A. Add singing video block** after the "My Journey" section (~line 183):
- Use existing `KasandraVideoBlock` component (compact variant)
- Label: "Beyond Real Estate" / "Más Allá de los Bienes Raíces"
- Video URL: `https://www.instagram.com/reel/DH2hf1Tum9T/` (or YouTube repost if available)
- Fallback thumbnail: `singing-karaoke.jpg`

**B. Add "The Real Kasandra" photo gallery** after the singing block:
- New component `KasandraPhotoGallery.tsx` — responsive 2x3 masonry grid
- 6 photos: singing, Dancing with Stars, construction class, desert sunset, brand photoshoot, community event
- Each has a bilingual hover/tap caption
- Warm cc-ivory background, rounded corners, shadow-soft treatment

**C. Update image row** (lines 133-146): Replace the two generic images with the brand photoshoot and desert sunset photos for immediate visual impact.

### 3. Community Page (`src/pages/v2/V2Community.tsx`)

**A. Dancing with Stars video** in the Diaper Bank section:
- Add `KasandraVideoBlock` (compact) with YouTube URL: `https://www.instagram.com/reel/DAO0VydylEA/` embed
- Label: "Dancing for Diapers — 2024" / "Bailando por los Pañales — 2024"

**B. Housing4Good podcast interview** inline:
- Add `KasandraVideoBlock` (compact) with YouTube URL: `https://www.youtube.com/watch?v=Eca31eeUxRQ`
- Label: "Featured on Housing4Good Podcast" / "Destacada en Housing4Good Podcast"

### 4. Tucson Living Page (`src/pages/v2/V2TucsonLiving.tsx`)

**A. Hero background upgrade** (line 40-41):
- Replace solid navy gradient with the cowboy hat desert sunset photo as background
- Keep gradient overlay for text readability

**B. Add Fiestas Patrias to "Kasandra's Picks"** section:
- Photo of her performing at St. Philip's Plaza
- Quote about what Fiestas Patrias means to her

### 5. Home Page (`src/pages/v2/V2Home.tsx`)

**A. Upgrade the "Meet Kasandra" section** with the brand photoshoot (red door) image as the primary headshot, replacing or supplementing `kasandraHeadshot.jpg`.

### 6. New Component: `KasandraPhotoGallery.tsx`

```text
┌─────────────┬─────────────┬─────────────┐
│  Singing    │  Dancing    │  Desert     │
│  Karaoke    │  w/ Stars   │  Sunset     │
├─────────────┼─────────────┼─────────────┤
│  Brand      │  Construc-  │  Fiestas    │
│  Photoshoot │  tion Class │  Patrias    │
└─────────────┴─────────────┴─────────────┘
       (2 cols on mobile, 3 on desktop)
```

- Each cell: `aspect-[4/3]`, rounded-xl, overflow-hidden
- Hover overlay: bilingual caption + subtle scale(1.03) transition
- Lazy-loaded images

---

## Files to Create/Edit

| File | Change |
|------|--------|
| `src/assets/kasandra/` | NEW directory — 6 downloaded photos |
| `src/components/v2/KasandraPhotoGallery.tsx` | NEW — responsive photo mosaic with hover captions |
| `src/pages/v2/V2About.tsx` | Add singing video block + photo gallery section + upgrade image row |
| `src/pages/v2/V2Community.tsx` | Add Dancing with Stars + Housing4Good video embeds |
| `src/pages/v2/V2TucsonLiving.tsx` | Replace hero with desert sunset photo background |
| `src/pages/v2/V2Home.tsx` | Upgrade Kasandra headshot with brand photoshoot image |

**Note:** Since we can't download from Instagram/TikTok/Facebook directly, we'll create the component structure and image import references. Kasandra will need to provide the actual photo files (screenshots or downloads from her accounts), which we'll place in `src/assets/kasandra/`. The YouTube video embeds will work immediately via URL.

