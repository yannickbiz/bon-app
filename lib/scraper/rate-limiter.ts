interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  reset: string;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = Number.parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS ?? "10",
  10,
);
const WINDOW_MS = Number.parseInt(
  process.env.RATE_LIMIT_WINDOW_MS ?? "60000",
  10,
);

export function checkRateLimit(identifier: string): RateLimitInfo {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  let entry = rateLimitStore.get(identifier);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(identifier, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const allowed = entry.timestamps.length < MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - entry.timestamps.length);
  const oldestTimestamp = entry.timestamps[0] ?? now;
  const reset = new Date(oldestTimestamp + WINDOW_MS).toISOString();

  if (allowed) {
    entry.timestamps.push(now);
  }

  return {
    allowed,
    remaining: allowed ? remaining - 1 : remaining,
    reset,
  };
}

export function cleanupRateLimits(): void {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  for (const [key, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupRateLimits, WINDOW_MS);
