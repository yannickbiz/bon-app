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
          <script type="application/json">
          {
            "xdt_api__v1__media__shortcode__web_info": {
              "items": [{
                "id": "123456789",
                "code": "ABC123",
                "taken_at": 1704067200,
                "caption": {
                  "text": "Amazing photo! #test @user",
                  "pk": "123",
                  "has_translation": false,
                  "created_at": 1704067200
                },
                "owner": {
                  "pk": "789",
                  "id": "789",
                  "username": "testuser",
                  "profile_pic_url": "https://example.com/avatar.jpg",
                  "is_verified": false,
                  "is_private": false,
                  "__typename": "User"
                },
                "like_count": 100,
                "comment_count": 10,
                "view_count": null,
                "image_versions2": {
                  "candidates": [{
                    "url": "https://example.com/image.jpg",
                    "width": 1080,
                    "height": 1080
                  }]
                }
              }]
            }
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
      expect(result.hashtags).toContain("test");
      expect(result.engagement.likes).toBe(100);
      expect(result.engagement.comments).toBe(10);
    });

    it("should scrape Instagram reel", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/json">
          {
            "xdt_api__v1__media__shortcode__web_info": {
              "items": [{
                "id": "987654321",
                "code": "XYZ789",
                "taken_at": 1704067200,
                "caption": {
                  "text": "Cool reel"
                },
                "owner": {
                  "username": "reeluser",
                  "profile_pic_url": "https://example.com/avatar.jpg"
                },
                "like_count": 50,
                "comment_count": 5,
                "view_count": 1000,
                "video_versions": [{
                  "url": "https://example.com/video.mp4",
                  "width": 1080,
                  "height": 1920,
                  "type": 101
                }],
                "image_versions2": {
                  "candidates": [{
                    "url": "https://example.com/cover.jpg",
                    "width": 1080,
                    "height": 1920
                  }]
                }
              }]
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
    });

    it("should handle missing fields by returning null", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/json">
          {
            "xdt_api__v1__media__shortcode__web_info": {
              "items": [{
                "id": "minimal123",
                "code": "MINIMAL",
                "taken_at": 1704067200,
                "owner": {
                  "username": "minimaluser",
                  "profile_pic_url": "https://example.com/avatar.jpg"
                },
                "like_count": 0,
                "comment_count": 0,
                "view_count": null
              }]
            }
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeInstagram("https://instagram.com/p/MINIMAL");

      expect(result.title).toBeNull();
      expect(result.videoUrl).toBeNull();
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
          <script type="application/json">
          {
            "xdt_api__v1__media__shortcode__web_info": {
              "items": [{
                "id": "tags123",
                "code": "TAGS123",
                "taken_at": 1704067200,
                "caption": {
                  "text": "Test post #hashtag1 #hashtag2 @mention1 @mention2"
                },
                "owner": {
                  "username": "testuser",
                  "profile_pic_url": "https://example.com/avatar.jpg"
                },
                "like_count": 0,
                "comment_count": 0
              }]
            }
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeInstagram("https://instagram.com/p/TAGS123");

      expect(result.hashtags).toEqual(["hashtag1", "hashtag2"]);
    });
  });
});
