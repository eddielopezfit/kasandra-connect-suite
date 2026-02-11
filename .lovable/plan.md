
# Selena Digital Concierge System -- Complete User Journey Map

## Document Purpose
Pure extraction and documentation of every user interaction path through the Selena system as it exists today. No recommendations, no improvements.

---

## SECTION 1: ALL ENTRY POINTS INTO SELENA

### 1.1 Floating Button (Global -- Every V2 Page)
- **Trigger**: Click FAB (bottom-right) on any `/v2/*` page
- **Component**: `SelenaFloatingButton.tsx`
- **Selena Response**: Default greeting (Mode 1 Orientation)
  - EN: "Hello, I'm Selena, Kasandra's digital real estate concierge..."
  - Suggested replies: "I'm thinking about selling" / "I'm looking to buy" / "Just exploring for now"
- **Data Captured**: `selena_entry` event logged with `source: 'floating'`, current route
- **Data Stored**: Chat history in `localStorage` (`selena_chat_history`), session context updated (`selena_context_v2`)
- **Next Options**: 3 suggested reply chips, free text input, 4 tab bar options (Start Here / Guides / My Options / Talk)

### 1.2 Hero CTA (V2 Homepage + Guides Hub)
- **Trigger**: "Ask Selena" button on V2Home hero or V2Guides hero
- **Component**: Various page components calling `openChat({ source: 'hero' })`
- **Selena Response**: Extended orientation greeting introducing Selena and asking what brings the user
- **Suggested replies**: Same 3 intent declarations
- **Data**: `selena_entry` logged with `source: 'hero'`

### 1.3 Calculator Completion
- **Trigger**: User completes Net-to-Seller Calculator, clicks "Talk to Selena" CTA
- **Component**: Calculator result page calling `openChat({ source: 'calculator', calculatorAdvantage, calculatorDifference })`
- **Selena Response**: Context-aware greeting referencing calculator results
  - Cash advantage: "Cash looks like a strong option for you -- speed and certainty..."
  - Traditional advantage: "A traditional sale could net you $X more -- if you have the time..."
  - Consult (close): "The difference is subtle -- the right choice depends on your situation..."
- **Data Captured**: `calculatorAdvantage`, `calculatorDifference` passed in entry context
- **Suggested replies**: "Which option is better for me?" / "Review strategy with Kasandra" / "I have more questions"

### 1.4 Guide Handoff (Individual Guide Detail Pages)
- **Trigger**: Click the Selena block at bottom of any guide detail page
- **Component**: `SelenaGuideHandoff.tsx` calling `openChat({ source: 'guide_handoff', guideId, guideCategory })`
- **Selena Response**: Category-specific greeting acknowledging the specific guide read
  - Buying category: "...Do you have any specific questions about the buying process?"
  - Selling/Valuation: "...Would you like a personalized checklist based on what you've read?"
  - Cash: "Cash offers are situational..."
  - Stories: "Still thinking? That's okay..."
- **Data**: `selena_guide_handoff_click` event, guide_id and category logged

### 1.5 Synthesis Footer (Guides Hub -- Post-Grid)
- **Trigger**: "Summarize what I've learned" or "Ask a question" buttons at bottom of guides hub
- **Component**: `SelenaSynthesisFooter.tsx`
- **Condition**: "Summarize" button only appears if `guidesReadCount >= 3`
- **Selena Response**: 
  - If 3+ guides: "You've read X guides -- you're building a clear picture..."
  - If fewer: "You've been exploring your options. Would you like me to summarize?"
- **Data**: Opens chat with `source: 'synthesis'`, `guidesReadCount`, optional prefill message
- **Prefill behavior**: If prefill message provided, it auto-sends after greeting renders (300ms delay)

### 1.6 Contextual Selena Prompt (Guides Hub -- Cognitive Stage Aware)
- **Trigger**: "Ask Selena" or "Get My Summary" on stage-aware prompt block
- **Component**: `ContextualSelenaPrompt.tsx`
- **Condition**: Summary offer gated by cognitive stage + guides read count
- **Selena Response**: Same as synthesis entry

### 1.7 Post-Booking (Thank You Page)
- **Trigger**: Click "While you wait, I can help" on `/v2/thank-you`
- **Component**: `V2ThankYou.tsx` calling `openChat({ source: 'post_booking', intent, userName })`
- **Selena Response**: Identity reinforcement greeting:
  - EN: "[Name], You're all set. You've already done the hard part... Kasandra will personally review..."
  - Suggested replies: "What should I prepare for the call?" / "Can I reschedule?" / "Thanks, Selena"
