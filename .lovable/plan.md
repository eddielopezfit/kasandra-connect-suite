

# P0 Guides Patch: Brand Voice, CTA Transparency, and Spanish Register

## Summary

Four surgical fixes across 3 files. No routing, scoring, or schema changes. Content and label corrections only.

---

## P0-1: Fix CTA Label Transparency (Buying Guides)

**File**: `src/components/v2/guides/AuthorityCTABlock.tsx` (lines 73-74)

**Change**: Replace the buying category CTA labels that falsely imply booking.

| Current | Replacement |
|---|---|
| EN: "Book Your Buyer Strategy Session" | EN: "Get Clarity on Your Buying Journey" |
| ES: "Reserve Su Sesion de Estrategia para Comprador" | ES: "Obtenga Claridad sobre Su Proceso de Compra" |

No routing or behavior changes. Label-only edit, 2 lines.

---

## P0-2: Fix Spanish Register (tu to Usted)

**File**: `src/pages/v2/V2GuideDetail.tsx`

Three guides have informal Spanish that violates the Usted mandate:

### first-time-buyer-guide (lines 45-93)
Every Spanish string uses informal register. Systematic replacements:

- "Si estas leyendo esto" -> "Si esta leyendo esto"
- "tu primera casa" -> "su primera casa"
- "para que puedas" -> "para que pueda"
- "Evalua Tu Preparacion" -> "Evalue Su Preparacion"
- "tu punto de partida" -> "su punto de partida"
- "tu perfil crediticio" -> "su perfil crediticio"
- "Tambien querras" -> "Tambien querra"
- "Obten Pre-Aprobacion" -> "Obtenga Pre-Aprobacion"
- "te ayuda a entender" -> "le ayuda a entender"
- "tus ingresos" -> "sus ingresos"
- "Ten en cuenta" -> "Tenga en cuenta"
- "Elige al Profesional" -> "Elija al Profesional"
- "tus areas preferidas" -> "sus areas preferidas"
- "Explique... sin presion" (already correct form)
- "tus intereses" -> "sus intereses"
- "tomate el tiempo" -> "tomese el tiempo"
- "Busqueda de Casa" -> stays (noun, fine)
- "Mientras exploras" -> "Mientras explora"
- "Tu objetivo" -> "Su objetivo"
- "Hacer una Oferta" -> stays
- "estes listo" -> "este listo"
- "Tu agente te ayudara" -> "Su agente le ayudara" (also feeds into P0-4 pattern for buyer guide)
- "Tomese el tiempo" sections in Steps 6-7 similarly
- "Bienvenido a casa" -> "Bienvenido(a) a casa" (gender-inclusive)
- Final section: "Si estas listo" -> "Si esta listo", "eres bienvenido" -> "es bienvenido(a)"

All 8 contentEs + introEs + headingEs fields for this guide will be updated.

### first-time-buyer-story (line 228)
- "tener a alguien que te guie" -> "tener a alguien que le guie"

One line fix in the last section's contentEs.

### budget-buyer-story
After re-reading: the narrative is third-person ("La familia", "Sabian que querian"). This is already correct register (no direct address). No changes needed.

**Total**: ~20 Spanish string edits across intro + 8 sections of first-time-buyer-guide, plus 1 line in first-time-buyer-story.

---

## P0-3: Remove Dead Guides from Index

**File**: `src/pages/v2/V2Guides.tsx` (lines 139-196)

Remove these 6 guide objects from the `guides` array:

1. `mortgage-options-explained` (lines 139-147)
2. `tucson-neighborhood-guide` (lines 148-157)
3. `home-staging-secrets` (lines 159-167)
4. `negotiation-strategies` (lines 169-177)
5. `closing-costs-breakdown` (lines 179-187)
6. `oro-valley-vs-marana` (lines 189-197)

Clean removal from the array. No route or content file changes. These guides have no real content in V2GuideDetail.tsx (they fall through to `fallbackContent`), so removing them from the index simply stops advertising empty pages.

---

## P0-4: Fix Third-Person "Your Agent" Language

**File**: `src/pages/v2/V2GuideDetail.tsx`

In `selling-for-top-dollar`, section "How Selling Works: Step by Step" (line 117-118):

| Current (EN) | Replacement |
|---|---|
| "Your agent provides information; the decision is yours." | "I provide information; the decision is yours." |
| "Your agent will help you understand options" (Step 5 within same block) | "I will help you understand options" |

| Current (ES) | Replacement |
|---|---|
| "Su agente proporciona informacion; la decision es suya." | "Yo proporciono informacion; la decision es suya." |
| "Tu agente te ayudara a entender" | "Le ayudare a entender" |

These are within the multiline content strings on lines 117-118. Two content blocks, EN and ES.

---

## Files Changed

| File | Lines Touched | Change Type |
|---|---|---|
| `src/components/v2/guides/AuthorityCTABlock.tsx` | 2 lines | Label text swap |
| `src/pages/v2/V2GuideDetail.tsx` | ~25 content strings | Spanish register + first-person voice |
| `src/pages/v2/V2Guides.tsx` | ~60 lines removed | Dead guide cards removed |

## What Is NOT Touched

- No routing, analytics, or openChat logic changes
- No edge functions, schema, or scoring changes
- No GuideCTABlock.tsx changes (unused component, P1 item)
- No English content rewrites (P1 item)
- No new sections or content additions
- No guide registry or personalization changes

