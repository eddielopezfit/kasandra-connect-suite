

# Consultation Intake Form + Webhook Language Data Contract Audit

## Audit Summary

After a comprehensive code review, I have traced the language data flow from the Lovable Native Form through to the GoHighLevel webhook payload.

---

## STEP 1: Lovable Form Field Audit

### Findings - CORRECT

**File:** `src/components/v2/ConsultationIntakeForm.tsx`

**Form Schema (Lines 43-45):**
```typescript
preferredLanguage: z.enum(["en", "es"], {
  required_error: t("Please select a language", "Por favor seleccione un idioma"),
}),
```

**Language Options (Lines 201-204):**
```typescript
const languageOptions = [
  { value: "en", labelEn: "English", labelEs: "Inglés" },
  { value: "es", labelEn: "Español", labelEs: "Español" },
];
```

**Verdict:** The form field is correctly configured:
- Internal key: `preferredLanguage`
- Spanish option value: `"es"` (canonical)
- English option value: `"en"` (canonical)
- Display labels are localized but values are canonical codes

---

## STEP 2: Webhook Payload Structure Audit

### Findings - CORRECT

**File:** `supabase/functions/submit-consultation-intake/index.ts`

**Form Submission (Lines 228-244):**
```typescript
const { data: response, error } = await supabase.functions.invoke("submit-consultation-intake", {
  body: {
    // ...
    language: data.preferredLanguage,  // ← Sends "es" or "en"
    // ...
  },
});
```

**Webhook Payload (Lines 302-369):**
```typescript
const ghlPayload = {
  // Top-level (easy GHL mapping)
  language: input.language,  // ← "es" or "en"
  tags: allTags,             // ← Contains language tag
  
  // Custom fields (detailed)
  customField: {
    language: input.language,  // ← "es" or "en" (DUPLICATED)
    // ...
  },
};
```

**Language appears in 3 places:**

| Location | Field | Expected Value |
|----------|-------|----------------|
| `payload.language` (top-level) | `language` | `"es"` or `"en"` |
| `payload.customField.language` | `language` | `"es"` or `"en"` |
| `payload.tags[]` | Array item | `"spanish_speaker"` or `"english_speaker"` |

**Verdict:** The language value is correctly sent as `"es"` (not `"Español"` or localized text).

---

## STEP 3: Source of Truth Declaration

### CURRENT STATE

The webhook sends language in **3 places**:

1. `payload.language` (top-level) = `"es"` or `"en"`
2. `payload.customField.language` = `"es"` or `"en"`
3. `payload.tags[]` = `"spanish_speaker"` or `"english_speaker"`

### DECLARATION

**`payload.language` (top-level) is the authoritative source of truth.**

The GHL workflow WF-03 MUST evaluate:

```
IF payload.language == "es"
  → Spanish path
ELSE
  → English path
```

**Tags MUST NOT be used to determine language routing.**  
Tags are derivative and should only be applied AFTER language routing is resolved.

---

## STEP 4: Potential Overwrite Analysis

### Form Default Value (Line 144)

```typescript
const form = useForm<FormData>({
  defaultValues: {
    preferredLanguage: language as "en" | "es",  // ← From LanguageContext
    // ...
  },
});
```

