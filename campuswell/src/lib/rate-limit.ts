// Lightweight in-memory fixed-window rate limiter.
//
// CAVEAT: state lives in the module scope of a single serverless instance, so
// limits are enforced PER INSTANCE on Vercel (not shared across cold starts or
// concurrent instances). This is acceptable for a small university app and is
// intentionally dependency-free. The signature (`rateLimit({ key, limit, windowMs })`)
// is stable so the backend can be swapped to a DB-backed token bucket
// (RateLimitBucket) or Upstash Redis later without touching call sites.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
// Crude memory cap: if the map grows without bound (many distinct keys) we
// drop everything and start fresh. Expired entries are also re-created on use.
const MAX_BUCKETS = 10_000

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number }

/**
 * Increment the counter for `key` and report whether the call is allowed
 * within `limit` actions per `windowMs`. Returns retryAfterMs when blocked.
 */
export function rateLimit(opts: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(opts.key)

  // No bucket, or the window has elapsed -> start a fresh window.
  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear()
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true }
  }

  if (existing.count >= opts.limit) {
    return { ok: false, retryAfterMs: existing.resetAt - now }
  }

  existing.count += 1
  return { ok: true }
}
