import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios");

const { scrapeInstagram } = await import("./instagram-scraper");

describe("instagram-scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scrapeInstagram", () => {
    it("should successfully scrape Instagram post with complete data", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:description" content="Amazing photo! #test @user">
          <meta property="og:image" content="https://example.com/image.jpg">
          <script type="application/ld+json">
          {
            "@type": "ImageObject",
            "description": "Amazing photo! #test @user",
            "author": {
              "name": "Test User",
              "identifier": { "value": "testuser" },
              "url": "https://instagram.com/testuser",
              "image": "https://example.com/avatar.jpg"
            },
            "uploadDate": "2024-01-01T00:00:00Z",
            "interactionStatistic": [
              { "interactionType": "http://schema.org/LikeAction", "userInteractionCount": "100" },
              { "interactionType": "http://schema.org/CommentAction", "userInteractionCount": "10" }
            ]
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeInstagram("https://instagram.com/p/ABC123");

      expect(result.platform).toBe("instagram");
      expect(result.postId).toBe("ABC123");
      expect(result.title).toBe("Amazing photo! #test @user");
      expect(result.author.username).toBe("testuser");
      expect(result.author.displayName).toBe("Test User");
      expect(result.hashtags).toContain("test");
      expect(result.mentions).toContain("user");
      expect(result.engagement.likes).toBe(100);
      expect(result.engagement.comments).toBe(10);
    });

    it("should scrape Instagram reel", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:description" content="Cool reel">
          <meta property="og:video" content="https://example.com/video.mp4">
          <meta property="og:image" content="https://example.com/cover.jpg">
          <script type="application/ld+json">
          {
            "@type": "VideoObject",
            "description": "Cool reel",
            "contentUrl": "https://example.com/video.mp4",
            "thumbnailUrl": "https://example.com/cover.jpg",
            "author": {
              "identifier": { "value": "reeluser" }
            }
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeInstagram("https://instagram.com/reel/XYZ789");

      expect(result.platform).toBe("instagram");
      expect(result.postId).toBe("XYZ789");
      expect(result.videoUrl).toBe("https://example.com/video.mp4");
      expect(result.coverImageUrl).toBe("https://example.com/cover.jpg");
      expect(result.isVideo).toBe(true);
    });

    it("should handle missing fields by returning null", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:url" content="https://instagram.com/testuser">
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeInstagram("https://instagram.com/p/MINIMAL");

      expect(result.title).toBeNull();
      expect(result.videoUrl).toBeNull();
      expect(result.engagement.likes).toBeNull();
      expect(result.engagement.comments).toBeNull();
      expect(result.timestamp).toBeNull();
      expect(result.location).toBeNull();
    });

    it("should throw error on network failure", async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error("Network error"));

      await expect(
        scrapeInstagram("https://instagram.com/p/ERROR"),
      ).rejects.toThrow("Failed to scrape Instagram URL: Network error");
    });

    it("should throw error on timeout", async () => {
      vi.mocked(axios.get).mockRejectedValue(
        new Error("timeout of 30000ms exceeded"),
      );

      await expect(
        scrapeInstagram("https://instagram.com/p/TIMEOUT"),
      ).rejects.toThrow("Failed to scrape Instagram URL");
    });

    it("should extract hashtags and mentions correctly", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:description" content="Test post #hashtag1 #hashtag2 @mention1 @mention2">
          <script type="application/ld+json">
          {
            "@type": "ImageObject",
            "description": "Test post #hashtag1 #hashtag2 @mention1 @mention2",
            "author": { "identifier": { "value": "testuser" } }
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeInstagram("https://instagram.com/p/TAGS123");

      expect(result.hashtags).toEqual(["hashtag1", "hashtag2"]);
      expect(result.mentions).toEqual(["mention1", "mention2"]);
    });
  });
});
