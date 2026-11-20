export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  check(key: string, config: RateLimitConfig, now = Date.now()): RateLimitResult {
    const windowStart = now - config.windowMs;
    const existing = this.hits.get(key) ?? [];
    const recent = existing.filter((timestamp) => timestamp > windowStart);

    if (recent.length >= config.maxRequests) {
      const oldestInWindow = recent[0] ?? now;
      this.hits.set(key, recent);
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestInWindow + config.windowMs,
      };
    }

    recent.push(now);
    this.hits.set(key, recent);

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - recent.length),
      resetAt: recent[0] + config.windowMs,
    };
  }

  reset(key?: string) {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }
}

export const globalRateLimiter = new SlidingWindowRateLimiter();
