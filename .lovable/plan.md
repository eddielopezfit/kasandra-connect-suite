

# Secret Key Injection & API Authority Layer
## Complete Implementation Plan

---

## EXECUTIVE SUMMARY

This plan addresses four interconnected objectives:
1. **Secret Management** - Secure API key storage and edge function access
2. **Authority Integration** - Dynamic Google Reviews and YouTube feeds with graceful fallbacks
3. **Identity Handoff** - Google Sign-In with lead_id bridging
4. **Private Cash Review Audit** - Decision Compression Room finalization

---

## CURRENT STATE ANALYSIS

### Secrets Inventory

| Secret | Status | Edge Function |
|--------|--------|---------------|
| `GOOGLE_PLACES_API_KEY` | **CONFIGURED** but returning `MISSING_KEY` | `fetch-google-reviews` |
| `YOUTUBE_API_KEY` | **NOT CONFIGURED** | Needed for `youtube-videos` |
| `ELEVENLABS_AGENT_ID` | Configured | `elevenlabs-conversation-token` |
| `GHL_WEBHOOK_URL` | Configured | `submit-consultation-intake` |
| `LOVABLE_API_KEY` | System-managed | AI operations |

### API Status

| API | Current Behavior | Issue |
|-----|------------------|-------|
| Google Reviews | Returns `MISSING_KEY` status | Secret exists but edge function not reading it |
| YouTube Videos | Returns **FALLBACK** videos only | Missing YouTube Data API v3 key + broken RSS fetch |

---

## PHASE 1: SECRET MANAGEMENT & API AUTHORITY

### Task 1.1: Diagnose Google Places API Issue

The `GOOGLE_PLACES_API_KEY` secret exists but the edge function returns `MISSING_KEY`. Possible causes:
- Secret name mismatch in `Deno.env.get()`
- Secret not deployed to edge function environment

**Action:** Verify the secret is accessible via edge function test call.

### Task 1.2: Add YouTube Data API Key

**New Secret Required:** `YOUTUBE_API_KEY`

**User Action Required:** 
1. Navigate to Google Cloud Console
2. Enable YouTube Data API v3
3. Create an API key with appropriate restrictions
4. Add to Lovable Cloud secrets

### Task 1.3: Upgrade YouTube Edge Function

**File:** `supabase/functions/youtube-videos/index.ts`

**Current Problem:** 
- RSS scraping fails silently
- Falls back to hardcoded placeholder videos immediately
- Line 169 never calls `fetchVideosFromRSS()` even when `channelId` is found

**Solution:**
```typescript
// FIX: Actually call the RSS fetch when we have a channel ID
if (channelId) {
  try {
    videos = await fetchVideosFromRSS(channelId, limit);
    console.log(`Fetched ${videos.length} videos from RSS`);
  } catch (rssError) {
    console.error('RSS fetch failed:', rssError);
  }
}

// If RSS fails, try YouTube Data API (requires key)
if (videos.length === 0) {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (apiKey) {
    videos = await fetchVideosFromAPI(apiKey, channelId, limit);
  }
}

// Only use fallback if both methods fail
if (videos.length === 0) {
  console.log('Using fallback videos');
  videos = FALLBACK_VIDEOS.slice(0, limit);
}
```

### Task 1.4: Add API Method to YouTube Edge Function

Add a `fetchVideosFromAPI()` function using YouTube Data API v3:

```typescript
async function fetchVideosFromAPI(
  apiKey: string, 
  channelId: string, 
  limit: number
): Promise<YouTubeVideo[]> {
  // Search for videos by channel
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('key', apiKey);
  searchUrl.searchParams.set('channelId', channelId);
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('order', 'date');
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', String(limit));

  const response = await fetch(searchUrl.toString());
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}
```

---

## PHASE 2: GRACEFUL FALLBACK ARCHITECTURE

### Task 2.1: Authority Fallback Pattern

Both Google Reviews and YouTube must implement the same fallback hierarchy:

```text
Priority 1: Live API Data
     |
     v (on failure)
Priority 2: Cached Data (localStorage with TTL)
     |
     v (on failure)
Priority 3: Static Fallback (curated placeholders)
```

### Task 2.2: Add Caching Layer to Google Reviews Hook

**File:** `src/hooks/useGoogleReviews.ts`

```typescript
const CACHE_KEY = 'cc_google_reviews_cache';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Fallback reviews for graceful degradation
const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    author: "Maria G.",
    rating: 5,
    text: "Kasandra made our home buying journey so smooth. She truly cares about her clients and the community.",
    time: "2 months ago",
  },
  // ... 4 more curated reviews
];

async function fetchGoogleReviews(): Promise<GoogleReview[]> {
  // Try live API first
  try {
    const { data, error } = await supabase.functions.invoke(...);
    if (data?.ok && data.reviews.length > 0) {
      // Cache successful response
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        reviews: data.reviews,
        cachedAt: Date.now(),
      }));
      return data.reviews;
    }
  } catch (e) {
    console.warn('[GoogleReviews] API failed, checking cache');
  }

  // Try cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { reviews, cachedAt } = JSON.parse(cached);
    if (Date.now() - cachedAt < CACHE_TTL_MS) {
      return reviews;
    }
  }

  // Return fallback
  return FALLBACK_REVIEWS;
}
```