- **Data**: `selena_entry` with `source: 'post_booking'`

### 1.8 Ad Funnel Result Page (SellerResult)
- **Trigger**: Auto-triggered 12 seconds after unlock on `/ad/seller-result` (proactive), or manual click
- **Component**: `SellerResult.tsx`
- **Behavior**: Opens chat via `openChat()`, then dispatches `selena-proactive-message` custom event with loss-aversion message referencing the net sheet difference amount
- **Selena Response**: Proactive message injected into chat: references dollar difference
- **Suggested replies**: "Yes, explain the difference" / "I'd like to talk to Kasandra" / "Not right now"

### 1.9 Buyer Readiness Handoff
- **Trigger**: User completes buyer readiness check follow-up questions, clicks "Continue with Selena"
- **Component**: `SelenaHandoff.tsx` calling `openChat()`
- **Selena Response**: Default greeting (no special entry context passed)
- **Data**: `CTA_NAMES.SELENA_ROUTE_CALL` event logged

### 1.10 Question CTA
- **Trigger**: Any component calling `openChat({ source: 'question' })`
- **Selena Response**: "I'm here to help. What question do you have in mind?"
- **Suggested replies**: "What's my home worth?" / "How does the process work?" / "What are my options?"

---

## SECTION 2: CONCIERGE TAB BAR (Inside Drawer)

Four tabs appear at the bottom of the Selena drawer, each opening a slide-up panel.

### 2.1 Start Here Tab
- **Label**: "Start Here" (or journey step label if intent declared, e.g., "Step 1: Value")
- **Panel Content**: 3 intent declaration buttons + 2 quick guide links
- **Triggers**:
  - "I'm thinking about selling" --> sends message to Selena chat
  - "I'm looking to buy" --> sends message to Selena chat
  - "Just exploring for now" --> sends message to Selena chat
  - "First-Time Buyer Guide" --> navigates to `/v2/guides/first-time-buyer-guide`, closes drawer
  - "Selling Your Home" --> navigates to `/v2/guides/selling-for-top-dollar`, closes drawer

### 2.2 Guides Tab
- **Panel Content**: "Browse All Guides" button + 3 featured guide quick links
- **Triggers**:
  - "Browse All Guides" --> navigates to `/v2/guides`, closes drawer
  - Individual guides --> navigate to respective guide detail pages, close drawer

### 2.3 My Options Tab (Intent-Filtered)
- **Panel Content**: Intent-aware option cards, ordered by relevance
- **Filtering Logic**:
  - **Buyer intent**: Buyer Readiness Check (top) / Valuation / Cash vs Listing
  - **Seller/Cash intent**: Valuation (top) / Cash vs Listing (Buyer Readiness hidden)
  - **Exploring/Unknown**: Valuation / Cash vs Listing / Buyer Readiness
- **Triggers**:
  - "See what I might walk away with" --> sends chat message asking about property valuation (does NOT navigate)
  - "Cash vs Listing Comparison" --> navigates to `/v2/cash-offer-options`, closes drawer
  - "Buyer Readiness Check" --> navigates to `/v2/buyer-readiness`, closes drawer
  - "View My Latest Report" --> appears ONLY if `leadId` exists AND `hasReports === true`, triggers `openLastReport()` flow

### 2.4 Talk Tab
- **Panel Content**: Two booking buttons + "Keep Chatting" option
- **Triggers**:
  - "Schedule a Call" --> triggers `handlePriorityCall()` --> opens Priority Call Modal
  - "10-Min Priority Call" --> same as above
  - Both log `priority_call_click` event

---

## SECTION 3: INTENT-SPECIFIC JOURNEYS

### 3.1 SELL PATH

**Entry**: User says "I'm thinking about selling" (via Start Here tab, suggested reply, or free text)

```text
Step 1: Message sent to selena-chat edge function
  --> Intent detected: "sell" (canonical)
  --> Mode: ORIENTATION (Mode 1) on first turn
  --> Selena asks ONE gentle question about situation
  --> Suggested replies: "What's my home worth?" / "Compare my options" / "View seller guide"

Step 2: User engages with tool/guide
  --> Mode transitions to CLARITY (Mode 2)
  --> Reflection sentence formula activated
  --> Suggested replies adapt to seller tools

Step 3: Deep engagement (3+ guides OR tool result)
  --> Mode transitions to CONFIDENCE (Mode 3)
  --> "Summarize what I've learned" / "What should I prepare?" / "What's my next step?"
  
Step 4: Earned Access triggered (explicit ask, email, tool completion, or 2+ turns with intent)
  --> Mode transitions to HANDOFF (Mode 4)
  --> Actions array includes: "Review Strategy with Kasandra" (href: /v2/book)
  --> "I have more questions first" / "What happens on the call?"
  
Step 5a: User clicks "Review Strategy with Kasandra"
  --> Navigates to /v2/book, drawer closes
  
Step 5b: User clicks Talk tab --> Priority Call Modal
  --> Step 1 of modal: Channel selection (Zoom / Phone / Keep Chatting)
  --> Step 2: Slot selection (if available) or callback request
  --> Terminal: Booking URL opened OR callback created via create-handoff edge function
```

