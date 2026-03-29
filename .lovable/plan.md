

# Strategic Photo Placement for Kasandra's Hub

## Photo Selection (6 of 8 — 2 excluded)

| Photo | Description | Decision | Reasoning |
|-------|------------|----------|-----------|
| #1 (488368231) | Black dress, indoor professional | USE | Elegant, corporate authority |
| #2 (488930655) | Navy dress, iron gate outdoor | USE | Tucson architectural feel, approachable |
| #3 (489807493) | Turquoise dress, staged dining room | USE | Real estate context — shows her IN a home |
| #4 (489847004) | Black blazer at bookshelf | SKIP | Speaker visible in background, less polished |
| #5 (490742377) | Black dress, desert fence, mountains | USE | Best photo — cinematic Tucson landscape, professional |
| #6 (489995791) | Black tank, desert garden close-up | USE | Natural, warm, approachable |
| #7 (491691245) | Miss Lilly, gold balloons | USE | Personal warmth, humanizing |
| #8 (627165897) | Corner Connect SOLD composite | SKIP | AI-generated composite, not authentic |

## Placement Map

### 1. Home Page — "Meet Kasandra" Section
- **Desktop headshot** (line 346): Replace `kasandraHeadshot` with **#5** (desert landscape) — this is her strongest brand photo with Tucson mountains and saguaros
- **Mobile headshot** (line 368): Same replacement
- **Lifestyle photo** (line 428): Replace `kasandraLifestyle` with **#3** (turquoise dress in staged home) — shows her in a real estate setting

### 2. About Page — Image Row (lines 135-148)
- Left image: Replace `kasandraHeadshot` with **#1** (black dress indoor professional)
- Right image: Replace `kasandraLifestyle` with **#6** (desert garden close-up)

### 3. About Page — KasandraPhotoGallery
- Replace the AI-generated placeholder `brand-photoshoot-red-door.jpg` with **#2** (navy dress at iron gate)
- Replace the AI-generated placeholder for Miss Lilly slot with **#7** (Miss Lilly with gold balloons) — add as a new gallery item or replace the `fiestas-patrias-performer` slot

### 4. Contact Page (line 15)
- Replace `kasandra-contact-headshot.jpg` with **#6** (desert garden) — warm, natural, fits the "From me to you" personal tone

## Files to Edit

| File | Change |
|------|--------|
| `src/assets/kasandra/` | Copy 6 photos into this directory with descriptive names |
| `src/pages/v2/V2Home.tsx` | Replace headshot import with desert-landscape photo (#5), lifestyle with staged-home photo (#3) |
| `src/pages/v2/V2About.tsx` | Replace image row photos with #1 and #6 |
| `src/components/v2/KasandraPhotoGallery.tsx` | Update gallery items: swap placeholder for #2 (iron gate) and add #7 (Miss Lilly) |
| `src/pages/v2/V2Contact.tsx` | Replace contact headshot with #6 (desert garden) |

Total: 6 photos placed across 4 pages, replacing AI placeholders and older generic shots with real professional photography.

