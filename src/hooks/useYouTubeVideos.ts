import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  link: string;
}

async function fetchYouTubeVideos(limit: number = 8): Promise<YouTubeVideo[]> {
  const { data, error } = await supabase.functions.invoke('youtube-videos', {
    method: 'POST',
    body: { limit },
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch videos');
  }

  const result = data as { success?: boolean; error?: string; videos?: YouTubeVideo[] };

  if (!result?.success) {
    throw new Error(result?.error || 'Failed to fetch videos');
  }

  return (result.videos as YouTubeVideo[]).slice(0, limit);
}

export function useYouTubeVideos(limit: number = 8) {
  return useQuery({
    queryKey: ["youtube-videos", limit],
    queryFn: () => fetchYouTubeVideos(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
