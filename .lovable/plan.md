

## Plan: Integrate Canvas Visual Patterns into Hub Guide Renderer

### What We're Doing

Extracting two high-value visual patterns from the Gemini Canvas output — **Comparison Cards** and **Path Selector** — and wiring them into the existing data-driven guide renderer. This keeps bilingual support, governance, and the Guide-First policy intact while making guides visually richer.

### What We Do NOT Import

- No slate/amber/emerald colors (stay in cc-navy/cc-gold/cc-sand palette)
- No market stats with hard-coded numbers (stale data risk)
- No Decision Ladder links (AuthorityCTABlock already handles terminal routing)
- No standalone footer (GuideComplianceFooter already exists)
- No mid-guide CTAs or interactive state that writes to session

---

### Changes

**1. Extend `GuideSection` type** (`src/data/guides/types.ts`)

Add optional `variant` field and structured data:

```typescript
export interface GuideSection {
  heading: string;
  headingEs: string;
  content: string;       // plain-text fallback always required
  contentEs: string;
  variant?: 'default' | 'comparison' | 'path-selector';
  comparisonData?: {
    left: { label: string; labelEs: string; items: Array<{ bold: string; boldEs: string; text: string; textEs: string }> };
    right: { label: string; labelEs: string; items: Array<{ bold: string; boldEs: string; text: string; textEs: string }> };
  };
  pathData?: Array<{
    id: string;
    title: string; titleEs: string;
    desc: string; descEs: string;
  }>;
}
```

**2. Create `GuideComparisonCards`** (`src/components/v2/guides/GuideComparisonCards.tsx`)

Two-column card layout adapted from Canvas. Uses `Zap` + `CircleDollarSign` icons with cc-gold/cc-navy tones. Responsive: stacks on mobile, side-by-side on md+. Bilingual via `useLanguage()`.

**3. Create `GuidePathSelector`** (`src/components/v2/guides/GuidePathSelector.tsx`)

Interactive "Which path sounds like you?" cards with local `useState` for visual highlight only (no session writes). Three path cards with cc-navy/cc-gold/cc-sand styling. Bilingual.

**4. Update section renderer** (`src/pages/v2/V2GuideDetail.tsx`, lines 202-224)

In the `.map()` loop, switch on `section.variant`:
- `'comparison'` → render `<GuideComparisonCards data={section.comparisonData} />` below the heading
- `'path-selector'` → render `<GuidePathSelector data={section.pathData} />` below the heading
- default → current `whitespace-pre-line` text

**5. Update guide data** (`src/data/guides/cash-vs-traditional-sale.ts`)

- Section index 1 (Speed vs. Top Dollar): add `variant: 'comparison'` with structured `comparisonData` for Cash vs. Listing
- Section index 2 (Simple Paths): add `variant: 'path-selector'` with `pathData` for the three paths
- Plain text `content`/`contentEs` stays as fallback

**6. Export new components** (`src/components/v2/guides/index.ts`)

Add exports for `GuideComparisonCards` and `GuidePathSelector`.

### Governance Compliance

- No mid-guide CTAs — these are educational visual enhancements only
- Terminal routing stays in AuthorityCTABlock (unchanged)
- Path selector is read-only visual engagement, does not write to session or navigate
- All new components are bilingual via `useLanguage()`

