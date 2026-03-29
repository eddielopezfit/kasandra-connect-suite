

# Expand Trusted Network + Add Tucson Events Page

Kasandra asked for two things: (1) upgrade the existing `/network` page from a placeholder into a real partner showcase with categories, spotlights, and real stories, and (2) a new `/tucson-living` page highlighting local events and what makes Tucson special.

---

## Part 1: Trusted Network Page Upgrade (`/network`)

The page already exists but only has a single "Coming Soon" placeholder card. We'll rebuild it into a full partner showcase.

### New Sections

1. **Partner Grid by Category** — Organized tabs or sections: Lenders, Inspectors, Contractors, Title/Escrow, Other. Each card shows: name, company, specialty, Kasandra's personal endorsement quote, years working together, optional photo placeholder, bilingual throughout.

2. **Partner of the Week Spotlight** — A highlighted card at the top (larger, gold border) featuring one partner with a longer testimonial from Kasandra about why she trusts them. Rotates based on a simple array index or date-based selection.

3. **Real Stories Section** — "From the Field" stories: short case-study cards where Kasandra describes a real situation (e.g., "My inspector caught a foundation issue that saved my client $40K"). These build trust while showing market experience. Each story has: title, situation summary, outcome, which partner category was involved, bilingual.

4. **Sponsor Recognition** — Optional badge on partner cards: "Hub Sponsor" for partners who support the platform. Not paid placement — genuine working relationships with a sponsorship layer.

5. **CTA** — "Know someone Kasandra should meet?" links to `/contact`.

### Data Structure

Partners and stories stored as static TypeScript arrays (same pattern as guides/neighborhoods). Kasandra can provide names later — we'll ship with 3-4 placeholder slots per category plus the story section with 2-3 example stories she can customize.

### File Changes

| File | Change |
|------|--------|
| `src/pages/v2/V2TrustedNetwork.tsx` | Full rebuild: category tabs, spotlight, stories section |
| `src/data/trustedPartners.ts` | New file: partner data array with categories, EN/ES |
| `src/data/fieldStories.ts` | New file: real market stories data, EN/ES |

---

## Part 2: New Tucson Living / Events Page (`/tucson-living`)

A new page celebrating Tucson lifestyle — local events, seasonal highlights, and why Tucson is a great place to live. This supports the "relocating to Tucson" audience and gives Kasandra content to share on social media.

### Sections

1. **Hero** — "Discover Tucson Living" / "Descubre la Vida en Tucson" with a warm lifestyle-focused intro from Kasandra's perspective.

2. **Seasonal Events Calendar** — Static curated list of Tucson's signature events organized by season (Gem Show, Tucson Meet Yourself, 4th Ave Street Fair, Día de los Muertos, Rodeo, etc.). Each event card: name, typical month, short description, category tag (Culture, Food, Outdoors, Family), bilingual.

3. **Why Tucson** — Quick lifestyle highlights grid: 350+ days of sunshine, cost of living vs Phoenix/CA, food scene, outdoor access, cultural diversity, bilingual community.

4. **Neighborhood Connection** — "Find your perfect Tucson neighborhood" CTA linking to `/neighborhoods` and the neighborhood quiz.

5. **Kasandra's Picks** — A personal "What I love about Tucson" section with 3-4 short blurbs (her favorite spots, traditions, hidden gems).

### Publish Gate Compliance

- Route: `/tucson-living`
- `useDocumentHead` with EN/ES titles
- SEO meta in `seoRouteMeta.ts`
- Linked from nav (add to `exploreLinks` in V2Navigation)
- Chip registered in `chipsRegistry.ts` for Selena
- Destination registered in `destinationsRegistry.ts`

### File Changes

| File | Change |
|------|--------|
| `src/pages/v2/V2TucsonLiving.tsx` | New page: hero, events calendar, lifestyle grid, Kasandra's picks |
| `src/data/tucsonEvents.ts` | New file: curated events data by season, EN/ES |
| `src/App.tsx` | Add lazy import + route for `/tucson-living` |
| `src/components/v2/V2Navigation.tsx` | Add "Tucson Living" to exploreLinks |
| `src/lib/seo/seoRouteMeta.ts` | Add meta for `/tucson-living` |
| `src/lib/registry/destinationsRegistry.ts` | Add `tucson_living` destination |
| `src/lib/registry/chipsRegistry.ts` | Add chip for "Tucson Events" / "Eventos de Tucson" |
| `src/lib/registry/chipKeys.ts` | Add `tucson_living` key |

---

## Summary

- **Part 1**: 3 files (1 rebuild, 2 new data files)
- **Part 2**: 8 files (1 new page, 1 new data file, 6 registry/config updates)
- Both pages are fully bilingual, mobile-responsive, and follow the existing V2Layout + brand token patterns
- Partner data ships with editable placeholders so Kasandra can fill in real names when ready
- Events data is static/curated — no API needed, Kasandra or her team updates seasonally

