import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  photo?: string;
}

interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  ok?: boolean;
  status?: string;
  error?: string;
  hint?: string;
  totalCount?: number;
  averageRating?: number;
}

const CACHE_KEY = 'cc_google_reviews_cache';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Curated fallback reviews for graceful degradation
const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    author: "Maria G.",
    rating: 5,
    text: "Kasandra made our home buying journey so smooth. She truly cares about her clients and the community.",
    time: "2 months ago",
  },
  {
    author: "Roberto S.",
    rating: 5,
    text: "Professional, knowledgeable, and always available to answer questions. Best realtor in Tucson!",
    time: "3 months ago",
  },
  {
    author: "Jennifer L.",
    rating: 5,
    text: "Kasandra went above and beyond to help us find our dream home. Her dedication is unmatched.",
    time: "1 month ago",
  },
  {
    author: "Carlos M.",
    rating: 5,
    text: "Excelente servicio. Kasandra nos ayudó a entender cada paso del proceso. ¡Muy recomendada!",
    time: "2 months ago",
  },
  {
    author: "Patricia H.",
    rating: 5,
    text: "We sold our home in record time thanks to Kasandra's expertise and marketing strategy.",
    time: "4 months ago",
  },
];

interface CachedReviews {
  reviews: GoogleReview[];
  totalCount?: number;
  averageRating?: number;
  cachedAt: number;
}

async function fetchGoogleReviews(): Promise<GoogleReviewsResult> {
  // Strategy 1: Try live API
  try {
    const { data, error } = await supabase.functions.invoke<GoogleReviewsResponse>(
      "fetch-google-reviews"
    );

    if (!error && data?.ok && data.reviews && data.reviews.length > 0) {
      // Cache successful response
      const cacheData: CachedReviews = {
        reviews: data.reviews,
        totalCount: data.totalCount,
        averageRating: data.averageRating,
        cachedAt: Date.now(),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (e) {
        logger.warn('[GoogleReviews] Failed to cache reviews:', e);
      }
      return {
        reviews: data.reviews,
        totalCount: data.totalCount,
        averageRating: data.averageRating,
        source: 'live',
      };
    }

    if (data?.error) {
      logger.warn('[GoogleReviews] API returned error:', data.status, data.error);
    }
  } catch (e) {
    logger.warn('[GoogleReviews] API call failed:', e);
  }

  // Strategy 2: Try cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedReviews = JSON.parse(cached);
      if (Date.now() - parsed.cachedAt < CACHE_TTL_MS && parsed.reviews.length > 0) {
        if (import.meta.env.DEV) logger.log('[GoogleReviews] Using cached reviews');
        return {
          reviews: parsed.reviews,
          totalCount: parsed.totalCount,
          averageRating: parsed.averageRating,
          source: 'cache',
        };
      }
    }
  } catch (e) {
    logger.warn('[GoogleReviews] Failed to read cache:', e);
  }

  // Strategy 3: Return fallback
  if (import.meta.env.DEV) logger.log('[GoogleReviews] Using fallback reviews');
  return { reviews: FALLBACK_REVIEWS, source: 'fallback' };
}

export type ReviewsSource = 'live' | 'cache' | 'fallback';

export interface GoogleReviewsResult {
  reviews: GoogleReview[];
  totalCount?: number;
  averageRating?: number;
  source: ReviewsSource;
}

export const useGoogleReviews = () => {
  return useQuery({
    queryKey: ["google-reviews"],
    queryFn: async (): Promise<GoogleReviewsResult> => {
      return fetchGoogleReviews();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1, // Only 1 retry since we have fallback
  });
};