**Data captured along path**:
- `intent` set in SessionContext (write-once)
- `selena_mode_transition` logged per message
- If email detected in message: `lead_profiles` upserted, `lead_id` returned
- Chat history persisted to `localStorage`

### 3.2 BUY PATH

**Entry**: User says "I'm looking to buy"

```text
Step 1: Intent detected: "buy"
  --> Mode 1 orientation, one question
  --> Suggested replies: "Take the readiness check" / "View buyer guide" / "What should I prepare?"

Step 2: User takes readiness check (navigates to /v2/buyer-readiness via My Options tab)
  --> Completes readiness quiz --> SelenaHandoff follow-up questions
  --> "Continue with Selena" button opens chat (no special entry context)
  --> SessionContext updated: readiness_score, quiz_completed

Step 3: Mode 2 Clarity Building
  --> References readiness score progress
  --> Suggests guides, neighborhoods exploration

Step 4-5: Same earned access gate and handoff as Sell path
```

### 3.3 CASH OFFER PATH

**Entry**: User mentions "cash" or visits from `/ad/seller*` funnel

```text
Step 1: Intent detected: "cash" (highest priority in detection)
  --> If from ad funnel: proactive message with net sheet difference injected
  --> Suggested replies: "What's my home worth?" / "How fast can I close?" / "Request a cash offer"

Step 2-5: Same progression through modes as Sell path
  --> Cash-specific progression map entries apply
  --> Priority handoff triggered if timeline = "asap" + intent = "cash"
```

### 3.4 EXPLORE PATH

**Entry**: User says "Just exploring for now"

```text
Step 1: Intent detected: "explore"
  --> Mode stays at 1 (Orientation) longer
  --> Suggested replies: "Tell me about selling" / "Tell me about buying" / "What are my options?"
  
Step 2: Engagement signals move to Mode 2
  --> BUT: Earned access rule blocks booking CTA even at 2+ turns (requires intent != explore)
  --> User must either: declare specific intent, provide email, complete tool, or explicitly ask to book

Step 3: Stall recovery (5+ turns, repeating "just curious")
  --> Override suggested replies: "Yes, summarize where I am" / "I'd rather keep exploring" / "I have a specific question"
```

---

## SECTION 4: ESCALATION PATHS (Converging to Scheduling)

All paths converge to scheduling through these mechanisms:

### 4.1 Mode 4 Action Button
- **Source**: AI response includes `actions: [{ label: "Review Strategy with Kasandra", href: "/v2/book" }]`
- **Condition**: `modeContext.allowBookingCTA === true`
- **Behavior**: `handleActionClick` calls `closeChat()` then `navigate('/v2/book')`
- **Terminal**: User lands on `/v2/book` consultation intake form

### 4.2 Priority Call Modal (Talk Tab or AI Action)
- **Source**: Talk tab click or AI returns `type: 'priority_call'` action
- **Condition**: If no `leadId`, opens LeadCaptureModal first
- **Flow**:
  1. Channel selection: Zoom or Phone
  2. `create-handoff` edge function called with chat summary
  3. Slots displayed if available, or callback request option
  4. Slot click / Book click --> opens booking URL (internal `/v2/book` or external) or navigates
  5. "Text Me Instead" --> `onRequestCallback` with `contactPref: 'text'`
  6. "Keep Chatting with Selena" --> closes modal, returns to chat
- **Data stored**: `lead_handoffs` table row created via `create-handoff`
- **Terminal**: Booking page opened, or callback/text request created

### 4.3 Direct /v2/book Navigation
- **Source**: V2Navigation global nav link (always visible)
- **Behavior**: User lands directly on consultation intake form
- **No Selena gating**: This is an authorized direct-access path

### 4.4 Identity Gateway (LeadCaptureModal)
- **Trigger**: User tries to generate report or trigger priority call without `leadId`
- **Flow**: Email (required) --> Name + Phone (optional) --> `upsert-lead-profile` edge function
- **Data stored**: `lead_profiles` row created, `selena_lead_id` in localStorage
- **Resume**: After capture, pending action (report generation or priority call) auto-resumes

