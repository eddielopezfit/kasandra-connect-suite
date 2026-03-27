

# Phase 6: Hub-Side Code Changes for GHL Agent Studio Integration

## Context
GHL custom fields are created (44 fields, API-verified). Phases 1-5 are browser-only GHL configuration. This plan covers the 4 Lovable code changes needed to complete the integration.

## Changes

### 1. `supabase/functions/notify-handoff/index.ts` — Extend `deriveTags()` + Add `selena_dossier_json`

**deriveTags() additions** (after line 64):
- `selena_tools_used` — if any tools completed
- `selena_guide_reader` — if 3+ guides consumed
- `selena_booking_intent` — if `booking_intent_detected` is true
- `selena_military` — if `va_loan` is true
- `selena_returning_visitor` — if `returning_visitor` is true

**selena_dossier_json** (after payload construction, ~line 313):
Add a structured JSON string containing intent, budget, tools, guides, neighborhoods, pain points, property context, financing, and recommended next step. This gives Agent Studio agents a single parseable field with full lead context.

**Field key fix**: Map `selena_is_pre_approved` → `selena_is_preapproved` (no second underscore) to match the GHL field key `contact.selena_is_preapproved`.

### 2. `supabase/functions/create-handoff/index.ts` — AI Conversation Summary

Before the `notify-handoff` fire-and-forget call (~line 257), add a summary generation step:
- Call Lovable AI Gateway (`google/gemini-2.5-flash-lite`) with the `summary_md` content
- Prompt: "Summarize this real estate lead conversation in exactly 3 sentences. Include what they want, their timeline, and their main concern."
- Store result as `convo_summary` in the notify payload context
- Graceful fallback: if AI call fails, continue without summary (no blocking)

### 3. New `supabase/functions/agent-studio-callback/index.ts`

An endpoint GHL Agent Studio can call to get personalized deep links for SMS/email sequences.

- **Auth**: `x-admin-secret` header (cost-bearing pattern)
- **Input**: `{ lead_id, action }` where action is `get_tool_link | get_guide_link | get_booking_link`
- **Logic**:
  - `get_tool_link`: Reads `intent` from `lead_profiles`. Buyers → `/affordability-calculator`. Sellers → `/net-to-seller`. Cash → `/cash-offer-options`.
  - `get_guide_link`: Reads intent + `guides_read` from `session_snapshots`. Returns most relevant unread guide.
  - `get_booking_link`: Returns `/book?intent=X&lead_id=Y&source=agent_studio`
- **Output**: `{ url, label, context }`

### 4. `src/components/seo/JsonLd.tsx` — Schema Markup Helpers

Add pre-built schema generator functions (not changing the component itself):
- Create `src/lib/seo/schemaGenerators.ts` with functions for:
  - `realEstateAgentSchema()` — Kasandra's profile
  - `localBusinessSchema()` — Corner Connect Real Estate
  - `faqPageSchema(faqs)` — for guide FAQ sections
  - `aggregateRatingSchema()` — 126+ reviews
- These are already partially used via `JsonLd` component; this centralizes the schemas referenced in the GHL Schema Markup Generator output

### Files Modified/Created
| File | Action |
|------|--------|
| `supabase/functions/notify-handoff/index.ts` | Modify — extend tags + add dossier JSON |
| `supabase/functions/create-handoff/index.ts` | Modify — add AI summary before notify |
| `supabase/functions/agent-studio-callback/index.ts` | Create — new endpoint |
| `src/lib/seo/schemaGenerators.ts` | Create — centralized schema functions |

### Deploy
All 3 edge functions will be deployed after changes. The schema generators file is frontend-only (no deploy needed).

