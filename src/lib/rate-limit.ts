/**
 * Simple fixed-window rate limiter. In-memory, so it is per server instance only. On Vercel this
 * slows abuse but is not a hard guarantee; swap for Upstash/Vercel KV if order spam becomes a problem.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}
