

# SELENA SYSTEM ARCHITECTURE SPECIFICATION

## Document Classification: Authoritative System Definition
## Version: 1.0 | Extracted from Production Codebase
## Date: 2026-01-29

---

# 1. SYSTEM IDENTITY

## What is Selena?

Selena is a **Digital Concierge Layer** - not a chatbot. She functions as the intersection of four operational systems:

```text
+------------------+
|   User Intent    |
+--------+---------+
         |
         v
+--------+---------+
|   User Memory    |<-----> Session Context (localStorage)
+--------+---------+
         |
         v
+--------+---------+
|  Decision Rooms  |<-----> Route System (React Router)
+--------+---------+
         |
         v
+--------+---------+
| Conversion Auth  |<-----> Handoff System (Supabase)
+------------------+
```

## Architectural Role

| Role | Definition |
|------|------------|
| **Digital Front Door** | First point of AI contact for all visitors |
| **Traffic Controller** | Routes users to appropriate Decision Rooms based on cognitive stage |
| **Memory Layer** | Maintains session context, identity, and journey state across pages |
| **Progressive Profiler** | Captures intent, timeline, and situation without friction |

## Authority Boundary

```text
SELENA CONTROLS:                    KASANDRA CONTROLS:
- Triage                            - Final decisions
- Routing suggestions               - Pricing/valuation
- Memory/context persistence        - Strategic advice
- Report generation (AI)            - Report verification
- Progressive profiling             - Handoff acceptance
- Lead capture triggers             - Calendar availability
```

---

# 2. SELENA'S RESPONSIBILITY MAP

## Read-Only Visibility

Selena has observational access to (does NOT modify directly):

| Data Source | Location | Access Method |
|-------------|----------|---------------|
| Routes visited | `location.pathname` | React Router |
| Guides opened | `cc_guides_read` | localStorage |
| Calculators used | `event_log` | Supabase |
| Reports generated | `lead_reports` | Supabase (via `lead_id`) |
| Quiz progress | `answers[]` state | Local component state |
| Language preference | `kasandra-language` | localStorage / LanguageContext |
| Cognitive stage | Calculated from signals | `useCognitiveStage()` hook |
| Lead identity status | `selena_lead_id` | localStorage |

## State Mutations Selena CAN Trigger

| Action | Target | Edge Function |
|--------|--------|---------------|
| Create/update lead profile | `lead_profiles` | `upsert-lead-profile` |
| Generate AI report | `lead_reports` | `generate-report` |
| Create handoff | `lead_handoffs` | `create-handoff` |
| Log events | `event_log` | `selena-log-event` |
| Update session context | `selena_context_v2` | localStorage (client-side) |

## Things Selena NEVER Does

Per `memory/brand/voice-rules`:
- Says "our team", "we", or "someone from the office"
- Makes legal claims or financial promises
- Schedules without explicit user consent
- Creates urgency pressure
- Replaces Kasandra's authority

---

# 3. LANGUAGE GOVERNANCE

## Constraint Model

Language is a **session-level constraint** stored in:
- Global: `LanguageContext` (`kasandra-language` in localStorage)
- Selena UI: `uiLanguage` state in `SelenaChatDrawer.tsx`

## Current Implementation

```typescript
// Global language toggle (affects entire site)
const { language, setLanguage, t } = useLanguage();

// Selena UI language (synced from global, can be toggled independently)
const [uiLanguage, setUiLanguage] = useState<'en' | 'es'>(language);

// UI translation helper within Selena
const tUI = (en: string, es: string) => uiLanguage === 'es' ? es : en;
```

## Language Propagation Path

| Component | Source | Mechanism |
|-----------|--------|-----------|
| Site UI | `LanguageContext` | `t(en, es)` pattern |
| Selena Chat UI | `uiLanguage` state | `tUI(en, es)` |
| AI Responses | `context.language` | Passed to `selena-chat` edge function |
| Reports | `lead.language` | Stored on `lead_profiles`, used by `generate-report` |
| System Prompts | `SYSTEM_PROMPT_EN` / `SYSTEM_PROMPT_ES` | Selected by language param |

## Language Flow

```text
User toggles EN/ES
       |
       v
LanguageContext updates --> localStorage persisted
       |
       v
All components re-render with new language
       |
       v
Selena drawer syncs uiLanguage on open
       |
       v
API calls include language in context
       |
       v
Edge functions select language-specific prompts
       |
       v
AI responses return in user's language
```

---

# 4. SELENA MEMORY MODEL

## Session Context Structure

**Source:** `src/lib/analytics/selenaSession.ts`

