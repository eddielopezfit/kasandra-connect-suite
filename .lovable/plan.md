

# Architecture Injection & Systemic Implementation Plan
## Corner Connect Digital Concierge Platform

---

## EXECUTIVE SUMMARY

This plan implements three phases of systemic improvements to align the codebase with the Decision Room Architecture defined in `plan.md`. The objective is to standardize context tracking, bridge the Ad Funnel to the V2 ecosystem, and verify security compliance.

---

## PHASE 1: CONTEXT STANDARDIZATION (V2 Ecosystem)

### Current State Analysis

After auditing the codebase, I found the following gaps:

| Route | Layout Status | Intent Auto-Set | Session Tracking | Gap |
|-------|---------------|-----------------|------------------|-----|
| `/v2` | V2Layout | N/A | Page view logged | None |
| `/v2/buy` | V2Layout | **MISSING** | Page view logged | Intent not auto-set |
| `/v2/sell` | V2Layout | **MISSING** | Page view logged | Intent not auto-set |
| `/v2/cash-offer-options` | V2Layout | Set by calculator | Full tracking | None |
| `/v2/private-cash-review` | V2Layout | N/A | Page view logged | `has_viewed_report` missing |
| `/v2/book` | V2Layout | N/A | Page view logged | `has_booked` missing |
| `/v2/guides` | V2Layout | N/A | Full guide tracking | None |
| `/v2/quiz` | V2Layout | N/A | Page view logged | Quiz completion not bridged |

### Task 1.1: Extend SessionContext Interface

**File:** `src/lib/analytics/selenaSession.ts`

**Add the following fields to `SessionContext`:**

```typescript
interface SessionContext {
  // ... existing fields ...
  
  // Phase 1: Decision Room tracking
  has_viewed_report?: boolean;
  last_report_id?: string;
  quiz_completed?: boolean;
  quiz_result_path?: 'buying' | 'selling' | 'cash' | 'exploring';
  has_booked?: boolean;
  
  // Phase 2: Ad Funnel bridge
  ad_funnel_source?: 'seller_landing' | 'seller_quiz';
  ad_funnel_value_range?: string;
}
```

### Task 1.2: Auto-Set Intent in V2Buy

**File:** `src/pages/v2/V2Buy.tsx`

**Add `useEffect` to set intent on mount:**

```typescript
import { useEffect } from "react";
import { updateSessionContext } from "@/lib/analytics/selenaSession";

const V2BuyContent = () => {
  const { t } = useLanguage();

  // Auto-set intent when entering Buyer Decision Room
  useEffect(() => {
    updateSessionContext({ intent: 'buy' });
  }, []);

  // ... rest of component
};
```

### Task 1.3: Auto-Set Intent in V2Sell

**File:** `src/pages/v2/V2Sell.tsx`

**Same pattern as V2Buy:**

```typescript
import { useEffect } from "react";
import { updateSessionContext } from "@/lib/analytics/selenaSession";

const V2SellContent = () => {
  const { t } = useLanguage();

  // Auto-set intent when entering Seller Decision Room
  useEffect(() => {
    updateSessionContext({ intent: 'sell' });
  }, []);

  // ... rest of component
};
```

### Task 1.4: Track Report View in V2PrivateCashReview

**File:** `src/pages/v2/V2PrivateCashReview.tsx`

**Add tracking on mount:**

```typescript
import { useEffect } from "react";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

const PrivateCashReviewContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const schedulingRef = useRef<HTMLDivElement>(null);

  // Track when user views Private Cash Review room
  useEffect(() => {
    updateSessionContext({ has_viewed_report: true });
    logEvent('private_cash_review_view', { source: 'direct_navigation' });
  }, []);

  // ... rest of component
};
```

### Task 1.5: Track Booking Commitment in V2Book

**File:** `src/pages/v2/V2Book.tsx`

**Modify `handleFormSuccess` to track commitment:**

```typescript
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

const handleFormSuccess = (leadId: string) => {
  console.log("Consultation intake submitted, lead_id:", leadId);
  
  // Track booking commitment (Stage 6 signal)
  updateSessionContext({ has_booked: true });
  logEvent('consultation_booked', { 
    lead_id: leadId,
    intent: searchParams.get("intent") || "general" 
  });
  
  // Persist journey action for cognitive stage calculation
  const actions = JSON.parse(localStorage.getItem('cc_journey_actions') || '[]');
  if (!actions.includes('book')) {
    actions.push('book');
    localStorage.setItem('cc_journey_actions', JSON.stringify(actions));
  }
};
```

---

## PHASE 2: AD FUNNEL TO V2 BRIDGE

### Current State Analysis

The Ad Funnel routes (`/ad/seller`, `/ad/seller-quiz`, `/ad/seller-result`) currently:
- Use `SellerFunnelLayout` (voice widget, not chat)
- Do NOT initialize session context
- Do NOT persist lead_id for V2 continuity
- Are English-only (no language governance)

### Task 2.1: Create Ad Funnel Session Initializer

**New File:** `src/lib/analytics/initAdFunnelSession.ts`

