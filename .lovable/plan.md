
# Intelligence Injection: Native Lead Capture & Dynamic Decision Rooms
## Complete Implementation Plan

---

## EXECUTIVE SUMMARY

This plan migrates from external GoHighLevel iframes to native React Hook Form components with SessionContext intelligence, making the platform truly "context-aware" where forms pre-populate with user journey data and decision rooms adapt based on cognitive stage.

---

## CURRENT STATE ANALYSIS

### What Exists
| Component | Current State | Target State |
|-----------|--------------|--------------|
| `ConsultationIntakeForm.tsx` | Native form exists but no SessionContext pre-population | Pre-populate from SessionContext |
| `GuideLeadCapture.tsx` | Uses GHL iframe (`GoHighLevelForm`) | Replace with native form |
| `V2Book.tsx` | Uses native `ConsultationIntakeForm` + GHL calendar | Enhance with pre-population |
| `V2HomePathQuiz.tsx` | Shows result but no dynamic pivoting | Pivot results based on intent |
| `BuyerReadinessCheck.tsx` | Static result bullets | Dynamic re-ordering by readiness score |
| `V2PrivateCashReview.tsx` | Static hero, no lead awareness | State machine: returning vs. new |
| Edge Function | Sends basic data to GHL | Send full session dossier |

### SessionContext Fields Available
From `selenaSession.ts`:
- `intent`: 'cash_offer' | 'sell' | 'buy' | 'investor' | 'explore'
- `timeline`: 'asap' | '30_days' | '60_90' | 'exploring'
- `situation`: 'inherited' | 'divorce' | 'tired_landlord' | 'upgrading' | 'relocating' | 'other'
- `condition`: 'move_in_ready' | 'minor_repairs' | 'distressed' | 'unknown'
- `tool_used`, `last_tool_result` (calculator awareness)
- `quiz_completed`, `quiz_result_path`
- `has_viewed_report`, `has_booked`

---

## IMPLEMENTATION TASKS

### Task 1: Enhance ConsultationIntakeForm with SessionContext Pre-Population

**File**: `src/components/v2/ConsultationIntakeForm.tsx`

**Changes**:
1. Import `getSessionContext` from `selenaSession.ts`
2. In `useEffect`, read SessionContext and pre-populate form fields
3. Map session values to form values (e.g., `session.intent` → `form.intent`)
4. Add visual indicator when fields are pre-populated ("Based on your earlier answers")

**Pre-Population Logic**:
```text
Session Field → Form Field Mapping:
- session.intent → form.intent (buyer, seller, cash_offer, unknown)
- session.timeline → form.timeline (map asap→immediately, 30_days→1_3_months, etc.)
- session.language → form.preferredLanguage
- localStorage.get('cc_user_name') → form.name (if from quiz)
- localStorage.get('cc_user_email') → form.email
- localStorage.get('cc_user_phone') → form.phone
```

---

### Task 2: Create Native GuideLeadCaptureForm Component

**New File**: `src/components/v2/guides/NativeGuideLeadCapture.tsx`

**Features**:
- Simplified 4-field form: Name, Email, Phone, Intent (inferred)
- SessionContext pre-population
- Calls `submit-consultation-intake` edge function
- Bridges lead_id via `bridgeLeadIdToV2()`
- Success state shows "Checklist sent!" confirmation

**Replace In**:
- `src/components/v2/guides/GuideLeadCapture.tsx` - swap GHL iframe for native form
- `src/pages/v2/V2GuideDetail.tsx` - uses GuideLeadCapture (no changes needed if component updated)

---

### Task 3: Dynamic Buyer Readiness Results

**File**: `src/components/v2/BuyerReadinessCheck.tsx`

**Changes**:
1. Calculate `readiness_score` from answers (0-100 scale)
2. Identify `primary_priority` from question 3 answer
3. Store in SessionContext: `updateSessionContext({ readiness_score, primary_priority })`
4. Re-order `result.bullets` to show priority-relevant steps first

**Scoring Logic**:
```text
Readiness Score Calculation:
- Question 0 (Situation): Touring +30, Active +20, Planning +10, Exploring +5
- Question 1 (Lender): Pre-approved +30, Talked +15, Not yet +5
- Question 2 (Priority): Mapped to next step emphasis
- Question 3 (Comfort): Confident +10, Somewhat +5, Overwhelmed +0

Result Customization:
- If priority = "monthly_payment" → Lead with financing bullet
- If priority = "neighborhoods" → Lead with location bullet
- If priority = "affordability" → Lead with budget bullet
```