---

## SECTION 5: DATA CAPTURE INVENTORY

| Data Point | Capture Trigger | Storage Location |
|---|---|---|
| `selena_lead_id` | Email detected in chat OR LeadCaptureModal | `localStorage`, `lead_profiles.id` |
| `intent` | First message with intent keywords | `SessionContext` (write-once), `lead_profiles.intent` |
| `timeline` | Message with urgency keywords | `lead_profiles.timeline` |
| `email` | Typed in chat OR LeadCaptureModal | `lead_profiles.email` |
| `chat_history` | Every message | `localStorage` (last 50 messages) |
| `session_id` | Session init | `localStorage` (`selena_context_v2`) |
| `last_page` | Every route change | `SessionContext.last_page` |
| `has_booked` | Form success on /v2/book | `SessionContext.has_booked` |
| `last_guide_id` | Guide detail page visit | `SessionContext.last_guide_id` |
| `readiness_score` | Buyer readiness completion | `SessionContext.readiness_score` |
| `tool_used` | Calculator/quiz completion | `SessionContext.tool_used` |
| `calculator advantage` | Calculator result | `SelenaChatContext` state |
| Handoff record | Priority call modal completion | `lead_handoffs` table |
| Report | Report generation | `lead_reports` table |

---

## SECTION 6: CONVERGING, DUPLICATED, AND LOOPING PATHS

### Converging Paths (Multiple Entry --> Same Destination)
1. **All intent declaration paths** (Start Here tab, free text, suggested replies, guide handoff) converge into the same `sendMessage()` --> `selena-chat` edge function pipeline
2. **All scheduling paths** (Mode 4 action button, Talk tab, Priority Call Modal) converge to either `/v2/book` or `create-handoff`
3. **All guide navigation paths** (Guides tab, Start Here quick links, My Options, AI suggested replies) converge to `/v2/guides/*` routes

### Duplicated Paths
1. **Talk tab**: Both "Schedule a Call" AND "10-Min Priority Call" buttons call the exact same `handlePriorityCall()` function -- functionally identical
2. **Default greeting**: Floating button, hero CTA, and cleared history all generate nearly identical Mode 1 greetings with the same 3 suggested replies
3. **"Keep Chatting"** option appears in both the Priority Call Modal (channel step AND slots step) and as a suggested reply in Mode 4

### Looping Paths
1. **Explore loop**: Users with `intent = explore` can cycle indefinitely through Mode 1-2 without earning booking access (by design -- earned access requires intent != explore OR explicit ask)
2. **Stall recovery loop**: After stall detection, if user picks "I'd rather keep exploring," they re-enter the same loop until stall triggers again at 5+ more turns
3. **Report --> LeadCapture --> Report**: If user clicks "View My Latest Report" without `leadId`, opens LeadCaptureModal, which on success auto-resumes `openLastReport()`. If no reports exist, shows empty state.
4. **Guide handoff re-entry**: Opening Selena from a guide handoff replaces chat history with a new greeting (because `isPostBooking` is false and `messages.length === 0` check triggers on re-entry only when history is empty)

### Non-Looping Terminal States
1. **Booking complete**: Redirect to `/v2/thank-you` with intent and name params
2. **Callback requested**: `create-handoff` with `contactPref: 'text'` or `'call'`, modal closes
3. **Chat abandoned**: User closes drawer, history persists in localStorage for next session

---

## SECTION 7: CHAT-INDEPENDENT PATHS

These paths function WITHOUT any Selena chat interaction:

1. `/v2/book` (direct nav from global navigation) --> ConsultationIntakeForm --> `submit-consultation-intake` edge function --> redirect to `/v2/thank-you`
2. `/v2/cash-offer-options` --> TucsonAlphaCalculator (standalone tool, no chat required)
3. `/v2/buyer-readiness` --> BuyerReadinessCheck quiz (standalone, no chat required)
4. `/v2/guides/*` --> Static guide content (readable without chat)
5. `/v2/quiz` --> Path Quiz orientation (standalone form, submits to edge function)
6. `/ad/seller` --> `/ad/seller-quiz` --> `/ad/seller-result` (entire ad funnel works without chat until proactive trigger)

### Critical Routing Dependencies on Chat
- **None are hard dependencies**. All pages render and function without chat. Selena enhances but does not gate any critical path except report generation (requires `leadId`, which requires LeadCaptureModal or email in chat).
