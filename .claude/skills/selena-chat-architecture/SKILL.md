---
name: selena-chat-architecture
description: Architecture of the Selena AI concierge system. Use this whenever working on SelenaChatContext.tsx, any file in src/context/selena/, or any file in supabase/functions/selena-chat/. This skill covers both the client-side React context and the server-side Deno edge function — they are completely separate systems.
---

# Selena Chat Architecture

## CRITICAL: Two Completely Separate Systems

| System | Location | Size | Purpose |
|--------|----------|------|---------|
| Client context | `src/context/SelenaChatContext.tsx` | 686 lines | React state, UI, localStorage |
| Edge function | `supabase/functions/selena-chat/index.ts` | 3,673 lines | AI, system prompt, context assembly |

**Never confuse these two.** Changes to one do NOT affect the other. They communicate only via Supabase Edge Function HTTP calls.

## THE REAL MONOLITH: selena-chat/index.ts (3,673 lines)

This is the highest-priority refactor target. It contains:
- `buildSystemPrompt()` — assembles the full bilingual system prompt
- 14-block dynamic context assembly (lines ~2780–3443)
- Intent detection logic
- Booking gate enforcement
- Chip governance (server-side)
- AI gateway call (Lovable AI Gateway → Gemini 3 Flash / GPT-4o-mini fallback)

### System Prompt Assembly Order (inside buildSystemPrompt)
1. KB-0 — Absolute prohibitions (always)
2. KB-1 — Kasandra identity facts (always)
3. KB-4 — Intent-specific knowledge (seller OR buyer, conditional)
4. KB-6 — Neighborhood knowledge (conditional)
5. KB-7 — Tool knowledge (conditional)
6. KB-7.1 — Calculator knowledge (conditional)
7. KB-8 — Guide delivery rules (always)
8. KB-12 — Compliance/legal (always)

### 14 Dynamic Context Blocks (runtime append order)
1. systemPrompt (base)
2. memorySummary
3. reflectionHint
4. sellerDecisionHint
5. marketPulseHint
6. neighborhoodHint
7. toolOutputHint
8. governanceHint
9. journeyHint
10. trailHint
11. guideModeHint
12. modeHint
13. guardRules.guardHints
14. Containment override (hard 2-sentence limit when containment_active)

### Edge Function File Inventory
| File | Lines | Purpose |
|------|-------|---------|
| `index.ts` | 3,673 | Monolith — system prompt, context, AI call |
| `modeContext.ts` | 297 | 4-mode psychological progression |
| `guardState.ts` | 549 | KB containment overlay |
| `journeyState.ts` | 153 | Journey state classifier (separate from modes) |
| `entryGreetings.ts` | ~50 | Server-side greeting variants |

## CRITICAL TERMINOLOGY

### Modes (psychological progression — modeContext.ts)
One-directional per session. Controls HOW Selena engages.
```
Mode 1 — ORIENTATION  → First contact. Educational. NEVER mention booking.
Mode 2 — CLARITY      → Intent declared. Suggest tools/guides. No booking.
Mode 3 — CONFIDENCE   → Deep engagement. Reflect progress. No hard CTA.
Mode 4 — HANDOFF      → Ready to convert. allowBookingCTA: true.
```

### Journey States (funnel classifier — journeyState.ts)
SEPARATE from modes. Used for lead scoring and GHL pipeline routing.
```
explore  → early stage, browsing
evaluate → comparing options, using tools
decide   → ready, high intent
```

### TOFU/MOFU/BOFU
These are NOT mode names and NOT journey state names. Do NOT use this terminology anywhere in the codebase. The correct terms are the mode names above and the journey state names above.

## Client-Side Context (SelenaChatContext.tsx — 686 lines)

### Import Chain
```
SelenaChatContext.tsx
├── selena/types.ts (136) — all TypeScript interfaces
├── selena/identityManager.ts (58) — localStorage persistence
├── selena/chipGovernance.ts (249) — chip filtering/resolution
│   ├── lib/registry/chipsRegistry.ts (689) — 82 chip entries EN+ES
│   ├── lib/registry/chipKeys.ts (137) — semantic key constants
│   └── lib/registry/guideChipMap.ts
├── selena/greetingEngine.ts (670) — computeGreeting()
├── selena/reportManager.ts (252) — report generation/retrieval
├── lib/analytics/selenaSession.ts
├── lib/analytics/sessionTrail.ts
└── lib/guides/guideRegistry.ts
```

### Key Exported Hook
`useSelenaChat()` — returns full chat state + actions. Used by all Selena UI components.

### Critical useEffect Hooks
| Effect | Trigger | Side Effect |
|--------|---------|-------------|
| Session init | once | initSessionContext(), loads localStorage history |
| Route tracking | pathname change | updateSessionContext, appendTrail |
| Proactive listener | mount | Listens for `selena-proactive-message` CustomEvent |
| Booking confirmation | mount | Listens for `selena-booking-confirmation` CustomEvent |

### The Proactive Trigger Hook
`selena-proactive-message` CustomEvent is already wired in SelenaChatContext.tsx.
To trigger Selena proactively from the homepage: dispatch this event with a message payload.
No backend changes needed — this is a pure frontend Lovable task.

## Environment Variables (Edge Function Only)
| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | DB client |
| `SUPABASE_SERVICE_ROLE_KEY` | DB client |
| `LOVABLE_API_KEY` | AI Gateway (NOT GEMINI_API_KEY) |

## Safe Editing Rules
1. Never edit `modeContext.ts` without reading guardState.ts first
2. Never touch the 14-block context assembly order in index.ts
3. Never add client-side GuardState logic — it belongs in the edge function only
4. The `max_tokens: 150` setting is INTENTIONAL — do not increase it
5. Always test bilingual output (EN + ES) after any index.ts change
