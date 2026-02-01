# GHL Handshake Standard Operating Procedure (SOP)

> **Source of Truth** for GoHighLevel Integration  
> Last Updated: 2026-02-01  
> System: Selena Digital Concierge OS

---

## 1. Database Contract (lead_profiles)

| Column | Type | Purpose |
|--------|------|---------|
| `ghl_contact_id` | TEXT | Links to GHL Contact record |
| `ghl_opportunity_id` | TEXT | Links to GHL Pipeline/Opportunity record |
| `ghl_synced_at` | TIMESTAMP | Last successful sync timestamp |

---

## 2. Pipeline Stages

The `pipeline_stage` custom field maps to these GHL Pipeline stages:

| Canonical Intent | Pipeline Stage Name |
|------------------|---------------------|
| `sell` | `Seller Lead` |
| `cash` | `Cash Offer Lead` |
| `buy` | `Buyer Lead` |
| `explore` / `null` | `Exploring` |

**Edge Function Logic:**
```typescript
const getPipelineStage = (intent: string | null): string => {
  switch (intent) {
    case 'sell': return 'Seller Lead';
    case 'cash': return 'Cash Offer Lead';
    case 'buy': return 'Buyer Lead';
    default: return 'Exploring';
  }
};
```

---

## 3. GHL Custom Field Keys

### 3.1 Core Identity Fields (Top-Level)

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `email` | `email` | Contact email (primary identifier) |
| `name` | `name` | Full name |
| `firstName` | `firstName` | Parsed first name |
| `lastName` | `lastName` | Parsed last name |
| `phone` | `phone` | Phone number |
| `tags` | `tags` | Array of semantic tags |
| `lead_id` | `lead_id` | Supabase lead_profiles.id |
| `language` | `language` | `"en"` or `"es"` — **WF-03 Routing Signal** |

### 3.2 Intent & Timeline (Dual Format)

| Webhook Key | GHL Custom Field | Values |
|-------------|------------------|--------|
| `intent_canonical` | `intent_canonical` | `buy`, `sell`, `cash`, `explore`, `null` |
| `intent_raw` | `intent_raw` | Original form value (e.g., `"seller"`, `"buyer"`) |
| `timeline_canonical` | `timeline_canonical` | `asap`, `30_days`, `60_90`, `exploring`, `null` |
| `timeline_raw` | `timeline_raw` | Original form value (e.g., `"1_3_months"`) |

### 3.3 Session Dossier Fields

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `session_id` | `session_id` | Lovable session UUID |
| `page_path` | `page_path` | Last page before submission |
| `source` | `source` | Always `"lovable_native_form"` |

### 3.4 Property Context

| Webhook Key | GHL Custom Field | Allowed Values |
|-------------|------------------|----------------|
| `situation` | `situation` | `inherited`, `relocating`, `downsizing`, `divorce`, `tired_landlord`, `upgrading`, `other` |
| `condition` | `condition` | `move_in_ready`, `minor_repairs`, `distressed`, `unknown` |
| `price_range` | `price_range` | Free text (e.g., `"$300k-$400k"`) |

### 3.5 Tool Usage (Calculator/Assessment)

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `tool_used` | `tool_used` | `"cash_offer_calculator"`, `"readiness_check"`, etc. |
| `last_tool_result` | `last_tool_result` | JSON string of tool output |
| `readiness_score` | `readiness_score` | 0-100 buyer readiness score |
| `primary_priority` | `primary_priority` | Top priority from readiness assessment |

### 3.6 Journey Tracking

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `quiz_completed` | `quiz_completed` | Boolean — did they complete path quiz |
| `quiz_result_path` | `quiz_result_path` | Quiz-determined path (e.g., `"/v2/sell"`) |
| `has_viewed_report` | `has_viewed_report` | Boolean — viewed AI report |
| `last_report_id` | `last_report_id` | UUID of last viewed report |
| `has_booked` | `has_booked` | Boolean — booking completed |

### 3.7 Attribution (UTM & Referrer)

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `session_source` | `session_source` | First-touch source |
| `utm_source` | `utm_source` | UTM source parameter |
| `utm_campaign` | `utm_campaign` | UTM campaign parameter |
| `utm_medium` | `utm_medium` | UTM medium parameter |
| `utm_content` | `utm_content` | UTM content parameter |
| `referrer` | `referrer` | HTTP referrer URL |

### 3.8 Ad Funnel Bridge

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `ad_funnel_source` | `ad_funnel_source` | Ad funnel identifier |
| `ad_funnel_value_range` | `ad_funnel_value_range` | Value range from ad quiz |

### 3.9 Guide Context

| Webhook Key | GHL Custom Field | Description |
|-------------|------------------|-------------|
| `guide_id` | `guide_id` | Guide slug if submitted from guide |
| `guide_title` | `guide_title` | Guide title for context |

### 3.10 Semantic Intent Flags (Workflow Routing)

| Webhook Key | GHL Custom Field | Type | Description |
|-------------|------------------|------|-------------|
| `intent_seller` | `intent_seller` | Boolean | `true` if intent is `sell` or `cash` |
| `intent_buyer` | `intent_buyer` | Boolean | `true` if intent is `buy` |
| `intent_cash` | `intent_cash` | Boolean | `true` if intent is `cash` |
| `pipeline_stage` | `pipeline_stage` | String | GHL Pipeline stage name |
| `last_declared_goal` | `last_declared_goal` | String | Human-readable goal label |