---

### Task 4: Dynamic Path Quiz Results

**File**: `src/pages/v2/V2HomePathQuiz.tsx`

**Changes**:
1. Store `quiz_completed: true` and `quiz_result_path` in SessionContext on completion
2. Submit contact info to `upsert-lead-profile` edge function
3. Pivot result content based on `getResultPath()`:
   - **Cash Offer**: Show speed/simplicity messaging, link to `/v2/cash-offer-options`
   - **Buyer**: Show home search roadmap, link to `/v2/buyer-readiness`
   - **Seller**: Show value preparation, link to `/v2/sell`
   - **Exploring**: Show gentle guidance, link to `/v2/guides`

**Integration**:
- Call `bridgeLeadIdToV2()` after quiz completion to persist identity

---

### Task 5: Private Cash Review State Machine

**File**: `src/pages/v2/V2PrivateCashReview.tsx`

**State Machine**:
```text
┌─────────────────────────────────────────────────────────┐
│                   ON PAGE LOAD                          │
│                         │                               │
│           ┌─────────────┴─────────────┐                 │
│           ▼                           ▼                 │
│   [lead_id EXISTS]            [lead_id MISSING]         │
│           │                           │                 │
│           ▼                           ▼                 │
│   "Welcome Back, [Name]"      "Start My Review"         │
│   "Your Analysis is Ready"    Standard Hero             │
│           │                           │                 │
│           ▼                           ▼                 │
│   CTA: "View My Report"       CTA: "Chat with Selena"   │
│   Opens last report           Opens chat to collect     │
│                               info for report           │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:
1. Check `localStorage.getItem('selena_lead_id')` on mount
2. If exists, fetch lead name from edge function or context
3. Check `localStorage.getItem('cc_last_report_id')` for existing report
4. Conditionally render personalized vs. default hero

---

### Task 6: Full Session Dossier to GHL Webhook

**File**: `supabase/functions/submit-consultation-intake/index.ts`

**Enhance GHL Payload**:
```typescript
const ghlPayload = {
  // Existing fields...
  email,
  name,
  phone,
  tags: [...],
  
  // NEW: Full Session Dossier
  customField: {
    lead_id: leadId,
    language: input.language,
    intent: input.intent,
    timeline: input.timeline,
    price_range: input.price_range || null,
    pre_approved: input.pre_approved || null,
    notes: input.notes || null,
    
    // NEW FIELDS - Complete Cognitive Journey
    situation: input.situation || null,           // inherited, divorce, etc.
    condition: input.condition || null,           // move_in_ready, distressed, etc.
    readiness_score: input.readiness_score || null,
    primary_priority: input.primary_priority || null,
    quiz_completed: input.quiz_completed || false,
    quiz_result_path: input.quiz_result_path || null,
    tool_used: input.tool_used || null,
    last_tool_result: input.last_tool_result || null,  // cash/traditional advantage
    has_viewed_report: input.has_viewed_report || false,
    session_source: input.session_source || null,      // landing path
    utm_source: input.utm_source || null,
    utm_campaign: input.utm_campaign || null,
  },
  source: "Consultation Intake - Lovable /v2/book",
};
```

**Frontend Changes** (ConsultationIntakeForm):
- Pass full SessionContext to edge function on submit

---

### Task 7: Authority Layer Verification

**Files**:
- `src/hooks/useGoogleReviews.ts` - Already has 3-tier fallback
- `src/hooks/useYouTubeVideos.ts` - Verify fallback exists

**Verification**:
- Google Reviews: Live API → 24h Cache → Static Fallbacks (5 curated reviews)
- YouTube Videos: Live API → Cache → Static Fallbacks (if needed)

**Status**: Already implemented correctly per memory `authority-fallbacks`

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `src/components/v2/ConsultationIntakeForm.tsx` | MODIFY | Add SessionContext pre-population |
| `src/components/v2/guides/NativeGuideLeadCapture.tsx` | CREATE | New native form component |
| `src/components/v2/guides/GuideLeadCapture.tsx` | MODIFY | Replace GHL iframe with native form |
| `src/components/v2/BuyerReadinessCheck.tsx` | MODIFY | Add dynamic result reordering |
| `src/pages/v2/V2HomePathQuiz.tsx` | MODIFY | Add SessionContext updates, lead bridge |
| `src/pages/v2/V2PrivateCashReview.tsx` | MODIFY | Implement state machine |
| `supabase/functions/submit-consultation-intake/index.ts` | MODIFY | Expand GHL payload |
| `src/lib/analytics/bridgeLeadIdToV2.ts` | CREATE | Helper for lead identity bridging |

---

## TECHNICAL DETAILS

### SessionContext Pre-Population Hook

```typescript
// New hook: useSessionPrePopulation.ts
export function useSessionPrePopulation() {
  const [prePopData, setPrePopData] = useState<Partial<FormData> | null>(null);
  
  useEffect(() => {
    const session = getSessionContext();
    if (!session) return;
    
    const data: Partial<FormData> = {};
    
    // Map intent
    if (session.intent) {
      const intentMap: Record<string, string> = {
        buy: 'buyer',
        sell: 'seller', 
        cash_offer: 'cash_offer',
        explore: 'unknown'
      };
      data.intent = intentMap[session.intent] || 'unknown';
    }
    
    // Map timeline
    if (session.timeline) {
      const timelineMap: Record<string, string> = {
        asap: 'immediately',
        '30_days': '1_3_months',
        '60_90': '3_6_months',
        exploring: 'researching'
      };
      data.timeline = timelineMap[session.timeline];
    }
    
    // Language
    data.preferredLanguage = session.language;
    
    setPrePopData(data);
  }, []);
  
  return prePopData;
}
```

### Lead Identity Bridge Helper

```typescript
// New file: src/lib/analytics/bridgeLeadIdToV2.ts
export function bridgeLeadIdToV2(leadId: string): void {
  localStorage.setItem('selena_lead_id', leadId);
  
  // Update session context
  updateSessionContext({ 
    has_captured_lead: true 
  });
  
  // Log bridge event
  logEvent('lead_id_bridged', { 
    lead_id: leadId,
    source: 'native_form' 
  });
}
```

---

## VERIFICATION PLAN

### E2E Browser Session Test Sequence

1. **Clear State**: Clear localStorage to simulate new visitor
2. **Navigate**: Go to `/v2/buyer-readiness`
3. **Take Check**: Complete 4-question readiness assessment
4. **Observe**: Results should show dynamic bullet ordering based on priority
5. **Navigate**: Click through to a guide (e.g., `/v2/guides/first-time-buyer-guide`)
6. **Scroll**: Reach mid-guide lead capture form
7. **Verify Pre-Population**: 
   - Intent field should show "Buy a home" (from readiness check)
   - Language should match current language
8. **Submit Form**: Enter name, email, phone
9. **Verify**: 
   - Edge function receives full session dossier
   - GHL webhook receives complete cognitive journey
   - `selena_lead_id` stored in localStorage
10. **Navigate**: Go to `/v2/private-cash-review`
11. **Verify State Machine**: Hero should show "Welcome Back" variant

---

## SUCCESS CRITERIA

1. Native forms fully replace GHL iframes in guides
2. Forms pre-populate 3+ fields from SessionContext when data exists
3. BuyerReadiness results dynamically reorder based on priority
4. Path Quiz stores `quiz_result_path` and bridges lead identity
5. PrivateCashReview shows personalized hero for returning leads
6. GHL receives 10+ custom fields in the Full Dossier payload
7. Authority layer (Reviews/YouTube) gracefully degrades with fallbacks
8. E2E test passes all verification checkpoints

---

## IMPLEMENTATION ORDER

1. **Create** `bridgeLeadIdToV2.ts` helper (dependency for other tasks)
2. **Enhance** `ConsultationIntakeForm.tsx` with pre-population
3. **Create** `NativeGuideLeadCapture.tsx` component
4. **Update** `GuideLeadCapture.tsx` to use native form
5. **Modify** `BuyerReadinessCheck.tsx` for dynamic results
6. **Modify** `V2HomePathQuiz.tsx` for session persistence
7. **Modify** `V2PrivateCashReview.tsx` state machine
8. **Enhance** `submit-consultation-intake` edge function
9. **Verify** authority fallbacks (already implemented)
10. **Run** E2E browser verification

This plan transforms the platform from "static forms with widgets" to an "intelligent, context-aware concierge experience" where every interaction builds upon previous context.
