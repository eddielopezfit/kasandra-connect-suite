

# KB-7: Brand Voice Alignment — Implementation Plan

## What This Does

Adds a new knowledge base block (KB-7) to Selena's system prompt that governs **how Selena sounds** when talking about Kasandra and her practice. This is voice texture governance — not content, not behavior, not domain knowledge.

Includes both micro-guards requested:
- Micro-Guard A: Never quote taglines verbatim
- Micro-Guard B: No unverified biography claims (with explicit examples)

## What Changes

**One file modified:** `supabase/functions/selena-chat/index.ts`

**Two insertions:**

1. **EN prompt** — Insert KB-7 EN block after line 801 (`Brand identity: "Your Best Friend in Real Estate."`) and before line 803 (`LOCATION ADVISORY BOUNDARY`), with blank line separators.

2. **ES prompt** — Insert KB-7 ES block after line 1180 (`Identidad de marca: "Tu Mejor Amiga en Bienes Raices."`) and before line 1182 (`LIMITE DE ASESORIA DE UBICACION`), with blank line separators.

## What Does NOT Change

- KB-0 through KB-6: untouched
- Conversational Operating Doctrine: untouched
- Guard State (guardState.ts): untouched
- Mode detection (modeContext.ts): untouched
- Entry greetings (entryGreetings.ts): untouched
- Frontend: untouched
- No new files, no database changes, no dependencies

## KB-7 Content (EN)

Covers brand pillars (warmth, bilingual respect, community rootedness, empowerment, calm guidance), conversational language patterns, safe signature phrase governance (max once, never verbatim), platform divergence rules (no emojis, hashtags, social CTAs), trust-building style with explicit anti-biography-claim guard, and anti-drift rules reinforcing the Guard State at the voice level.

## KB-7 Content (ES)

Same structure in natural Spanish using the established "tu" register. Includes both micro-guards translated natively.

## Post-Change Prompt Hierarchy

```text
KB-0 (Constitution)
  Brokerage Truth Source
  Conversational Operating Doctrine
  Voice Rules / Concierge Philosophy / Kasandra Framing
  Community Context
  KB-7: Brand Voice Alignment    <-- NEW
  Location Advisory (KB-1)
  Process Education (KB-2)
  Paths Overview (KB-3)
  Capabilities and Limits (KB-4)
  Core Real Estate Education (KB-6)
  Mode Instructions
```

## Verification

After deploy, 8 acceptance tests:
1. EN trust question -- warmth, no awards/stats
2. ES trust question -- same in tu register
3. Language switch mid-conversation -- clean, no scolding
4. Identity repeat -- brief reminder only
5. Brokerage question -- Corner Connect / Realty Executives AZ Territory only
6. Urgency without timeline -- no urgency words, one gentle timing question
7. Valuation request -- refuse, defer to Kasandra
8. Signature phrase governance over 6 turns -- max once, never verbatim tagline

