/**
 * Shared rate limiter for Edge Functions.
 * Uses the rate_limits table (service-role only) to track request counts per key+endpoint.
 */

interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  'generate-report': { maxRequests: 5, windowSeconds: 3600 },
  'selena-chat': { maxRequests: 30, windowSeconds: 60 },
  'submit-consultation-intake': { maxRequests: 5, windowSeconds: 3600 },
  'submit-seller': { maxRequests: 5, windowSeconds: 3600 },
  'upsert-lead-profile': { maxRequests: 10, windowSeconds: 3600 },
};

/**
 * Check and enforce rate limit. Returns true if request is allowed.
 * @param supabase - Service-role Supabase client
 * @param key - Rate limit key (email, session_id, or IP)
 * @param endpoint - Edge function name
 */
export async function checkRateLimit(
  supabase: any,
  key: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining?: number }> {
  const config = ENDPOINT_LIMITS[endpoint] || { maxRequests: 20, windowSeconds: 60 };
  const windowStart = new Date(Date.now() - config.windowSeconds * 1000).toISOString();

  try {
    // Count requests in current window
    const { data, error } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('key', key)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart);

    if (error) {
      console.error('[rateLimit] Query error:', error);
      return { allowed: true }; // Fail open on DB errors
    }

    const totalRequests = (data || []).reduce(
      (sum: number, row: { request_count: number }) => sum + row.request_count,
      0
    );

    if (totalRequests >= config.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Log this request
    await supabase.from('rate_limits').insert({
      key,
      endpoint,
      window_start: new Date().toISOString(),
      request_count: 1,
    });

    return { allowed: true, remaining: config.maxRequests - totalRequests - 1 };
  } catch (err) {
    console.error('[rateLimit] Unexpected error:', err);
    return { allowed: true }; // Fail open
  }
}

/**
 * Extract a rate limit key from the request.
 * Priority: email from body > session_id > lead_id > IP
 */
export function extractRateLimitKey(req: Request, body?: Record<string, any>): string {
  if (body?.email) return `email:${body.email.trim().toLowerCase()}`;
  if (body?.context?.session_id) return `session:${body.context.session_id}`;
  if (body?.session_id) return `session:${body.session_id}`;
  if (body?.lead_id) return `lead:${body.lead_id}`;
  
  // Fallback to IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `ip:${ip}`;
}

/**
 * Build a 429 response with CORS headers
 */
export function rateLimitResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ ok: false, error: 'Rate limit exceeded. Please try again later.' }),
    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
