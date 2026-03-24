

## Plan: Generate Complete System DNA Export (13 Files)

### What This Is
A complete architectural blueprint exported as 13 structured markdown files to `/mnt/documents/`, enabling a senior engineer to rebuild this system from scratch.

### File Structure

| File | Content Scope | Estimated Size |
|------|--------------|----------------|
| `00-system-overview.md` | Tech stack, architecture philosophy, project structure, key abstractions (ActionSpec, GuardState, SessionContext) | ~3K |
| `01-routes-pages.md` | Every route with URL, purpose, components, CTAs, AI interaction points | ~8K |
| `02-ui-ux-components.md` | All reusable components with props, behavior, usage locations — split into subsections (layout, hero, cards, forms, calculators, chat, guides, neighborhood) | ~12K |
| `03-user-journeys.md` | Seller, Buyer, Cash Offer, Explorer flows with entry points, steps, decision points, tools triggered, conversion points | ~6K |
| `04-selena-ai-system.md` | **Largest file** — Full system prompts (EN KB-0 through KB-12), 4-mode architecture, GuardState rules, KB-9 containment, intent detection, chip governance, greeting engine variants, journey state classifier, chip registry | ~25K+ |
| `05-tools-decision-engines.md` | Net proceeds calculator, readiness quizzes (buyer/seller/cash), seller decision wizard, affordability calculator, BAH calculator, home valuation, neighborhood quiz — inputs, outputs, algorithms, data flow | ~8K |
| `06-data-architecture.md` | All DB tables with fields/types/RLS, localStorage keys (12+), sessionStorage keys, SessionContext interface (80+ fields), lead_profiles schema, conversation_memory | ~10K |
| `07-edge-functions-backend.md` | All 33 edge functions — name, purpose, inputs, outputs, triggers, auth patterns, env vars | ~12K |
| `08-integrations.md` | GHL webhook, Lovable AI Gateway, Google Places, YouTube, Firecrawl, Perplexity, ElevenLabs — payloads, auth, data flow | ~5K |
| `09-conversion-system.md` | Lead capture flow, earned booking access gates, qualification system, lead scoring, handoff pipeline, GHL tag derivation | ~6K |
| `10-analytics-events.md` | All 100+ event types, payload structure, storage (event_log table), dev buffer, session trail system | ~6K |
| `11-guides-content-architecture.md` | Guide registry, 30+ guides with IDs/categories/tiers, guide media slots, category colors, Decision Lane system, GuideToolBridge | ~8K |
| `12-limitations-gaps.md` | Known security gaps, stub functions, performance constraints, architectural debt, missing features | ~3K |
| `13-rebuild-recommendations.md` | Recommendations for next-gen rebuild — what to keep, what to redesign, scalability improvements | ~3K |

### Implementation Approach

1. Read all remaining files needed for exhaustive detail (system prompt lines 300-1510, remaining edge functions, component props, guide registry, etc.)
2. Generate each file with real implementation detail — real route names, real component names, real localStorage keys, real edge function names, real prompt text, real logic
3. For large sections (04-selena-ai-system, 07-edge-functions), include nested subsection headers rather than compressing
4. Write all 13 files to `/mnt/documents/kasandra-system-dna/`
5. QA each file for completeness

### What Gets Included (NOT Summarized)
- Full KB-0 constitution text (~100 lines)
- Full Conversational Operating Doctrine
- Complete mode detection logic with thresholds
- All 100+ analytics event types
- All 12+ localStorage keys with their data shapes
- All 33 edge function signatures
- Complete chip registry structure (82+ entries)
- All greeting variants with trigger conditions
- Full intent detection regex patterns
- Complete net-to-seller algorithm constants
- All GHL webhook payload fields and tag derivation logic
- Complete RLS policy inventory
- All env var names and their purposes