This sets the default based on the global LanguageContext (the site's current language toggle).

### Pre-Population Logic (Lines 156-167)

```typescript
useEffect(() => {
  if (prePopData.hasPrePopulatedData) {
    if (prePopData.preferredLanguage) form.setValue('preferredLanguage', prePopData.preferredLanguage);
    // ...
  }
}, [prePopData, form]);
```

**Trace to session context (useSessionPrePopulation.ts, Line 88):**
```typescript
data.preferredLanguage = session.language;
```

**Trace to session initialization (selenaSession.ts, Line 101-133):**
```typescript
export function initSessionContext(language: 'en' | 'es' = 'en'): SessionContext {
  // ...
  const context: SessionContext = {
    language,  // ← From parameter
    // ...
  };
  // ...
}
```

### FINDING - POTENTIAL OVERWRITE SCENARIO

If a user:
1. Visits the site in English (`language: 'en'` in session)
2. Toggles to Spanish via the language toggle
3. Navigates to `/v2/book`

**The form may pre-populate with `"en"` from the stale session context instead of `"es"` from the current LanguageContext.**

However, the form's defaultValue (Line 144) uses the current LanguageContext, and the pre-population useEffect runs after — meaning it could overwrite the correct value with a stale one.

### RECOMMENDED FIX

In `useSessionPrePopulation.ts`, the language pre-population should respect the current LanguageContext, not the session's stored language:

```diff
// Pre-populate from session context
if (session) {
-  data.preferredLanguage = session.language;
+  // DO NOT pre-populate language from session
+  // Let the form use the current LanguageContext as default
+  // data.preferredLanguage = session.language;
```

**Rationale:** The user's current language toggle choice should take precedence over a potentially stale session language.

---

## STEP 5: GHL Workflow Condition Alignment

### REQUIRED CONDITION LOGIC

The GHL workflow WF-03 must evaluate language using the webhook payload's top-level `language` field:

```
IF {{trigger.language}} == "es"
  → Run Spanish branch
ELSE
  → Run English branch
```

### FORBIDDEN PATTERNS

- Checking `{{contact.tags}}` contains "spanish"
- Checking `{{trigger.customField.language}}` (redundant, use top-level)
- Checking localized display labels like "Español"

### VERIFICATION NEEDED (GHL SIDE)

In GHL Workflow WF-03, confirm:

1. The condition step uses `{{trigger.language}}` (not a contact field or tag)
2. The comparison is exactly: `== "es"`
3. No prior workflow step sets a `selena_language_raw` contact field before the condition runs
4. The language tag (`spanish_speaker`) is applied AFTER the routing decision

---

## STEP 6: Field Mapping Verification

### Webhook to GHL Field Mapping

| Webhook Field | GHL Custom Field | Expected |
|---------------|------------------|----------|
| `payload.language` | Should map to `language` in trigger | `"es"` or `"en"` |
| `payload.customField.language` | Should map to `selena_language` (if used) | `"es"` or `"en"` |

### NO TRANSFORMATION ALLOWED

The language value must be passed through without transformation:
- No defaulting to English if empty
- No mapping `"es"` to `"spanish"` or other variants
- No conditional fallback logic

---

## STEP 7: Validation Test Plan

### Test Matrix

| Test | Form Selection | Expected `payload.language` | Expected GHL Branch | Expected Tags |
|------|----------------|----------------------------|---------------------|---------------|
| 1 | Spanish (Español) | `"es"` | Spanish path | `spanish_speaker` |
| 2 | English | `"en"` | English path | `english_speaker` |
| 3 | Spanish + Repeat | `"es"` | Spanish (same lead) | `spanish_speaker` |

### Test 1: Spanish Form Submission

**Steps:**
1. Clear localStorage (fresh session)
2. Toggle site to Spanish
3. Navigate to `/v2/book`
4. Fill form with Spanish selected in "Idioma Preferido"
5. Submit

**Expected Webhook Payload:**
```json
{
  "language": "es",
  "tags": ["Consultation Intake", "consultation_intake", "spanish_speaker", ...],
  "customField": {
    "language": "es",
    ...
  }
}
```

**Expected GHL Outcome:**
- Workflow condition `{{trigger.language}} == "es"` → TRUE
- Spanish branch executes
- Contact tagged with `spanish_speaker`

### Test 2: English Form Submission

**Steps:**
1. Clear localStorage
2. Toggle site to English
3. Navigate to `/v2/book`
4. Fill form with English selected
5. Submit

**Expected Webhook Payload:**
```json
{
  "language": "en",
  "tags": ["Consultation Intake", "consultation_intake", "english_speaker", ...],
  "customField": {
    "language": "en",
    ...
  }
}
```

**Expected GHL Outcome:**
- Workflow condition `{{trigger.language}} == "es"` → FALSE
- English branch executes
- Contact tagged with `english_speaker`

### Test 3: Repeat Submission (Same Email)

**Steps:**
1. Use Test 1 email
2. Submit again with Spanish selected
3. Verify upsert preserves language

**Expected:**
- Lead updated (not duplicated)
- Language remains `"es"`
- Tags merged, not replaced

---

## Final Diagnosis

### Lovable Form: CORRECTLY BUILT

The Consultation Intake Form sends canonical language values (`"es"` / `"en"`) correctly.

### Edge Function Webhook: CORRECTLY BUILT

The `submit-consultation-intake` edge function sends `language` at both top-level and in `customField` with correct values.

### Likely Root Cause: GHL Workflow Condition

The issue is most likely in the GHL workflow WF-03:

1. **The condition may be checking the wrong field** (e.g., a contact field instead of `{{trigger.language}}`)
2. **A prior step may be setting `selena_language_raw`** before the condition runs
3. **The condition may be using wrong comparison** (e.g., checking for `"spanish"` instead of `"es"`)

---

## Required Changes

### Code Changes: 1 Optional Fix

**File:** `src/hooks/useSessionPrePopulation.ts`

**Change:** Remove language pre-population from session to prevent stale overwrites

```diff
// Line 87-88
if (session) {
-  data.preferredLanguage = session.language;
+  // Language is NOT pre-populated from session
+  // Form uses current LanguageContext as default
```

**Impact:** Prevents edge case where stale session language overwrites current toggle choice.

### GHL Workflow Changes: Required

**Workflow:** WF-03 — Selena | Intake — Website/Webhook v2

1. **Verify condition uses:** `{{trigger.language}} == "es"`
2. **Remove any prior step** that sets language-related contact fields before the condition
3. **Ensure language tags are applied AFTER** the routing decision, not before

---

## Declaration

Once the GHL workflow condition is verified to use `{{trigger.language}} == "es"`:

**"Spanish submissions will no longer resolve as English."**

The Lovable Native Form and webhook are correctly built. The resolution depends on aligning the GHL workflow condition to use the canonical `"es"` value from `payload.language`.