---

## 4. Semantic Tags

Tags are automatically generated and sent as an array:

### 4.1 Source Tags
- `Consultation Intake`
- `consultation_intake`
- `source_lovable_native_form`

### 4.2 Language Tags
- `english_speaker` — when `language === "en"`
- `spanish_speaker` — when `language === "es"`

### 4.3 Intent Tags
- `intent_sell`
- `intent_buy`
- `intent_cash`
- `intent_explore`

### 4.4 Situation Tags
| Situation Value | Tags Applied |
|-----------------|--------------|
| `inherited` | `Legacy Property Seller`, `situation_inherited` |
| `relocating` | `Relocation Seller`, `situation_relocating` |
| `downsizing` | `Downsizing Seller`, `situation_downsizing` |
| `divorce` | `Divorce Situation`, `situation_divorce` |
| `tired_landlord` | `Tired Landlord`, `situation_tired_landlord` |
| `upgrading` | `Upgrader`, `situation_upgrading` |
| `other` | `situation_other` |

### 4.5 Condition Tags
- `condition_move_in_ready`
- `condition_minor_repairs`
- `condition_distressed`
- `condition_unknown`

### 4.6 Timeline Tags
| Timeline Value | Tag Applied |
|----------------|-------------|
| `immediately`, `asap` | `timeline_urgent` |
| `30_days` | `timeline_30_days` |
| `1_3_months`, `60_90` | `timeline_60_90` |
| `3_6_months`, `6_plus_months` | `timeline_flexible` |
| `researching`, `exploring` | `timeline_exploring` |

### 4.7 Journey Tags
- `quiz_completed` — if quiz was completed
- `viewed_report` — if AI report was viewed

---

## 5. Normalization Contract

All values are normalized before database write AND webhook send:

### 5.1 Intent Normalization

| Raw Input | Canonical (DB) |
|-----------|----------------|
| `buyer`, `buy` | `buy` |
| `seller`, `sell` | `sell` |
| `cash_offer`, `cash` | `cash` |
| `exploring`, `explore` | `explore` |
| anything else | `null` |

### 5.2 Timeline Normalization

| Raw Input | Canonical (DB) |
|-----------|----------------|
| `immediately`, `asap` | `asap` |
| `30_days` | `30_days` |
| `1_3_months`, `60_90` | `60_90` |
| `3_6_months`, `6_plus_months`, `researching`, `exploring` | `exploring` |
| anything else | `null` |

---

## 6. Webhook Payload Structure

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-520-555-0123",
  "tags": ["Consultation Intake", "english_speaker", "intent_sell", "timeline_urgent"],
  "intent_canonical": "sell",
  "intent_raw": "seller",
  "timeline_canonical": "asap",
  "timeline_raw": "immediately",
  "source": "lovable_native_form",
  "lead_id": "uuid-here",
  "language": "en",
  "page_path": "/v2/book",
  "session_id": "session-uuid",
  "customField": {
    "lead_id": "uuid-here",
    "language": "en",
    "intent_canonical": "sell",
    "intent_raw": "seller",
    "timeline_canonical": "asap",
    "timeline_raw": "immediately",
    "situation": "inherited",
    "condition": "minor_repairs",
    "tool_used": "cash_offer_calculator",
    "readiness_score": 85,
    "pipeline_stage": "Seller Lead",
    "intent_seller": true,
    "intent_buyer": false,
    "intent_cash": false
  }
}
```

---

## 7. GHL Workflow Routing Rules

### WF-01: Pipeline Assignment
- Route to pipeline based on `pipeline_stage` value
- Create opportunity in corresponding pipeline

### WF-02: Tag-Based Automation
- Trigger sequences based on semantic tags
- Apply automation rules per situation/condition

### WF-03: Language Routing (CRITICAL)
- **Primary Signal:** Top-level `language` field
- `"es"` → Spanish workflow sequences
- `"en"` → English workflow sequences
- **NEVER** default Spanish leads to English workflows

---

## 8. Failure Handling

### Sync Failure Logging
On GHL webhook failure, log to `event_log`:
```json
{
  "event_type": "ghl_sync_failed",
  "session_id": "lead_id",
  "event_payload": {
    "lead_id": "uuid",
    "email": "user@example.com",
    "error": "HTTP 500",
    "funnel": "consultation_intake",
    "page_path": "/v2/book"
  }
}
```

### Recovery Process
1. Query `event_log` for `ghl_sync_failed` events
2. Retry webhook with stored payload
3. Update `ghl_synced_at` on success

---

## 9. Environment Variables Required

| Secret Name | Purpose |
|-------------|---------|
| `GHL_WEBHOOK_URL` | Webhook endpoint for lead capture |
| `GHL_API_KEY` | API key for direct mutations (future) |

---

## 10. Validation Checklist

Before deploying GHL integration changes:

- [ ] All custom fields exist in GHL
- [ ] Pipeline stages match exactly (case-sensitive)
- [ ] Language routing tested with Spanish submission
- [ ] Tags render correctly in GHL contact
- [ ] Webhook URL is configured in secrets
- [ ] Failure logging verified in `event_log`

---

*This document is the source of truth for Selena ↔ GHL integration.*
