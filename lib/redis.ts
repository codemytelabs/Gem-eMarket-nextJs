import { Redis } from "@upstash/redis";

// Swap to any Redis-compatible client by changing this file only.
// Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / (windowSeconds * 1000))}`;

  const count = await redis.incr(windowKey);
  if (count === 1) await redis.expire(windowKey, windowSeconds);

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
  };
}

export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds });
}

// Plain keys are deleted directly. Keys containing "*" are treated as a
// pattern: DEL doesn't support globs, so matching keys are found via SCAN
// first, then deleted.
export async function invalidateCache(keyOrPattern: string): Promise<void> {
  if (!keyOrPattern.includes("*")) {
    await redis.del(keyOrPattern);
    return;
  }

  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: keyOrPattern,
      count: 100,
    });
    if (keys.length > 0) await redis.del(...keys);
    cursor = nextCursor;
  } while (cursor !== "0");
}
