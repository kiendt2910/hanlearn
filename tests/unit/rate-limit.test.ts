import { describe, expect, it } from "vitest";
import { SlidingWindowRateLimiter } from "@/lib/rate-limit/memory-rate-limiter";

describe("SlidingWindowRateLimiter", () => {
  it("allows requests within quota, blocks excess, and resets after window", () => {
    const limiter = new SlidingWindowRateLimiter();
    const config = { windowMs: 1000, maxRequests: 2 };

    const t0 = 10_000;
    expect(limiter.check("k1", config, t0).allowed).toBe(true);
    expect(limiter.check("k1", config, t0 + 100).allowed).toBe(true);

    const blocked = limiter.check("k1", config, t0 + 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    // After sliding window passes
    const recovered = limiter.check("k1", config, t0 + 1200);
    expect(recovered.allowed).toBe(true);
  });
});
