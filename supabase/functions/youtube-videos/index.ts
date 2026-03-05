import { getCorsHeaders } from "../_shared/cors.ts";
// Kasandra Prieto's YouTube channel - using handle-based lookup
const CHANNEL_HANDLE = "@KasandraPrietoTucson";

// Fallback videos to show if fetching fails
const FALLBACK_VIDEOS = [
  {
    id: "xmJ62GGtKgo",
    title: "Lifting You Up with Kasandra Prieto - Episode 1",
    thumbnail: "https://img.youtube.com/vi/xmJ62GGtKgo/mqdefault.jpg",
    publishedAt: "2024-01-15T00:00:00Z",
    link: "https://www.youtube.com/watch?v=xmJ62GGtKgo",
  },
  {
    id: "featured-2",
    title: "Building Generational Wealth Through Real Estate",
    thumbnail: "https://img.youtube.com/vi/xmJ62GGtKgo/mqdefault.jpg",
    publishedAt: "2024-02-01T00:00:00Z",
    link: "https://www.youtube.com/@KasandraPrietoTucson",
  },
  {
    id: "featured-3",
    title: "Community Leadership in Tucson",
    thumbnail: "https://img.youtube.com/vi/xmJ62GGtKgo/mqdefault.jpg",
    publishedAt: "2024-02-15T00:00:00Z",
    link: "https://www.youtube.com/@KasandraPrietoTucson",
  },
  {
    id: "featured-4",
    title: "From Immigrant to Entrepreneur: Success Stories",
    thumbnail: "https://img.youtube.com/vi/xmJ62GGtKgo/mqdefault.jpg",
    publishedAt: "2024-03-01T00:00:00Z",
    link: "https://www.youtube.com/@KasandraPrietoTucson",
  },
];

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  link: string;
}

// Try to fetch channel ID from the YouTube handle page
async function getChannelIdFromHandle(handle: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.youtube.com/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch handle page: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Look for channel ID in various patterns
    const patterns = [
      /\"channelId\":\"(UC[a-zA-Z0-9_-]{22})\"/,
      /channel_id=(UC[a-zA-Z0-9_-]{22})/,
      /\"externalId\":\"(UC[a-zA-Z0-9_-]{22})\"/,
      /<meta itemprop="identifier" content="(UC[a-zA-Z0-9_-]{22})">/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        console.log(`Found channel ID: ${match[1]}`);
        return match[1];
      }
    }

    console.log('Channel ID not found in page');
    return null;
  } catch (error) {
    console.error('Error fetching handle page:', error);
    return null;
  }
}

// Fetch videos from RSS feed
async function fetchVideosFromRSS(channelId: string, limit: number): Promise<YouTubeVideo[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  console.log(`Fetching RSS from: ${feedUrl}`);
  
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/xml,text/xml,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }

  const xmlText = await response.text();
  console.log(`Received ${xmlText.length} bytes of XML`);

  const videos: YouTubeVideo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null && videos.length < limit) {
    const entry = match[1];

    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const videoId = videoIdMatch ? videoIdMatch[1] : '';

    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : '';

    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const publishedAt = publishedMatch ? publishedMatch[1] : '';

    if (videoId && title) {
      videos.push({
        id: videoId,
        title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        publishedAt,
        link: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  return videos;
}

// Fetch videos using YouTube Data API v3
async function fetchVideosFromAPI(
  apiKey: string,
  channelId: string,
  limit: number
): Promise<YouTubeVideo[]> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('key', apiKey);
  searchUrl.searchParams.set('channelId', channelId);
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('order', 'date');
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', String(limit));

  console.log('Fetching from YouTube Data API v3');
  const response = await fetch(searchUrl.toString());

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YouTube API error:', response.status, errorText);
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    console.warn('No items in YouTube API response');
    return [];
  }

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
    publishedAt: item.snippet.publishedAt,
    link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    const body = req.method === 'POST' ? await req.json().catch(() => null) : null;
    const limitRaw = body?.limit ?? url.searchParams.get('limit') ?? '15';
    const limit = Math.max(1, Math.min(50, parseInt(String(limitRaw), 10) || 15));

    console.log(`Fetching YouTube videos, limit: ${limit}`);

    // Try to get channel ID from handle
    const channelId = await getChannelIdFromHandle(CHANNEL_HANDLE);

    let videos: YouTubeVideo[] = [];

    // Strategy 1: Try RSS feed if we have channel ID
    if (channelId) {
      try {
        videos = await fetchVideosFromRSS(channelId, limit);
        if (videos.length > 0) {
          console.log(`Fetched ${videos.length} videos from RSS`);
        }
      } catch (rssError) {
        console.error('RSS fetch failed:', rssError);
      }
    }

    // Strategy 2: Try YouTube Data API v3 if RSS failed
    if (videos.length === 0 && channelId) {
      const apiKey = Deno.env.get('YOUTUBE_API_KEY');
      if (apiKey) {
        try {
          videos = await fetchVideosFromAPI(apiKey, channelId, limit);
          if (videos.length > 0) {
            console.log(`Fetched ${videos.length} videos from YouTube API`);
          }
        } catch (apiError) {
          console.error('YouTube API fetch failed:', apiError);
        }
      } else {
        console.log('YOUTUBE_API_KEY not configured, skipping API fetch');
      }
    }

    // Strategy 3: Fallback to static videos
    if (videos.length === 0) {
      console.log('Using fallback videos');
      videos = FALLBACK_VIDEOS.slice(0, limit);
    }

    return new Response(
      JSON.stringify({ success: true, videos }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // Return fallback videos on any error
    return new Response(
      JSON.stringify({ 
        success: true, 
        videos: FALLBACK_VIDEOS,
        fallback: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
