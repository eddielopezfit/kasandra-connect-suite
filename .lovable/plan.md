

# Guides Page Optimization Audit

## Issue 1: "Continue Your Journey" Button — Poor Contrast
The button uses `border-white/30 text-white` on a dark navy background with no fill. The 30% opacity border makes it nearly invisible, especially on mobile. The text blends into the hero gradient.

**Fix:** Change to a semi-filled style: `bg-white/15 border-white/40 text-white` so it has a visible background tint. This keeps it secondary to the gold "Start with Selena" button while being actually readable.

**File:** `src/components/v2/guides/PersonalizedHero.tsx` (line 161)

## Issue 2: "Deciding" Stage Label — Meaningless to Users
The CognitiveProgressBar shows internal system labels like "Deciding", "Exploring", "Clarifying". An end user landing on this page has no idea what "Deciding" means in this context, what determined it, or what it's measuring. It's internal UX jargon exposed to the user. The progress dots + label feel like gamification metrics from a product manager's dashboard, not something a homebuyer cares about.

**Fix:** Remove the CognitiveProgressBar entirely from the guides page. It adds no user value — it's a system-state indicator that only confuses visitors. The personalized hero already adapts messaging based on cognitive stage. Showing the stage label redundantly as a pill badge is noise.

**File:** `src/pages/v2/V2Guides.tsx` — Remove the `<CognitiveProgressBar>` render block (lines 343-347) and its import.

## Issue 3: Read Time Labels — Remove "12 min", "10 min"
The `readTime` values on guide cards ("12 min", "10 min", "5 min") add visual clutter without value. For educational content designed to build trust, showing time estimates creates a transactional "is this worth my time?" frame — the opposite of the unhurried, trust-first experience the platform promises.

**Fix:** Remove the `<span>` rendering `readTime` from the guide card grid (line 397-399 in V2Guides.tsx). Keep the `readTime` data in the guide objects for potential future use on individual guide detail pages.

## Issue 4: "Connect the Dots" Synthesis Footer — Optimization
The current implementation is solid architecturally. The gating logic (3+ guides = summary offer, otherwise = question prompt) is correct. Two improvements:

**A) Copy tightening:** "Want me to connect the dots?" is clever but vague. A user who's read 5 guides doesn't think in terms of "connecting dots" — they think "what should I do next?" Change to: "Ready for your next step?" / "¿Listo para tu siguiente paso?"

**B) Summary button label:** "Summarize what I've learned" is long. Shorten to "Get My Summary" / "Obtener Mi Resumen" — more action-oriented and fits better on mobile.

**File:** `src/components/v2/guides/SelenaSynthesisFooter.tsx`

## Issue 5: Is the Guides Page Blue Ocean?
After removing the progress bar and read times, the page flow becomes:
1. Personalized Hero (stage-aware messaging + Selena CTA)
2. Start Here Lane (first-visit only)
3. Recommended Carousel (returning visitors)
4. Category Nav (sticky filters)
5. Guide Grid (clean cards)
6. Synthesis Footer (gated Selena entry)
7. Bottom CTA (book consultation)

This is clean and differentiated. The blue ocean elements are: cognitive-stage-aware hero copy, deterministic synthesis, bilingual throughout, and category-filtered educational content. No competitor in Tucson real estate has this architecture.

---

## Implementation Steps

1. **Fix "Continue Your Journey" button contrast** — Add `bg-white/15` background and increase border opacity to `border-white/40`.

2. **Remove CognitiveProgressBar** from V2Guides — delete render block and import. The hook can remain for other components that use stage data.

3. **Remove read time from guide cards** — Delete the `readTime` span from the grid card template.

4. **Optimize SelenaSynthesisFooter copy** — Change heading to "Ready for your next step?" and button label to "Get My Summary".

