import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, cleanupRateLimits } from "./rate-limiter";

describe("rate-limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow requests under threshold", () => {
      const result1 = checkRateLimit("test-ip-1");
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(9);

      const result2 = checkRateLimit("test-ip-1");
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(8);
    });

    it("should block requests over threshold", () => {
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit("test-ip-2");
        expect(result.allowed).toBe(true);
      }

      const blockedResult = checkRateLimit("test-ip-2");
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });

    it("should reset after time window", () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit("test-ip-3");
      }

      const blockedResult = checkRateLimit("test-ip-3");
      expect(blockedResult.allowed).toBe(false);

      vi.advanceTimersByTime(61000);

      const allowedResult = checkRateLimit("test-ip-3");
      expect(allowedResult.allowed).toBe(true);
      expect(allowedResult.remaining).toBe(9);
    });

    it("should track multiple IPs independently", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("test-ip-4");
      }

      for (let i = 0; i < 8; i++) {
        checkRateLimit("test-ip-5");
      }

      const result4 = checkRateLimit("test-ip-4");
      expect(result4.allowed).toBe(true);
      expect(result4.remaining).toBe(4);

      const result5 = checkRateLimit("test-ip-5");
      expect(result5.allowed).toBe(true);
      expect(result5.remaining).toBe(1);
    });

    it("should return correct rate limit info", () => {
      const result = checkRateLimit("test-ip-6");

      expect(result).toHaveProperty("allowed");
      expect(result).toHaveProperty("remaining");
      expect(result).toHaveProperty("reset");
      expect(typeof result.allowed).toBe("boolean");
      expect(typeof result.remaining).toBe("number");
      expect(typeof result.reset).toBe("string");
    });
  });

  describe("cleanupRateLimits", () => {
    it("should clean up old entries", () => {
      checkRateLimit("test-ip-7");

      vi.advanceTimersByTime(61000);

      cleanupRateLimits();

      const result = checkRateLimit("test-ip-7");
      expect(result.remaining).toBe(9);
    });
  });
});
