// ============================================
// Rate Limiting Utility
// In-memory sliding window rate limiter
// ============================================
//
// NOTE: This uses an in-memory Map, which works for single-process
// environments (local dev, single Vercel instance). For distributed
// production systems, replace with Redis or database-backed rate limiting.

const requests = new Map<string, number[]>();

/**
 * Check if a request is within the rate limit.
 * @param key - Unique identifier (e.g., "generate:<userId>")
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns Object with `success` (whether allowed) and `remaining` count
 */
export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing timestamps and filter to only those within the current window
  const timestamps = (requests.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    // Rate limited — update the filtered timestamps and reject
    requests.set(key, timestamps);
    return { success: false, remaining: 0 };
  }

  // Allow request — record the timestamp
  timestamps.push(now);
  requests.set(key, timestamps);

  return { success: true, remaining: limit - timestamps.length };
}