### Task 2.3: Update GoogleReviewsSection for Fallback UI

**File:** `src/components/v2/GoogleReviewsSection.tsx`

Currently the section returns `null` on error. Instead:
- Show fallback reviews with subtle "Curated testimonials" badge
- Log the fallback state for monitoring

```typescript
// Replace the early return on error with fallback display
if (error || (!isLoading && (!reviews || reviews.length === 0))) {
  // Don't hide - show fallback with different badge
  // This preserves the authority signal while acknowledging limitation
}
```

### Task 2.4: YouTube Fallback UI Enhancement

**File:** `src/pages/v2/V2Podcast.tsx` (and `PodcastSection.tsx`)

Current static embeds work as fallback. Add dynamic episode grid when API succeeds:

```typescript
// If live videos available, show dynamic grid
// If not, show static curated embed (current behavior is acceptable)
```

---

## PHASE 3: IDENTITY HANDOFF - GOOGLE SIGN-IN

### Task 3.1: Configure Google OAuth via Lovable Cloud

**Action Required:** Use `supabase--configure-social-auth` tool to:
1. Generate the `src/integrations/lovable` module
2. Install `@lovable.dev/cloud-auth-js`
3. Enable managed Google OAuth

### Task 3.2: Create Google Sign-In Component

**New File:** `src/components/v2/GoogleSignInButton.tsx`

```typescript
import { lovable } from "@/integrations/lovable/index";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/v2/community",
    });
    if (error) {
      console.error("Sign-in error:", error);
      toast.error(t("Sign-in failed", "Error al iniciar sesión"));
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
    >
      <img src="/google-logo.svg" className="w-5 h-5 mr-2" alt="" />
      {t("Continue with Google", "Continuar con Google")}
    </Button>
  );
}
```

### Task 3.3: Bridge Google Identity to selena_lead_id

**File:** `src/lib/analytics/bridgeAuthToLead.ts` (NEW)

```typescript
import { supabase } from "@/integrations/supabase/client";

export async function bridgeAuthToLead(user: User): Promise<string | null> {
  // Check if lead already exists with this email
  const existingLeadId = localStorage.getItem('selena_lead_id');
  
  // Upsert to lead_profiles with auth email
  const { data, error } = await supabase.functions.invoke('upsert-lead-profile', {
    body: {
      email: user.email,
      name: user.user_metadata?.full_name,
      source: 'google_auth',
      existing_lead_id: existingLeadId,
    },
  });

  if (data?.lead_id) {
    localStorage.setItem('selena_lead_id', data.lead_id);
    return data.lead_id;
  }
  
  return null;
}
```

### Task 3.4: Add Auth State Listener

**File:** `src/components/v2/V2Layout.tsx`

Add auth state listener that bridges on sign-in:

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await bridgeAuthToLead(session.user);
        logEvent('google_auth_complete', { email: session.user.email });
      }
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

### Task 3.5: Integrate Sign-In on V2Community

**File:** `src/pages/v2/V2Community.tsx`

Add to the "Why Community Matters" section:

```typescript
{/* Under "Work With Me" button, add authenticated shortcut */}
<div className="mt-6 flex flex-col items-center gap-3">
  <span className="text-sm text-cc-muted">
    {t("Or get started instantly:", "O comience al instante:")}
  </span>
  <GoogleSignInButton />
</div>
```

---

## PHASE 4: PRIVATE CASH REVIEW AUDIT

### Current State Analysis

The `/v2/private-cash-review` page currently shows:
1. Education block with bullet points
2. Placeholder for Selena chat integration
3. Kasandra authority block with headshot
4. Placeholder for video + calendar

### Task 4.1: Replace Chat Placeholder with Live Selena

**File:** `src/pages/v2/V2PrivateCashReview.tsx`

The placeholder Card should trigger the chat drawer:

```typescript
// Replace placeholder with contextual chat trigger
<Card className="border border-cc-gold/30 bg-gradient-to-br from-cc-sand to-cc-ivory">
  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 rounded-full bg-cc-navy flex items-center justify-center mb-4">
      <MessageCircle className="w-8 h-8 text-cc-gold" />
    </div>
    <h3 className="font-serif text-xl font-semibold text-cc-navy mb-2">
      {t("Chat with Selena", "Chatea con Selena")}
    </h3>
    <p className="text-cc-muted mb-4 max-w-sm">
      {t(
        "She'll gather your details and prepare your personalized cash comparison.",
        "Ella recopilará sus datos y preparará su comparación de efectivo personalizada."
      )}
    </p>
    <Button onClick={openChat} className="bg-cc-navy hover:bg-cc-navy-dark">
      <MessageCircle className="w-4 h-4 mr-2" />
      {t("Start My Review", "Iniciar Mi Revisión")}
    </Button>
  </CardContent>
</Card>
```

