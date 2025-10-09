import { describe, expect, it } from "vitest";
import type { ScrapedContent } from "./types";

describe("database", () => {
  describe("data transformation", () => {
    it("should transform ScrapedContent to database format", () => {
      const content: ScrapedContent = {
        platform: "instagram",
        postId: "ABC123",
        url: "https://instagram.com/p/ABC123",
        title: "Test post",
        author: {
          username: "testuser",
          displayName: "Test User",
          profileUrl: "https://instagram.com/testuser",
          avatarUrl: "https://example.com/avatar.jpg",
        },
        videoUrl: "https://example.com/video.mp4",
        coverImageUrl: "https://example.com/cover.jpg",
        engagement: {
          likes: 100,
          comments: 10,
          shares: 5,
          views: 1000,
        },
        hashtags: ["test"],
        timestamp: "2024-01-01T00:00:00.000Z",
        musicInfo: null,
      };

      expect(content.platform).toBe("instagram");
      expect(content.author.username).toBe("testuser");
      expect(content.engagement.likes).toBe(100);
      expect(content.hashtags).toEqual(["test"]);
    });

    it("should handle null values in scraped content", () => {
      const content: ScrapedContent = {
        platform: "tiktok",
        postId: "123456",
        url: "https://tiktok.com/@user/video/123456",
        title: null,
        author: {
          username: "tiktokuser",
          displayName: null,
          profileUrl: "https://tiktok.com/@tiktokuser",
          avatarUrl: null,
        },
        videoUrl: null,
        coverImageUrl: null,
        engagement: {
          likes: null,
          comments: null,
          shares: null,
          views: null,
        },
        hashtags: [],
        timestamp: null,
        musicInfo: {
          title: "Test Song",
          artist: "Test Artist",
          url: "https://music.example.com",
        },
      };

      expect(content.title).toBeNull();
      expect(content.author.displayName).toBeNull();
      expect(content.engagement.likes).toBeNull();
      expect(content.musicInfo).not.toBeNull();
      expect(content.musicInfo?.title).toBe("Test Song");
    });

    it("should validate FailedScrapeLog structure", () => {
      const log = {
        url: "https://instagram.com/p/FAIL",
        platform: "instagram" as const,
        status: "failed" as const,
        scrapeDurationMs: 5000,
        httpStatusCode: 500,
        errorMessage: "Network error",
        errorStack: "Error: Network error\n  at ...",
        requestMetadata: {
          ip: "127.0.0.1",
          userAgent: "Test Agent",
          rateLimitRemaining: 9,
          rateLimitReset: "2024-01-01T00:01:00.000Z",
        },
        unavailableFields: ["videoUrl", "likes"],
        scrapedContentId: 123,
      };

      expect(log.platform).toBe("instagram");
      expect(log.status).toBe("failed");
      expect(log.unavailableFields).toContain("videoUrl");
      expect(log.requestMetadata?.ip).toBe("127.0.0.1");
    });
  });
});
