import { describe, expect, it, vi } from "vitest";
import { validateVideoDuration } from "./video-processor";

vi.mock("fluent-ffmpeg");
vi.mock("axios");
vi.mock("@/lib/supabase/storage");

describe("Video Processor", () => {
  describe("validateVideoDuration", () => {
    it("should validate duration within limit", () => {
      const result = validateVideoDuration(120);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should reject duration exceeding limit", () => {
      const result = validateVideoDuration(400);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds maximum");
    });

    it("should accept duration at exact limit", () => {
      const result = validateVideoDuration(300);

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});
