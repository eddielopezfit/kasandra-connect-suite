# Scoring Health Dashboard Queries

Operational SQL queries for monitoring lead scoring health. Each query has 24h and 7d variants.

---

## 1. Leads by Bucket

### Last 24h
```sql
SELECT
  CASE
    WHEN lead_score >= 75 THEN 'hot'
    WHEN lead_score >= 45 THEN 'warm'
    ELSE 'cold'
  END AS bucket,
  COUNT(*) AS total
FROM lead_profiles
WHERE created_at >= now() - interval '24 hours'
  AND lead_score IS NOT NULL
GROUP BY bucket
ORDER BY total DESC;
```

### Last 7d
```sql
SELECT
  CASE
    WHEN lead_score >= 75 THEN 'hot'
    WHEN lead_score >= 45 THEN 'warm'
    ELSE 'cold'
  END AS bucket,
  COUNT(*) AS total
FROM lead_profiles
WHERE created_at >= now() - interval '7 days'
  AND lead_score IS NOT NULL
GROUP BY bucket
ORDER BY total DESC;
```

---

## 2. Score Coverage (Scored vs Unscored)

### Last 24h
```sql
SELECT
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE lead_score IS NOT NULL) AS scored,
  COUNT(*) FILTER (WHERE lead_score IS NULL) AS unscored,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE lead_score IS NOT NULL) / NULLIF(COUNT(*), 0),
    1
  ) AS coverage_pct
FROM lead_profiles
WHERE created_at >= now() - interval '24 hours';
```

### Last 7d
```sql
SELECT
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE lead_score IS NOT NULL) AS scored,
  COUNT(*) FILTER (WHERE lead_score IS NULL) AS unscored,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE lead_score IS NOT NULL) / NULLIF(COUNT(*), 0),
    1
  ) AS coverage_pct
FROM lead_profiles
WHERE created_at >= now() - interval '7 days';
```

---

## 3. GHL Sync Failures

### Last 24h
```sql
SELECT
  event_payload->>'funnel' AS funnel,
  COUNT(*) AS failures,
  MAX(created_at) AS last_failure
FROM event_log
WHERE event_type = 'ghl_sync_failed'
  AND created_at >= now() - interval '24 hours'
GROUP BY funnel
ORDER BY failures DESC;
```

### Last 7d
```sql
SELECT
  event_payload->>'funnel' AS funnel,
  COUNT(*) AS failures,
  MAX(created_at) AS last_failure
FROM event_log
WHERE event_type = 'ghl_sync_failed'
  AND created_at >= now() - interval '7 days'
GROUP BY funnel
ORDER BY failures DESC;
```

---

## 4. Score Distribution Histogram

### Last 24h
```sql
SELECT
  CASE
    WHEN lead_score BETWEEN 0 AND 24 THEN '0-24 (cold)'
    WHEN lead_score BETWEEN 25 AND 44 THEN '25-44 (cold-warm)'
    WHEN lead_score BETWEEN 45 AND 74 THEN '45-74 (warm)'
    WHEN lead_score >= 75 THEN '75-100 (hot)'
  END AS score_band,
  COUNT(*) AS total
FROM lead_profiles
WHERE created_at >= now() - interval '24 hours'
  AND lead_score IS NOT NULL
GROUP BY score_band
ORDER BY MIN(lead_score);
```

### Last 7d
```sql
SELECT
  CASE
    WHEN lead_score BETWEEN 0 AND 24 THEN '0-24 (cold)'
    WHEN lead_score BETWEEN 25 AND 44 THEN '25-44 (cold-warm)'
    WHEN lead_score BETWEEN 45 AND 74 THEN '45-74 (warm)'
    WHEN lead_score >= 75 THEN '75-100 (hot)'
  END AS score_band,
  COUNT(*) AS total
FROM lead_profiles
WHERE created_at >= now() - interval '7 days'
  AND lead_score IS NOT NULL
GROUP BY score_band
ORDER BY MIN(lead_score);
```

---

## 5. Recent Score Events (Debug)

```sql
SELECT
  created_at,
  session_id,
  event_payload->>'lead_id' AS lead_id,
  event_payload->>'lead_score' AS score,
  event_payload->>'lead_score_bucket' AS bucket,
  event_payload->>'score_reasons' AS reasons,
  event_payload->>'trigger' AS trigger,
  event_payload->>'tool_used' AS tool
FROM event_log
WHERE event_type = 'lead_score_computed'
ORDER BY created_at DESC
LIMIT 20;
```
