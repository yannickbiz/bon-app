import { describe, expect, it } from "vitest";
import {
  extractPostId,
  isInstagramUrl,
  isTikTokUrl,
  validateUrl,
} from "./url-validator";

describe("url-validator", () => {
  describe("isInstagramUrl", () => {
    it("should validate Instagram post URLs", () => {
      expect(isInstagramUrl("https://instagram.com/p/ABC123")).toBe(true);
      expect(isInstagramUrl("https://www.instagram.com/p/ABC123/")).toBe(true);
      expect(isInstagramUrl("http://instagram.com/p/XYZ_789-test")).toBe(true);
    });

    it("should validate Instagram reel URLs", () => {
      expect(isInstagramUrl("https://instagram.com/reel/ABC123")).toBe(true);
      expect(isInstagramUrl("https://www.instagram.com/reel/ABC123/")).toBe(
        true,
      );
      expect(isInstagramUrl("http://instagram.com/reel/XYZ_789-test")).toBe(
        true,
      );
    });

    it("should reject invalid Instagram URLs", () => {
      expect(isInstagramUrl("https://instagram.com/user/profile")).toBe(false);
      expect(isInstagramUrl("https://facebook.com/p/ABC123")).toBe(false);
      expect(isInstagramUrl("not a url")).toBe(false);
      expect(isInstagramUrl("https://instagram.com")).toBe(false);
    });
  });

  describe("isTikTokUrl", () => {
    it("should validate TikTok video URLs", () => {
      expect(isTikTokUrl("https://tiktok.com/@user123/video/123456789")).toBe(
        true,
      );
      expect(
        isTikTokUrl("https://www.tiktok.com/@user_name/video/987654321/"),
      ).toBe(true);
      expect(isTikTokUrl("http://tiktok.com/@test.user/video/111222333")).toBe(
        true,
      );
    });

    it("should reject invalid TikTok URLs", () => {
      expect(isTikTokUrl("https://tiktok.com/@user123")).toBe(false);
      expect(isTikTokUrl("https://instagram.com/@user/video/123")).toBe(false);
      expect(isTikTokUrl("not a url")).toBe(false);
      expect(isTikTokUrl("https://tiktok.com/video/123456")).toBe(false);
    });
  });

  describe("validateUrl", () => {
    it("should return 'instagram' for valid Instagram URLs", () => {
      expect(validateUrl("https://instagram.com/p/ABC123")).toBe("instagram");
      expect(validateUrl("https://instagram.com/reel/XYZ789")).toBe(
        "instagram",
      );
    });

    it("should return 'tiktok' for valid TikTok URLs", () => {
      expect(validateUrl("https://tiktok.com/@user/video/123456")).toBe(
        "tiktok",
      );
    });

    it("should return null for invalid URLs", () => {
      expect(validateUrl("https://facebook.com/post/123")).toBe(null);
      expect(validateUrl("not a url")).toBe(null);
      expect(validateUrl("https://instagram.com/user")).toBe(null);
    });

    it("should handle URL variations", () => {
      expect(validateUrl("http://instagram.com/p/ABC123")).toBe("instagram");
      expect(validateUrl("https://www.instagram.com/p/ABC123")).toBe(
        "instagram",
      );
      expect(validateUrl("https://instagram.com/p/ABC123/")).toBe("instagram");
      expect(validateUrl("http://www.tiktok.com/@user/video/123/")).toBe(
        "tiktok",
      );
    });
  });

  describe("extractPostId", () => {
    it("should extract post ID from Instagram post URLs", () => {
      expect(extractPostId("https://instagram.com/p/ABC123")).toBe("ABC123");
      expect(extractPostId("https://instagram.com/p/XYZ_789-test/")).toBe(
        "XYZ_789-test",
      );
    });

    it("should extract post ID from Instagram reel URLs", () => {
      expect(extractPostId("https://instagram.com/reel/ABC123")).toBe("ABC123");
      expect(extractPostId("https://instagram.com/reel/XYZ_789-test/")).toBe(
        "XYZ_789-test",
      );
    });

    it("should extract video ID from TikTok URLs", () => {
      expect(extractPostId("https://tiktok.com/@user/video/123456789")).toBe(
        "123456789",
      );
      expect(
        extractPostId("https://tiktok.com/@user.name/video/987654321/"),
      ).toBe("987654321");
    });

    it("should return null for invalid URLs", () => {
      expect(extractPostId("https://instagram.com/user")).toBe(null);
      expect(extractPostId("not a url")).toBe(null);
      expect(extractPostId("https://facebook.com/post/123")).toBe(null);
    });
  });
});