```typescript
/**
 * Ad Funnel Session Bridge
 * Initializes session context for ad funnel visitors
 * and bridges data to V2 ecosystem for continuity
 */

import { 
  initSessionContext, 
  updateSessionContext,
  getSessionContext 
} from './selenaSession';

export function initAdFunnelSession(): void {
  // Initialize with English (ad funnel is English-only)
  initSessionContext('en');
  
  // Capture UTMs from URL
  const params = new URLSearchParams(window.location.search);
  
  updateSessionContext({
    landing_path: window.location.pathname,
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    ad_funnel_source: window.location.pathname.includes('seller') 
      ? 'seller_landing' 
      : undefined,
  });
}

export function bridgeQuizResultsToV2(quizAnswers: {
  situation?: string;
  condition?: string;
  timeline?: string;
  value?: string;
}): void {
  const timelineMap: Record<string, 'asap' | '30_days' | '60_90' | 'exploring'> = {
    'asap': 'asap',
    'soon': '30_days',
    'flexible': '60_90',
    'no-rush': 'exploring',
  };
  
  const situationMap: Record<string, 'inherited' | 'relocating' | 'other'> = {
    'inherited': 'inherited',
    'relocating': 'relocating',
    'downsizing': 'other',
    'other': 'other',
  };
  
  const conditionMap: Record<string, 'move_in_ready' | 'minor_repairs' | 'distressed'> = {
    'excellent': 'move_in_ready',
    'good': 'minor_repairs',
    'fair': 'distressed',
    'poor': 'distressed',
  };

  updateSessionContext({
    intent: 'cash_offer',
    timeline: quizAnswers.timeline ? timelineMap[quizAnswers.timeline] : undefined,
    situation: quizAnswers.situation ? situationMap[quizAnswers.situation] : undefined,
    condition: quizAnswers.condition ? conditionMap[quizAnswers.condition] : undefined,
    quiz_completed: true,
    ad_funnel_value_range: quizAnswers.value,
  });
}

export function bridgeLeadIdToV2(leadId: string): void {
  // Store lead_id in localStorage for V2 pickup
  localStorage.setItem('selena_lead_id', leadId);
  
  // Log the bridge event
  console.log('[AdFunnel] Lead ID bridged to V2:', leadId);
}
```

### Task 2.2: Initialize Session in SellerLanding

**File:** `src/pages/ad/SellerLanding.tsx`

**Add session initialization:**

```typescript
import { useEffect } from "react";
import { initAdFunnelSession } from "@/lib/analytics/initAdFunnelSession";

const SellerLanding = () => {
  // Initialize ad funnel session on mount
  useEffect(() => {
    initAdFunnelSession();
  }, []);

  return (
    <SellerFunnelLayout>
      {/* ... existing content ... */}
    </SellerFunnelLayout>
  );
};
```

### Task 2.3: Bridge Quiz Results in SellerResult

**File:** `src/pages/ad/SellerResult.tsx`

**Bridge data on lead capture success:**

```typescript
import { 
  bridgeQuizResultsToV2, 
  bridgeLeadIdToV2 
} from "@/lib/analytics/initAdFunnelSession";

const handleSubmit = async (e: React.FormEvent) => {
  // ... existing validation ...

  try {
    const { data, error } = await supabase.functions.invoke('submit-seller', {
      body: { /* ... existing body ... */ },
    });

    if (error) throw error;

    // Bridge quiz answers to V2 session context
    bridgeQuizResultsToV2({
      situation: quizAnswers.situation,
      condition: quizAnswers.condition,
      timeline: quizAnswers.timeline,
      value: quizAnswers.value,
    });

    // Bridge lead_id for V2 continuity (if returned from edge function)
    if (data?.lead_id) {
      bridgeLeadIdToV2(data.lead_id);
    }

    setIsUnlocked(true);
    toast.success("Report sent! Check your texts.");

  } catch (error) {
    // ... existing error handling ...
  }
};
```

### Task 2.4: Track Quiz Step in SellerQuiz

**File:** `src/pages/ad/SellerQuiz.tsx`

**Initialize session and track progress:**

```typescript
import { useEffect } from "react";
import { initAdFunnelSession } from "@/lib/analytics/initAdFunnelSession";
import { updateSessionContext } from "@/lib/analytics/selenaSession";

const SellerQuiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Initialize session on mount
  useEffect(() => {
    initAdFunnelSession();
    updateSessionContext({ ad_funnel_source: 'seller_quiz' });
  }, []);

  // ... rest of component
};
```

---

## PHASE 3: SECURITY VERIFICATION

### Task 3.1: RLS Policy Verification

**Current State:**
- `lead_reports` table has RLS enabled
- INSERT policy: `Anyone can insert reports` (permissive for generation)
- SELECT/UPDATE/DELETE policies: **NOT VISIBLE TO ANON USERS**

**Verification Required:**
The `get-report` edge function already implements application-level security:
- Validates `lead_id` UUID format
- Queries with BOTH `report_id` AND `lead_id` match
- Returns 404 (not 403) on mismatch to prevent enumeration

**Security Audit Checklist:**

