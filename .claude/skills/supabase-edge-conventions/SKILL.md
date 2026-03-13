---
name: supabase-edge-conventions
description: Conventions, patterns, and security requirements for all Supabase edge functions in this project. Use this when creating a new edge function, modifying an existing one, debugging a function, or reviewing function security.
---

# Supabase Edge Function Conventions

## Runtime
All edge functions use **Deno** (not Node.js). Import paths use Deno-style URLs. Do not use `require()` or CommonJS syntax.

## Shared Modules (`supabase/functions/_shared/`)
```
cors.ts       # corsHeaders object — import into every function
rateLimit.ts  # checkRateLimit, extractRateLimitKey, rateLimitResponse
```

Always import from `_shared/` rather than re-implementing these utilities.

## CORS Handling (Required on Every Function)
```typescript
// Always handle OPTIONS preflight
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}

// Always include corsHeaders in all responses
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
})
```

## Security — Cost-Bearing Functions Require Admin Auth
Protected with `x-admin-secret` header auth:
- `scrape-market-pulse` ✅ (Firecrawl — external API cost)
- `generate-guide-image` ✅ (Lovable AI Gateway — external API cost)
- `generate-all-guide-images` ✅ (batch — highest cost risk)
- `generate-neighborhood-heroes` ⚠️ NOT protected — known security gap, fix before scaling

**Required auth check pattern** (must be first thing after CORS check):
```typescript
const adminSecret = req.headers.get('x-admin-secret')
if (adminSecret !== Deno.env.get('ADMIN_SECRET')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
```

Any NEW cost-bearing function must implement this pattern.

## Environment Variables — Correct Names (Critical)
```typescript
// AI Gateway — the env var is LOVABLE_API_KEY (not GEMINI_API_KEY)
const apiKey = Deno.env.get('LOVABLE_API_KEY')

// GoHighLevel — webhook URL (not an API key)
const ghlUrl = Deno.env.get('GHL_WEBHOOK_URL')

// All others
Deno.env.get('FIRECRAWL_API_KEY')       // scrape-market-pulse
Deno.env.get('PERPLEXITY_API_KEY')      // neighborhood-profile
Deno.env.get('GOOGLE_PLACES_API_KEY')   // fetch-google-reviews
Deno.env.get('YOUTUBE_API_KEY')         // youtube-videos
Deno.env.get('ADMIN_SECRET')            // cost-bearing function guard
Deno.env.get('SUPABASE_URL')            // all functions
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // all functions
```

## Environment Variables (Deno.env.get)
```typescript
// Correct — Deno pattern
const apiKey = Deno.env.get('GEMINI_API_KEY')

// Wrong — do not use process.env
const apiKey = process.env.GEMINI_API_KEY // ❌
```

Available secrets:
- `GEMINI_API_KEY` — Google Gemini (primary AI model)
- `OPENAI_API_KEY` — OpenAI (fallback AI model)
- `GHL_API_KEY` — GoHighLevel CRM
- `GHL_LOCATION_ID` — GHL location identifier (set as secret, verify usage before assuming it works)
- `ELEVENLABS_API_KEY` — ElevenLabs voice
- `FIRECRAWL_API_KEY` — Firecrawl scraping
- `PERPLEXITY_API_KEY` — Perplexity neighborhood profiles
- `ADMIN_SECRET` — Internal admin auth for cost-bearing functions
- `GOOGLE_PLACES_API_KEY` — Google Places reviews

## Supabase Client Initialization
```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)
```

Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for server-side operations that need to bypass RLS.

## Error Handling Pattern
```typescript
try {
  // ... function logic
} catch (error) {
  console.error('Function name error:', error)
  return new Response(
    JSON.stringify({ error: error.message }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
```

## fire-and-forget Pattern (notify-handoff)
`notify-handoff` does NOT await confirmation from GHL — it fires the webhook and returns immediately. This is intentional. Do not add retry logic or error blocking to this function.

## Known TODOs
- `check-availability` returns hardcoded stub time slots. A TODO comment marks the real calendar integration point. Do not remove the TODO — it's a tracked work item.
- `GHL_LOCATION_ID` is set as a secret but its usage in edge function code has not been fully verified. Check before assuming it's wired correctly.

## Function Naming Convention
- Kebab-case: `selena-chat`, `upsert-lead-profile`, `notify-handoff`
- Descriptive verb-noun pattern preferred

## Adding a New Edge Function
1. Create directory: `supabase/functions/your-function-name/`
2. Create `index.ts` with CORS handling as first block
3. Add admin auth check if function makes external API calls
4. Register in Supabase dashboard (functions auto-deploy via Lovable on push)
5. Add secret references via Deno.env.get — never hardcode keys
6. Document the function in `.lovable/memory/architecture/` if it's architecturally significant
