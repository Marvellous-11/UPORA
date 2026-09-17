/**
 * UPORA In-Memory Rate Limiter
 * Fixed-window limiter with IP-derived keys. Suitable for single-instance
 * deployments; swap for a Redis-backed store when scaling horizontally.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

function prune(bucket: Bucket, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_KEYS) {
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  prune(bucket, windowMs);
  bucket.timestamps.push(now);

  const allowed = bucket.timestamps.length <= limit;
  const oldest = bucket.timestamps[0];
  const retryAfterMs = allowed ? 0 : Math.max(0, windowMs - (now - oldest));

  return {
    allowed,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterMs,
  };
}

/** Extracts a stable client identifier from the request (fails safe). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}