| Check | Status | Notes |
|-------|--------|-------|
| `lead_id` required in request | PASS | Returns 400 if missing |
| UUID format validation | PASS | Uses regex validation |
| Dual-key lookup | PASS | `eq("id", report_id).eq("lead_id", lead_id)` |
| Enumeration protection | PASS | Returns 404 on any mismatch |
| Service role used | CAUTION | Uses `SUPABASE_SERVICE_ROLE_KEY` |

**Recommendation:** The edge function security is solid. The use of service role key is necessary because anon users cannot SELECT from `lead_reports`. This is the correct pattern for application-level access control.

### Task 3.2: Client-Side Protection in V2PrivateCashReview

**Current State:** The page shows placeholder content. When actual reports are displayed, ensure:

```typescript
// When openReportById is called
const openReportById = useCallback(async (reportId: string) => {
  if (!leadId) {
    // This triggers lead capture modal - CORRECT BEHAVIOR
    setPendingReportId(reportId);
    setShowLeadCapture(true);
    return;
  }
  // ... proceed with fetch
}, [leadId]);
```

This pattern is already implemented in `SelenaChatContext.tsx` (lines 470-477). No changes needed.

---

## FILES TO MODIFY

| Phase | File | Change Type | Priority |
|-------|------|-------------|----------|
| 1.1 | `src/lib/analytics/selenaSession.ts` | Extend interface | HIGH |
| 1.2 | `src/pages/v2/V2Buy.tsx` | Add useEffect | HIGH |
| 1.3 | `src/pages/v2/V2Sell.tsx` | Add useEffect | HIGH |
| 1.4 | `src/pages/v2/V2PrivateCashReview.tsx` | Add tracking | HIGH |
| 1.5 | `src/pages/v2/V2Book.tsx` | Enhance handleFormSuccess | HIGH |
| 2.1 | `src/lib/analytics/initAdFunnelSession.ts` | **NEW FILE** | MEDIUM |
| 2.2 | `src/pages/ad/SellerLanding.tsx` | Add session init | MEDIUM |
| 2.3 | `src/pages/ad/SellerResult.tsx` | Bridge quiz data | MEDIUM |
| 2.4 | `src/pages/ad/SellerQuiz.tsx` | Add session init | MEDIUM |

---

## TESTING STRATEGY

### Browser Session Test: Ad Funnel to V2 Bridge

**Test Flow:**

1. **Clear localStorage** (fresh session)
2. Navigate to `/ad/seller`
3. Verify: `selena_context_v2` contains `ad_funnel_source: 'seller_landing'`
4. Click "Start Free Net Sheet" → navigate to `/ad/seller-quiz`
5. Complete quiz (inherited → excellent → asap → 200-350k)
6. Enter name/email, submit
7. Verify: `selena_context_v2` contains:
   - `intent: 'cash_offer'`
   - `timeline: 'asap'`
   - `situation: 'inherited'`
   - `quiz_completed: true`
8. Verify: `selena_lead_id` is set in localStorage
9. Navigate to `/v2/sell` or `/v2/book`
10. Verify: Selena chat drawer has lead identity (can generate reports)

### Automated Test: Edge Function Security

**Test:** Attempt to access report without matching lead_id

```typescript
// Test: Should return 404 for mismatched lead_id
const response = await fetch('/functions/v1/get-report', {
  method: 'POST',
  body: JSON.stringify({
    lead_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', // Random UUID
    report_id: 'real-report-id-here',
  }),
});
expect(response.status).toBe(404);
```

---

## ARCHITECTURAL NOTES

### Language Governance Enforcement

The current architecture correctly enforces language at the session level:
- `LanguageContext` wraps entire app in `App.tsx`
- `V2Layout` passes `language` to `initSessionContext()`
- Selena Chat syncs `uiLanguage` from global `language`
- AI responses respect `context.language` parameter

**Ad Funnel Gap:** Currently hardcoded to English. For Phase 2+, consider:
1. Adding `LanguageToggle` to `SellerFunnelLayout`
2. Passing language to ad funnel session init
3. Making quiz steps bilingual

### Decision Room Flow Preserved

The implementation preserves the psychological progression:

```text
AD FUNNEL                           V2 ECOSYSTEM
+----------+                        +----------+
| Landing  |---(session init)------>| Lobby    |
+----------+                        +----------+
     |                                   |
+----------+                        +----------+
| Quiz     |---(intent capture)---->| Buy/Sell |
+----------+                        +----------+
     |                                   |
+----------+                        +----------+
| Result   |---(lead_id bridge)---->| Reports  |
+----------+                        +----------+
                                         |
                                    +----------+
                                    | Book     |
                                    +----------+
```

---

## SUCCESS CRITERIA

After implementation:

1. **V2Buy/V2Sell** automatically set `intent` when visited
2. **V2PrivateCashReview** sets `has_viewed_report: true` on view
3. **V2Book** sets `has_booked: true` and logs `consultation_booked` on submit
4. **Ad funnel visitors** have session context initialized with UTMs
5. **Quiz completers** have intent/timeline/situation bridged to V2
6. **Lead IDs** persist from ad funnel to V2 for report continuity
7. **get-report** edge function verified secure (dual-key lookup)