```typescript
interface SessionContext {
  // Identity
  session_id: string;           // UUID, persists until cleared
  
  // Language
  language: 'en' | 'es';
  
  // Attribution
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
  
  // Timestamps
  created_at: string;
  last_seen_at: string;
  
  // Intent & Situation (progressive profiling)
  intent?: 'cash_offer' | 'sell' | 'buy' | 'investor' | 'explore';
  timeline?: 'asap' | '30_days' | '60_90' | 'exploring';
  situation?: 'inherited' | 'divorce' | 'tired_landlord' | 'upgrading' | 'relocating' | 'other';
  condition?: 'move_in_ready' | 'minor_repairs' | 'distressed' | 'unknown';
  
  // Navigation
  last_page?: string;
  last_guide_id?: string;
  last_quiz_id?: string;
}
```

## Lead Identity Persistence

```text
Anonymous Session                   Known Lead
+-------------------+              +-------------------+
| session_id (UUID) |  --email-->  | lead_id (UUID)    |
| localStorage only |   capture    | Supabase + local  |
+-------------------+              +-------------------+
```

**Identity upgrade triggers:**
1. Email provided in chat (regex extraction)
2. LeadCaptureModal submission
3. Quiz contact form completion
4. Consultation intake form

## Memory Categories

| Category | Examples | Persisted Where |
|----------|----------|-----------------|
| Navigation history | "You were just reviewing cash options" | `last_page`, route events |
| Content exposure | "You've read two seller guides" | `cc_guides_read` (localStorage) |
| Tool usage | "You tried the net calculator" | `event_log` (Supabase) |
| Intent | buy / sell / cash / explore | `session_context.intent` |
| Timeline | ASAP / 30 days / exploring | `session_context.timeline` |
| Language | EN / ES | `kasandra-language` |
| Lead identity | anonymous / known (UUID) | `selena_lead_id` |
| Cognitive stage | 1-6 | Calculated on-demand |

## Memory Boundaries

Selena DOES remember:
- Operational data (pages, guides, tools)
- Declared intent and timeline
- Language preference
- Session attribution (UTMs)

Selena DOES NOT remember:
- Personal emotional statements
- Relationship context
- Off-platform conversations
- Financial details beyond what's explicitly provided

---

# 5. COGNITIVE STAGE SYSTEM

## Stage Definitions

**Source:** `src/hooks/useCognitiveStage.ts`

| Stage | ID | Trigger | Selena Behavior |
|-------|-----|---------|-----------------|
| 1 | `arriving` | Brand new visitor (0 guides) | Orient and calm |
| 2 | `exploring` | 1 guide OR Selena interaction | Offer guides |
| 3 | `understanding` | 2+ guides read | Offer tools |
| 4 | `clarifying` | 3+ guides OR intent known | Offer calculators/reports |
| 5 | `deciding` | Intent + 4+ guides | Suggest booking |
| 6 | `confident` | `trackJourneyAction('book')` called | Initiate handoff |

## Stage Calculation Logic

```typescript
function calculateCognitiveStage(
  guidesRead: number,
  hasIntent: boolean,
  hasInteractedWithSelena: boolean,
  hasClickedBooking: boolean
): CognitiveStageId {
  if (hasClickedBooking) return 'confident';           // Stage 6
  if (hasIntent && guidesRead >= 4) return 'deciding'; // Stage 5
  if (hasIntent || guidesRead >= 3) return 'clarifying'; // Stage 4
  if (guidesRead >= 2) return 'understanding';         // Stage 3
  if (guidesRead >= 1 || hasInteractedWithSelena) return 'exploring'; // Stage 2
  return 'arriving';                                    // Stage 1
}
```

## Stage-Aware CTA Mapping

| Stage | CTA Action | Label (EN) |
|-------|------------|------------|
| 1-2 | `browse` | Start Exploring |
| 2-3 | `selena` | Ask Selena |
| 4 | `continue` | Continue Your Journey |
| 5-6 | `book` | Book a Consultation |

---

# 6. ROUTING MATRIX

## Decision Rooms Selena Can Route To

| Room | Route | Psychological State | Primary Decision | Exit Condition |
|------|-------|---------------------|------------------|----------------|
| Lobby | `/v2` | Arriving/Curious | "Where do I start?" | Intent declared OR guide opened |
| Path Quiz | `/v2/quiz` | Uncertain | "Help me figure out my path" | Quiz completed |
| Guides | `/v2/guides` | Exploring | "I want to learn" | 3+ guides read OR CTA clicked |
| Buyer Readiness | `/v2/buyer-readiness` | Evaluating | "Am I ready to buy?" | Assessment completed |
| Cash Offer Options | `/v2/cash-offer-options` | Comparing | "What are my options?" | Calculator used OR report generated |
| Private Cash Review | `/v2/private-cash-review` | Personalizing | "Show me my numbers" | Report viewed OR booking initiated |
| Booking | `/v2/book` | Committing | "I want to talk to Kasandra" | Booking confirmed |
| Selena Chat | Drawer overlay | Any | "I have a question" | Question answered OR handoff triggered |

