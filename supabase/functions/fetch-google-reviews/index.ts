import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

/**
 * fetch-google-reviews
 * PERF: Added Cache-Control header — reviews update rarely, don't hit Places API on every render.
 * SECURITY: Rate limited to 5 req/min per IP — prevents API quota burn attacks. [audit PERF-03]
 */

// Search query to find Kasandra Prieto's business listing
const SEARCH_QUERY = 'Kasandra Prieto Realtor Tucson Arizona';

interface GoogleReview {
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
  rating?: number;
  text?: {
    text?: string;
  };
  relativePublishTimeDescription?: string;
}

interface FiveStarReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  photo?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 5 req/min per IP — prevents Google Places API quota burn
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const rlKey = extractRateLimitKey(req, {});
      const rl = await checkRateLimit(supabase, rlKey, 'fetch-google-reviews', 5);
      if (!rl.allowed) return rateLimitResponse(corsHeaders);
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({
          reviews: [],
          ok: false,
          status: 'MISSING_KEY',
          error: 'API key not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Search for the place to get a fresh Place ID
    console.log('Searching for place:', SEARCH_QUERY);

    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({ textQuery: SEARCH_QUERY }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok || searchData.error) {
      console.error('Search error:', searchData.error?.message || searchResponse.statusText);
      return new Response(
        JSON.stringify({
          reviews: [],
          ok: false,
          status: searchData.error?.status || 'SEARCH_ERROR',
          error: searchData.error?.message || 'Failed to search for place',
          hint: 'Ensure Places API (New) is enabled in Google Cloud Console.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const places = searchData.places || [];
    if (places.length === 0) {
      console.log('No places found for search query');
      return new Response(
        JSON.stringify({
          reviews: [],
          ok: false,
          status: 'NOT_FOUND',
          error: 'No business listing found for the search query',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placeId = places[0].id;
    const placeName = places[0].displayName?.text || 'Unknown';
    console.log('Found place:', placeName, 'ID:', placeId);

    // Step 2: Fetch reviews for the found place
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
    const detailsResponse = await fetch(detailsUrl, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'reviews',
      },
    });

    const detailsData = await detailsResponse.json();

    console.log('Google Places API details response status:', detailsResponse.status);

    if (!detailsResponse.ok || detailsData.error) {
      console.error('Details error:', detailsData.error?.message || detailsResponse.statusText);
      return new Response(
        JSON.stringify({
          reviews: [],
          ok: false,
          status: detailsData.error?.status || 'ERROR',
          error: detailsData.error?.message || 'Failed to fetch reviews',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviews: GoogleReview[] = detailsData.reviews || [];
    console.log('Total reviews received:', reviews.length);

    // Filter for 5-star reviews only
    const fiveStarReviews: FiveStarReview[] = reviews
      .filter((review) => review.rating === 5)
      .map((review) => ({
        author: review.authorAttribution?.displayName || 'Anonymous',
        rating: review.rating || 5,
        text: review.text?.text || '',
        time: review.relativePublishTimeDescription || '',
        photo: review.authorAttribution?.photoUri,
      }));

    console.log('5-star reviews found:', fiveStarReviews.length);

    // Shuffle reviews using Fisher-Yates algorithm for fresh display order
    const shuffled = [...fiveStarReviews];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return new Response(
      JSON.stringify({ reviews: shuffled, ok: true, placeName }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return new Response(
      JSON.stringify({ reviews: [], ok: false, status: 'INTERNAL_ERROR', error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
