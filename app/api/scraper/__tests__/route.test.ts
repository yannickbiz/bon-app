import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

vi.mock("@/lib/scraper/url-validator", () => ({
  validateUrl: vi.fn(),
}));

vi.mock("@/lib/scraper/instagram-scraper", () => ({
  scrapeInstagram: vi.fn(),
}));

vi.mock("@/lib/scraper/tiktok-scraper", () => ({
  scrapeTikTok: vi.fn(),
}));

vi.mock("@/lib/scraper/database", () => ({
  getCachedContent: vi.fn(),
  upsertScrapedContent: vi.fn(),
  logFailedScrape: vi.fn(),
}));

vi.mock("@/lib/scraper/rate-limiter", () => ({
  checkRateLimit: vi.fn(),
}));

const { validateUrl } = await import("@/lib/scraper/url-validator");
const { scrapeInstagram } = await import("@/lib/scraper/instagram-scraper");
const { scrapeTikTok } = await import("@/lib/scraper/tiktok-scraper");
const { getCachedContent, upsertScrapedContent, logFailedScrape } =
  await import("@/lib/scraper/database");
const { checkRateLimit } = await import("@/lib/scraper/rate-limiter");

describe("/api/scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      reset: "2024-01-01T00:01:00.000Z",
    });
  });

  describe("POST", () => {
    it("should successfully scrape Instagram URL", async () => {
      const mockScrapedData = {
        platform: "instagram" as const,
        postId: "ABC123",
        url: "https://instagram.com/p/ABC123",
        title: "Test post",
        author: {
          username: "testuser",
          displayName: "Test User",
          profileUrl: "https://instagram.com/testuser",
          avatarUrl: "https://example.com/avatar.jpg",
        },
        videoUrl: null,
        coverImageUrl: "https://example.com/cover.jpg",
        engagement: { likes: 100, comments: 10, shares: null, views: null },
        hashtags: ["test"],
        mentions: [],
        timestamp: "2024-01-01T00:00:00.000Z",
        musicInfo: null,
        location: null,
        isVideo: false,
      };

      vi.mocked(validateUrl).mockReturnValue("instagram");
      vi.mocked(getCachedContent).mockResolvedValue(null);
      vi.mocked(scrapeInstagram).mockResolvedValue(mockScrapedData);
      vi.mocked(upsertScrapedContent).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://instagram.com/p/ABC123" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.platform).toBe("instagram");
      expect(data.error).toBeNull();
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("9");
    });

    it("should successfully scrape TikTok URL", async () => {
      const mockScrapedData = {
        platform: "tiktok" as const,
        postId: "123456",
        url: "https://tiktok.com/@user/video/123456",
        title: "TikTok video",
        author: {
          username: "tiktokuser",
          displayName: "TikTok User",
          profileUrl: "https://tiktok.com/@tiktokuser",
          avatarUrl: null,
        },
        videoUrl: "https://example.com/video.mp4",
        coverImageUrl: "https://example.com/cover.jpg",
        engagement: { likes: 500, comments: 50, shares: 25, views: 5000 },
        hashtags: ["viral"],
        mentions: [],
        timestamp: null,
        musicInfo: {
          title: "Song",
          artist: "Artist",
          url: "https://music.example.com",
        },
        location: null,
        isVideo: true,
      };

      vi.mocked(validateUrl).mockReturnValue("tiktok");
      vi.mocked(getCachedContent).mockResolvedValue(null);
      vi.mocked(scrapeTikTok).mockResolvedValue(mockScrapedData);
      vi.mocked(upsertScrapedContent).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://tiktok.com/@user/video/123456" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.platform).toBe("tiktok");
      expect(data.data?.musicInfo).not.toBeNull();
    });

    it("should return cached data when available", async () => {
      const cachedData = {
        platform: "instagram" as const,
        postId: "CACHED",
        url: "https://instagram.com/p/CACHED",
        title: "Cached post",
        author: {
          username: "cached",
          displayName: null,
          profileUrl: "https://instagram.com/cached",
          avatarUrl: null,
        },
        videoUrl: null,
        coverImageUrl: null,
        engagement: { likes: null, comments: null, shares: null, views: null },
        hashtags: [],
        mentions: [],
        timestamp: null,
        musicInfo: null,
        location: null,
        isVideo: false,
      };

      vi.mocked(validateUrl).mockReturnValue("instagram");
      vi.mocked(getCachedContent).mockResolvedValue(cachedData);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://instagram.com/p/CACHED" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.postId).toBe("CACHED");
      expect(scrapeInstagram).not.toHaveBeenCalled();
    });

    it("should bypass cache with force=true", async () => {
      const mockScrapedData = {
        platform: "instagram" as const,
        postId: "FORCED",
        url: "https://instagram.com/p/FORCED",
        title: "Fresh data",
        author: {
          username: "test",
          displayName: null,
          profileUrl: "https://instagram.com/test",
          avatarUrl: null,
        },
        videoUrl: null,
        coverImageUrl: null,
        engagement: { likes: null, comments: null, shares: null, views: null },
        hashtags: [],
        mentions: [],
        timestamp: null,
        musicInfo: null,
        location: null,
        isVideo: false,
      };

      vi.mocked(validateUrl).mockReturnValue("instagram");
      vi.mocked(scrapeInstagram).mockResolvedValue(mockScrapedData);
      vi.mocked(upsertScrapedContent).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://instagram.com/p/FORCED",
          force: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data?.title).toBe("Fresh data");
      expect(getCachedContent).not.toHaveBeenCalled();
      expect(scrapeInstagram).toHaveBeenCalled();
    });

    it("should return 400 for invalid URL", async () => {
      vi.mocked(validateUrl).mockReturnValue(null);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://invalid.com/post/123" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid URL format");
    });

    it("should return 429 for rate limit exceeded", async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        reset: "2024-01-01T00:01:00.000Z",
      });

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://instagram.com/p/TEST" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Rate limit exceeded");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("should return 500 and log error on scraper failure", async () => {
      vi.mocked(validateUrl).mockReturnValue("instagram");
      vi.mocked(getCachedContent).mockResolvedValue(null);
      vi.mocked(scrapeInstagram).mockRejectedValue(new Error("Network error"));
      vi.mocked(logFailedScrape).mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://instagram.com/p/ERROR" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Failed to scrape URL");
      expect(logFailedScrape).toHaveBeenCalled();
    });

    it("should include rate limit headers in all responses", async () => {
      vi.mocked(validateUrl).mockReturnValue(null);

      const request = new NextRequest("http://localhost/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://invalid.com" }),
      });

      const response = await POST(request);

      expect(response.headers.get("X-RateLimit-Remaining")).toBe("9");
      expect(response.headers.get("X-RateLimit-Reset")).toBe(
        "2024-01-01T00:01:00.000Z",
      );
    });
  });
});
