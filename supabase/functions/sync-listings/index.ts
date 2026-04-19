import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

const PROFILE_URL = 'https://www.homes.com/real-estate-agents/kasandra-prieto/s5959r7/'

/** Convert "6700 S Iberia Ave" → "6700-s-iberia-ave" for matching homes.com photo slugs */
function addressToSlug(address: string): string {
  return address
    .toLowerCase()
    .replace(/,.*$/, '')              // drop unit/suffix after comma
    .replace(/\bunit\s+\S+/gi, '')    // drop "Unit X"
    .replace(/[^\w\s-]/g, '')         // strip punctuation
    .trim()
    .replace(/\s+/g, '-')
}

interface ScrapedPhoto {
  url: string
  slug: string
  status: 'sale' | 'sold'
}

/** Parse Firecrawl markdown for image URLs + their address slug */
function parsePhotos(markdown: string): ScrapedPhoto[] {
  const photos: ScrapedPhoto[] = []
  // Pattern: ![For Sale $X • ...](https://images.homes.com/listings/.../{slug}-tucson-az-primaryphoto.jpg)
  const imgRegex = /!\[(For Sale|Sold)[^\]]*\]\((https:\/\/images\.homes\.com\/listings\/[^)]+?\/([a-z0-9-]+?)-(?:tucson|marana|sahuarita|green-valley|oro-valley)-az-primaryphoto\.jpg[^)]*)\)/gi
  let match
  while ((match = imgRegex.exec(markdown)) !== null) {
    photos.push({
      status: match[1].toLowerCase().startsWith('sold') ? 'sold' : 'sale',
      url: match[2],
      slug: match[3],
    })
  }
  return photos
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Admin secret guard — prevents unauthorized triggers (Firecrawl is paid)
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== Deno.env.get('ADMIN_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')
  if (!firecrawlKey) {
    return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 1. Scrape Kasandra's homes.com agent profile
    const fcRes = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: PROFILE_URL,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    })

    const fcData = await fcRes.json()
    if (!fcRes.ok) {
      throw new Error(`Firecrawl failed [${fcRes.status}]: ${JSON.stringify(fcData)}`)
    }

    const markdown: string = fcData?.data?.markdown ?? fcData?.markdown ?? ''
    const photos = parsePhotos(markdown)

    // 2. Load all featured listings
    const { data: listings, error: listErr } = await supabase
      .from('featured_listings')
      .select('id, address, status, photo_urls')

    if (listErr) throw listErr

    // 3. Match each listing to a scraped photo by address slug
    const updates: Array<{ id: string; address: string; matched_url: string | null; slug: string }> = []
    for (const listing of listings ?? []) {
      const slug = addressToSlug(listing.address)
      const match = photos.find(p => p.slug === slug)
      updates.push({
        id: listing.id,
        address: listing.address,
        matched_url: match?.url ?? null,
        slug,
      })
    }

    // 4. Apply updates (only where we matched something)
    let updatedCount = 0
    const failures: Array<{ id: string; address: string; error: string }> = []
    for (const u of updates) {
      if (!u.matched_url) continue
      const { error: upErr } = await supabase
        .from('featured_listings')
        .update({ photo_urls: [u.matched_url], updated_at: new Date().toISOString() })
        .eq('id', u.id)
      if (upErr) {
        failures.push({ id: u.id, address: u.address, error: upErr.message })
      } else {
        updatedCount++
      }
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        scraped_photo_count: photos.length,
        listing_count: listings?.length ?? 0,
        updated_count: updatedCount,
        unmatched: updates.filter(u => !u.matched_url).map(u => ({ address: u.address, slug: u.slug })),
        matched: updates.filter(u => u.matched_url),
        failures,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('sync-listings error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
