

# Fix Sprint: F-5, F-6, F-10, F-3, F-4

Five fixes across 5 files. No database changes.

## F-5 — Sticky bar copy (V2Layout.tsx)
Line 152: `"Book a Free Consultation"` → `"Book a Strategy Session"` / `"Agendar una Sesión de Estrategia"`

## F-6 — About page CTA copy (V2About.tsx)
Line 234: Same copy change as F-5.

## F-10 — Homepage Selena section CTAs (V2Home.tsx + types.ts)
After the compliance text (line 543), before the closing `</div>` of the left column, add:
- Gold button: "Talk to Selena Now" → `openChat({ source: 'homepage_selena_section' })`
- Text link: "Learn more about Selena →" → `/selena-ai`

`openChat` is already imported (line 41). Add `'homepage_selena_section'` to `EntrySource` in `src/contexts/selena/types.ts` (after `'selena_ai_page'`).

## F-3 — Desktop nav tagline (V2Navigation.tsx)
After line 79 (brokerage span), add a new line visible only on desktop (`hidden lg:block`):
```
"Your Best Friend in Real Estate" / "Tu Mejor Amiga en Bienes Raíces"
```
Style: `text-xs text-cc-gold font-medium tracking-wide`

## F-4 — Hero: conditional Market Pulse (GlassmorphismHero.tsx)
Add prop `showMarketPulse?: boolean` (default `true`). When false, replace the right-column stats card with a simple social proof line:
```
"Trusted by 100+ Tucson families · 5-star rated"
"Confiada por más de 100 familias · 5 estrellas"
```
Styled as centered text with a star icon, inside the same glow container.

In V2Home.tsx line 124: pass `showMarketPulse={false}` to `<GlassmorphismHero />`. The /buy and /sell pages already pass explicit props and will keep the default `true`.

## Files Changed
| File | Change |
|------|--------|
| `src/components/v2/V2Layout.tsx` | 1 line — copy swap |
| `src/pages/v2/V2About.tsx` | 1 line — copy swap |
| `src/pages/v2/V2Home.tsx` | ~8 lines — add CTAs + prop |
| `src/contexts/selena/types.ts` | 1 line — new EntrySource |
| `src/components/v2/V2Navigation.tsx` | 3 lines — tagline |
| `src/components/v2/hero/GlassmorphismHero.tsx` | ~20 lines — conditional right column |

