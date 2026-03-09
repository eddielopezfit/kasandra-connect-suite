/**
 * Shared CORS helper — replaces wildcard Access-Control-Allow-Origin: *
 *
 * Allowed origins:
 *   - kasandraprietorealtor.com (production)
 *   - www.kasandraprietorealtor.com
 *   - lovable.app previews (Lovable build/preview environment)
 *   - localhost:* (local development)
 *
 * Usage:
 *   import { getCorsHeaders, CORS_ALLOWED_HEADERS } from "../_shared/cors.ts";
 *   const corsHeaders = getCorsHeaders(req);
 */

const ALLOWED_ORIGINS = [
  "https://kasandraprietorealtor.com",
  "https://www.kasandraprietorealtor.com",
];

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,   // Lovable preview builds
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/, // Lovable project URLs
  /^http:\/\/localhost(:\d+)?$/,             // Local dev
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,         // Local dev alternate
];

export const CORS_ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

/**
 * Returns CORS headers scoped to the request's Origin.
 * Falls back to primary production domain if origin is not in allowlist.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";

  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://kasandraprietorealtor.com",
    "Access-Control-Allow-Headers": CORS_ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

/**
 * Convenience: returns true if the request is a CORS preflight.
 */
export function isPreflightRequest(req: Request): boolean {
  return req.method === "OPTIONS";
}
