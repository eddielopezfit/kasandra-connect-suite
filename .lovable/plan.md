# Selena Digital Concierge Communication Audit
## Complete Documentation of Patterns, Misalignments & Recommendations

**Status: ✅ REMEDIATION COMPLETE (v2 - Safe Gate)**
*Implemented: 2026-02-06*

---

## 1. Executive Summary

This audit documented Selena's communication patterns, CTA exposure, and escalation behavior against the **"Digital Concierge / Earned Access"** philosophy.

### Core Finding (RESOLVED)
~~Selena's voice and persona are correctly calibrated, but her structural behavior creates a "High-Pressure Sales Bot" experience that conflicts with the "Calm Concierge" design intent.~~

**Post-Remediation:** Selena now follows the "Earned Access" model with conditional CTAs, deferred qualification, and consistent authority language.

---

## 2. Remediation Summary (v2 - Corrected)

### ✅ Phase 1: Conditional Booking CTA - FIXED

**Safe Gate Criteria:**
| Trigger | Implementation |
|---------|----------------|
| User explicitly asks to book | `userAskedToBook(message)` regex |
| Tool completed | `context.tool_used`, `context.last_tool_result`, `context.quiz_completed` |
| 2+ user turns | `userTurnCount(history) >= 2` |

**Key Corrections:**
- ❌ Removed invented fields: `has_used_tool`, `message_count`, `cognitive_stage`
- ❌ Removed naive `history.length >= 3` (was counting both roles)
- ✅ Now counts USER turns only via `userTurnCount()`

### ✅ Phase 2: Defer Address Collection - FIXED

- Removed `isFirstSellDeclaration` logic from system prompt
- Selena educates before qualifying (no premature address request)

### ✅ Phase 3: SelenaHandoff Skip Option - APPROVED

- Added "I'll share later / Lo comparto después" escape path
- Users can skip qualification questions

### ✅ Phase 4: Language Normalization - FIXED

**Canonical Intent Values:**
| Raw Detection | Normalized |
|---------------|------------|
| `cash_offer` | `cash` |
| `exploring` | `explore` |
| `ready` | (removed - timeline, not intent) |

**Canonical Timeline Values:**
| Raw Detection | Normalized |
|---------------|------------|
| `60_90_days` | `60_90` |

**CTA Language:**
| Before | After |
|--------|-------|
| "Free Consultation" | "Review Strategy with Kasandra" |
| "consulta gratuita" | "Revisar Estrategia con Kasandra" |

---

## 3. Technical Implementation

### Edge Function (`selena-chat/index.ts`)

**New Helper Functions:**
```typescript
function userAskedToBook(message: string): boolean {
  return /(book|schedule|call|talk|meet|appointment|consulta|cita|llamar|hablar|agendar)/i.test(message);
}

function userTurnCount(history: Array<{ role: string }>): number {
  return history.filter(m => m.role === 'user').length;
}

function hasEarnedBookingAccess(context, history, message): boolean {
  if (userAskedToBook(message)) return true;
  if (context.tool_used || context.last_tool_result || context.quiz_completed) return true;
  if (userTurnCount(history) >= 2) return true;
  return false;
}

function filterSuggestionsForEarnedAccess(suggestions, hasEarned): string[] {
  if (hasEarned) return suggestions;
  return suggestions.filter(s => !BOOKING_KEYWORDS.test(s));
}
```

**Intent Normalization:**
```typescript
function normalizeIntent(raw: string): string {
  switch (raw) {
    case 'cash_offer': return 'cash';
    case 'exploring': return 'explore';
    case 'ready': return null; // Timeline, not intent
    default: return raw;
  }
}
```

**Write-Once Guard:**
- Background update of `lead_profiles` intent/timeline REMOVED
- Only `upsertLeadProfile()` can write, with null-check guards

### Frontend Components

| File | Change |
|------|--------|
| `SelenaChatContext.tsx` | Fallback error no longer pushes booking |
| `CalculatorResults.tsx` | "free consultation" → "review your strategy" |
| `CalculatorNextSteps.tsx` | "Book a Free Consultation" → "Review Strategy" |
| `SelenaHandoff.tsx` | Added skip option: "I'll share later" |
| `IntentHeader.tsx` | "free, no-obligation" → "personalized strategy session" |
| `V2CashOfferOptions.tsx` | "Free Cash Offer Review" → "Complimentary" |
| `V2GuideDetail.tsx` | Standardized Spanish translations |

---

## 4. Behavioral Model Post-Remediation

### Earned Access Commitment Ladder

| Step | Micro-Commitment | CTA Shown? |
|------|------------------|------------|
| 1 | Open Selena chat | ❌ No CTA |
| 2 | Declare intent (Buy/Sell/Explore) | ❌ No CTA |
| 3 | Second message (2 user turns) | ✅ CTA appears |
| 4 | OR: Use calculator/quiz | ✅ CTA appears |
| 5 | OR: Explicitly ask to book | ✅ CTA appears |

### Suggestion Filtering

When booking is NOT earned:
- Suggestions containing `book|schedule|call|talk|meet|appointment|consulta|cita|llamar|hablar` are STRIPPED

---

## 5. Verification Checklist

- [x] Edge function uses canonical intent values only
- [x] No invented context fields
- [x] User turn count (not total messages)
- [x] Write-once guard on lead_profiles
- [x] Suggestion filtering for early-stage users
- [x] API response includes `ok: boolean` per standard
- [x] SelenaHandoff has skip option
- [x] Spanish uses formal "Usted" consistently

---

## 6. Response Contract

```typescript
{
  ok: boolean;           // API response standard
  reply: string;
  suggestedReplies: string[];
  actions: Array<{ label: string; href: string; eventType: string }>;
  language: 'en' | 'es';
  lead_id?: string;
  detected_intent?: 'buy' | 'sell' | 'cash' | 'dual' | null;  // Canonical only
  booking_cta_shown: boolean;
}
```

---

*Audit completed. Selena now behaves as a Digital Concierge with safe engagement gates.*