## Routing Decision Flow

```text
User arrives
     |
     v
Check cognitive stage
     |
     v
+----+----+----+----+----+----+
| 1  | 2  | 3  | 4  | 5  | 6  |
+----+----+----+----+----+----+
  |    |    |    |    |    |
  v    v    v    v    v    v
Quiz  Guides Tools Calc  Book Handoff
```

---

# 7. IDENTITY UPGRADE PATH

## Anonymous to Known

```text
ANONYMOUS                          KNOWN
+-----------+                      +------------------+
| session_id|  --> Email captured  | lead_id (UUID)   |
| (local)   |       via:           | in lead_profiles |
+-----------+       - Chat regex   +------------------+
                    - Modal form
                    - Quiz contact
                    - Intake form
```

## Known to Qualified

```text
KNOWN                              QUALIFIED
+------------------+               +------------------+
| lead_id exists   |  --> Intent   | intent: "sell"   |
| email verified   |    + timeline | timeline: "asap" |
+------------------+    detected   | situation: "x"   |
                                   +------------------+
```

## Qualified to Priority

```text
QUALIFIED                          PRIORITY
+------------------+               +------------------+
| Has intent       |  --> High-    | lead_handoffs    |
| Has timeline     |    intent     | priority: "hot"  |
| Has email        |    signals    | channel: "call"  |
+------------------+               +------------------+
```

**Priority Handoff Trigger Conditions:**
- `timeline === 'asap'` AND `intent === 'cash'`
- Calculator results show cash nearly equal to traditional
- Property value > $500,000
- User explicitly requests call
- Urgency language detected (ASAP, now, urgent, herencia)

---

# 8. CONCIERGE TAB SYSTEM

## Tab Structure

**Source:** `src/components/selena/ConciergeTabBar.tsx`

| Tab | Label (EN) | Label (ES) | Icon | Purpose |
|-----|------------|------------|------|---------|
| `start` | Start Here | Comienza | Compass | Intent declaration |
| `guides` | Guides | Guias | BookOpen | Content routing |
| `options` | My Options | Opciones | LayoutList | Report/tool access |
| `talk` | Talk | Hablar | Phone | Handoff initiation |

## Tab Panel Actions

**Source:** `src/components/selena/ConciergeTabPanels.tsx`

### Start Here Tab
- Intent buttons: Sell, Buy, Exploring
- Quick links to foundational guides

### Guides Tab
- "Browse All Guides" CTA
- Featured guides carousel

### My Options Tab
- View last report (if leadId exists)
- Generate report buttons:
  - Home Value Preview
  - Cash vs Listing Comparison
  - Buyer Readiness Check

### Talk Tab
- "Schedule a Call" (triggers `priority_call` action)
- "10-Min Priority Call" option
- Disclaimer: "Kasandra personally handles every consultation"

---

# 9. HANDOFF SYSTEM

## Handoff Creation Flow

```text
User clicks "Talk to Kasandra"
         |
         v
Check leadId exists?
    No --> LeadCaptureModal
    Yes --> Continue
         |
         v
triggerPriorityCall()
         |
         v
Open PriorityCallModal
(Channel selection: call | zoom)
         |
         v
createHandoffWithChannel()
         |
         v
POST /create-handoff
{
  lead_id,
  channel,
  priority: "hot",
  summary_md,
  summary_json,
  recommended_next_step
}
         |
         v
Insert into lead_handoffs
         |
         v
Fire notify-handoff (background)
         |
         v
Return booking_url + slots
```

## Handoff Payload Structure

```typescript
interface HandoffRequest {
  lead_id: string;
  channel: 'call' | 'zoom';
  priority: 'hot' | 'warm';
  reason?: string;
  summary_md: string;  // Chat history markdown
  summary_json?: {
    intent?: string;
    situation?: string;
    timeline?: string;
    condition?: string;
    pain_points?: string[];
    urgency_level?: string;
  };
  recommended_next_step?: string;
  selected_slot?: { start: string; label: string; booking_url: string };
  contact_pref?: 'call' | 'text' | 'zoom';
}
```

---

# 10. REPORT ARTIFACT SYSTEM

## Report Types

**Source:** `supabase/functions/generate-report/index.ts`

| Type | Title | Purpose | Requires Verification |
|------|-------|---------|----------------------|
| `net_sheet` | Net Proceeds Estimate | Financial projection | YES |
| `buyer_readiness` | Buyer Readiness Assessment | Qualification check | NO |
| `cash_comparison` | Cash vs Listing Comparison | Decision support | YES |
| `home_value_preview` | Home Value Preview | TOFU education | NO |

