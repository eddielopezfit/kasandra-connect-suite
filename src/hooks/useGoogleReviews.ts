import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

export const useGoogleReviews = () => {
  return useQuery({
    queryKey: ["google-reviews"],
    queryFn: async (): Promise<GoogleReview[]> => {
      const { data, error } = await supabase.functions.invoke<GoogleReviewsResponse>(
        "fetch-google-reviews"
      );

      if (error) {
        console.error("Error fetching Google reviews:", error);
        throw new Error("Failed to fetch reviews");
      }

      if (data?.error) {
        console.error("Google reviews API error:", data.status, data.error, data.hint);
        throw new Error(data.error);
      }

      return data?.reviews || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
  });
};