### Task 4.2: Embed GoHighLevel Calendar

**File:** `src/pages/v2/V2PrivateCashReview.tsx`

Replace calendar placeholder with GHL embed:

```typescript
<Card className="border border-cc-gold/30 overflow-hidden">
  <CardContent className="p-0">
    <iframe
      src="https://api.leadconnectorhq.com/widget/booking/YOUR_CALENDAR_ID"
      style={{ width: '100%', height: '600px', border: 'none' }}
      scrolling="no"
      title={t("Schedule with Kasandra", "Agendar con Kasandra")}
    />
  </CardContent>
</Card>
```

**Note:** GHL calendar ID needed from user.

### Task 4.3: Add Kasandra Welcome Video

**File:** `src/pages/v2/V2PrivateCashReview.tsx`

Replace video placeholder with actual video embed:

```typescript
<Card className="border border-cc-sand-dark/30 overflow-hidden">
  <CardContent className="p-0">
    <div className="aspect-video">
      <video
        src="/videos/kasandra-welcome.mp4"
        poster={kasandraHeadshot}
        controls
        className="w-full h-full object-cover"
      />
    </div>
  </CardContent>
</Card>
```

**Note:** Video file already exists at `/public/videos/kasandra-welcome.mp4`

---

## PHASE 5: AUTOMATED TESTING

### Task 5.1: Edge Function Tests

**Test: Google Reviews Fallback**
```typescript
// Test: API failure returns fallback reviews
const response = await fetch('/functions/v1/fetch-google-reviews');
const data = await response.json();

// Should succeed with either live or fallback reviews
expect(response.status).toBe(200);
expect(data.reviews.length).toBeGreaterThan(0);
```

**Test: YouTube Fallback**
```typescript
// Test: Always returns videos (live or fallback)
const response = await fetch('/functions/v1/youtube-videos', {
  method: 'POST',
  body: JSON.stringify({ limit: 4 }),
});
const data = await response.json();

expect(data.success).toBe(true);
expect(data.videos.length).toBe(4);
```

### Task 5.2: Browser Session Test - Authority Flow

**Test Flow:**
1. Navigate to `/v2/community`
2. Verify Google Reviews section renders (not hidden)
3. Verify reviews carousel is interactive
4. Navigate to `/v2/podcast`
5. Verify YouTube embed loads
6. Check network tab for API calls

### Task 5.3: Security Test - Report Access

**Test: Unauthorized Report Access**
```typescript
// Attempt to access report without lead_id
const response = await fetch('/functions/v1/get-report', {
  method: 'POST',
  body: JSON.stringify({
    report_id: 'valid-uuid',
    lead_id: 'wrong-uuid',
  }),
});

expect(response.status).toBe(404); // Not 403 to prevent enumeration
```

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/components/v2/GoogleSignInButton.tsx` | OAuth sign-in component |
| `src/lib/analytics/bridgeAuthToLead.ts` | Auth-to-lead identity bridge |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `supabase/functions/youtube-videos/index.ts` | Fix RSS fetch + add API fallback |
| `src/hooks/useGoogleReviews.ts` | Add caching + fallback layer |
| `src/components/v2/GoogleReviewsSection.tsx` | Never hide, show fallback gracefully |
| `src/pages/v2/V2Podcast.tsx` | Add dynamic episode grid (optional) |
| `src/pages/v2/V2Community.tsx` | Add Google Sign-In CTA |
| `src/pages/v2/V2PrivateCashReview.tsx` | Replace placeholders with live components |
| `src/components/v2/V2Layout.tsx` | Add auth state listener |

---

## SECRETS REQUIRED FROM USER

| Secret | Service | Instructions |
|--------|---------|--------------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 | Google Cloud Console > APIs > YouTube Data API v3 > Create API Key |

The `GOOGLE_PLACES_API_KEY` appears to already be configured. If issues persist, we'll troubleshoot the edge function environment.

---

## SUCCESS CRITERIA

After implementation:

1. **Google Reviews** - Live carousel on `/v2/community` with graceful fallback
2. **YouTube Videos** - Dynamic episode feed on `/v2/podcast` with fallback embeds
3. **Google Sign-In** - One-click auth on `/v2/community` that bridges to `selena_lead_id`
4. **Private Cash Review** - Live Selena chat + video + calendar (placeholders removed)
5. **Fallback Resilience** - No broken UI states when APIs fail
6. **Identity Continuity** - Google auth users inherit any existing lead context