## Report Generation Flow

```text
User triggers report
         |
         v
POST /generate-report
{
  lead_id,
  report_type,
  context: {}
}
         |
         v
Fetch lead_profiles (for context)
         |
         v
Build prompt with:
  - System prompt (Selena voice)
  - Lead context (name, email, language, intent, timeline)
  - Report-type-specific instructions
         |
         v
Call Lovable AI Gateway
(model: google/gemini-3-flash-preview)
         |
         v
Parse response (JSON with analysis + markdown)
         |
         v
Insert into lead_reports
{
  lead_id,
  report_type,
  report_content: { analysis JSON },
  report_markdown: "# Report...",
  requires_verification: true/false
}
         |
         v
Return report_id + markdown to client
```

## Report Storage Schema

```sql
TABLE lead_reports:
  id UUID PRIMARY KEY
  lead_id UUID NOT NULL
  report_type TEXT NOT NULL
  report_content JSONB      -- Structured analysis data
  report_markdown TEXT      -- Display-ready markdown
  requires_verification BOOLEAN DEFAULT true
  unlocked_at TIMESTAMP     -- NULL until Kasandra reviews
  created_at TIMESTAMP
```

---

# 11. EVENT TELEMETRY

## Event Types Tracked

**Source:** `src/lib/analytics/logEvent.ts`

**73 distinct event types** including:

### Chat Events
- `selena_open`, `selena_close`
- `selena_message_user`, `selena_message_ai`
- `chat_action_click`, `suggested_reply_click`

### Guide Events
- `guide_open`, `guide_scroll_50`, `guide_complete`
- `guide_cta_click`, `guide_browse_click`

### Report Events
- `report_generate_start`, `report_generate_success`, `report_generate_error`
- `report_view`, `report_cta_click`

### Handoff Events
- `handoff_create_start`, `handoff_create_success`
- `handoff_channel_select`, `handoff_booking_click`
- `priority_call_click`

### Concierge Tab Events
- `concierge_tab_open`, `concierge_intent_click`

## Event Payload Enrichment

Every event automatically includes:
```typescript
{
  route: window.location.pathname,
  language: context.language,
  utm_source: context.utm_source,
  utm_campaign: context.utm_campaign,
  utm_medium: context.utm_medium,
  timestamp: new Date().toISOString()
}
```

---

# 12. INTERACTION DIAGRAM

## Selena <-> System Components

```text
+------------------+     +-------------------+     +------------------+
|  LanguageContext |<--->| SelenaChatContext |<--->|  Supabase Edge   |
|  (global lang)   |     | (chat state)      |     |  Functions       |
+------------------+     +-------------------+     +------------------+
         ^                        ^                        |
         |                        |                        v
+------------------+     +-------------------+     +------------------+
|  V2Layout        |     |  useCognitiveStage|     |  lead_profiles   |
|  (renders Selena)|     |  (stage calc)     |     |  lead_reports    |
+------------------+     +-------------------+     |  lead_handoffs   |
         ^                        ^               |  event_log       |
         |                        |               +------------------+
+------------------+     +-------------------+
|  Decision Rooms  |<--->|  personalization  |
|  (pages)         |     |  (localStorage)   |
+------------------+     +-------------------+
```

## Data Flow: Anonymous to Booked

```text
1. User lands (session_id created)
         |
2. Browses guides (guides_read tracked)
         |
3. Opens Selena chat (stage assessed)
         |
4. Provides email in chat (lead_id created)
         |
5. Generates report (lead_reports populated)
         |
6. Clicks "Talk to Kasandra" (handoff created)
         |
7. Notification sent to Kasandra (notify-handoff)
         |
8. User redirected to booking (booking_url)
```

---

# 13. SYSTEM POSITIONING

This system is categorically different from:

- **Realtor websites**: Those are brochures with contact forms. This is an active decision-support layer that assesses cognitive readiness, routes users through educational content, and triggers handoffs based on behavioral signals rather than form submissions.

- **Chatbots**: Chatbots answer questions and terminate. Selena maintains persistent memory across sessions, progressively profiles visitors without friction, generates authoritative artifacts (reports), and orchestrates the entire conversion journey from stranger to booked consultation.

- **CRMs**: CRMs store records. This system creates records through behavioral observation, enriches them via AI conversation, and triggers actions (handoffs, notifications) based on intent signals detected in real-time.

- **Funnel builders**: Funnel builders create linear paths. This is a multi-room decision architecture where users can enter at any point, be routed based on their cognitive stage, and experience personalized journeys that adapt to their declared and inferred intent.

The system functions as an **Autonomous Digital Concierge** that converts browsing into structure, structure into clarity, and clarity into commitment - all while maintaining the constraint that Kasandra remains the sole human authority.

