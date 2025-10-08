import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios");

const { scrapeTikTok } = await import("./tiktok-scraper");

describe("tiktok-scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scrapeTikTok", () => {
    it("should successfully scrape TikTok video with complete data", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:description" content="Amazing video! #viral @friend">
          <script type="application/ld+json">
          {
            "@type": "VideoObject",
            "description": "Amazing video! #viral @friend",
            "contentUrl": "https://example.com/video.mp4",
            "thumbnailUrl": "https://example.com/cover.jpg",
            "author": {
              "identifier": { "value": "tiktoker" },
              "name": "TikTok User",
              "url": "https://tiktok.com/@tiktoker",
              "image": "https://example.com/avatar.jpg"
            },
            "uploadDate": "2024-01-01T00:00:00Z",
            "interactionStatistic": [
              { "interactionType": "http://schema.org/LikeAction", "userInteractionCount": "1000" },
              { "interactionType": "http://schema.org/CommentAction", "userInteractionCount": "100" },
              { "interactionType": "http://schema.org/WatchAction", "userInteractionCount": "10000" }
            ]
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeTikTok(
        "https://tiktok.com/@tiktoker/video/123456",
      );

      expect(result.platform).toBe("tiktok");
      expect(result.postId).toBe("123456");
      expect(result.title).toBe("Amazing video! #viral @friend");
      expect(result.author.username).toBe("tiktoker");
      expect(result.author.displayName).toBe("TikTok User");
      expect(result.videoUrl).toBe("https://example.com/video.mp4");
      expect(result.coverImageUrl).toBe("https://example.com/cover.jpg");
      expect(result.hashtags).toContain("viral");
      expect(result.mentions).toContain("friend");
      expect(result.engagement.likes).toBe(1000);
      expect(result.engagement.comments).toBe(100);
      expect(result.engagement.views).toBe(10000);
      expect(result.isVideo).toBe(true);
    });

    it("should extract music info for TikTok", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">
          {
            "__DEFAULT_SCOPE__": {
              "webapp.video-detail": {
                "itemInfo": {
                  "itemStruct": {
                    "desc": "Dance video",
                    "author": { "uniqueId": "dancer" },
                    "music": {
                      "title": "Cool Song",
                      "authorName": "Artist Name",
                      "playUrl": "https://music.example.com/song.mp3"
                    },
                    "video": {
                      "playAddr": "https://example.com/video.mp4",
                      "cover": "https://example.com/cover.jpg"
                    },
                    "stats": {
                      "diggCount": 500,
                      "commentCount": 50,
                      "shareCount": 25,
                      "playCount": 5000
                    },
                    "createTime": 1704067200
                  }
                }
              }
            }
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeTikTok(
        "https://tiktok.com/@dancer/video/789012",
      );

      expect(result.musicInfo).not.toBeNull();
      expect(result.musicInfo?.title).toBe("Cool Song");
      expect(result.musicInfo?.artist).toBe("Artist Name");
      expect(result.musicInfo?.url).toBe("https://music.example.com/song.mp3");
      expect(result.engagement.shares).toBe(25);
    });

    it("should handle missing fields by returning null", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:url" content="https://tiktok.com/@user/video/123">
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeTikTok("https://tiktok.com/@user/video/123");

      expect(result.title).toBeNull();
      expect(result.videoUrl).toBeNull();
      expect(result.engagement.likes).toBeNull();
      expect(result.engagement.views).toBeNull();
      expect(result.timestamp).toBeNull();
      expect(result.musicInfo).toBeNull();
    });

    it("should throw error on network failure", async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error("Network error"));

      await expect(
        scrapeTikTok("https://tiktok.com/@user/video/ERROR"),
      ).rejects.toThrow("Failed to scrape TikTok URL: Network error");
    });

    it("should throw error on timeout", async () => {
      vi.mocked(axios.get).mockRejectedValue(
        new Error("timeout of 30000ms exceeded"),
      );

      await expect(
        scrapeTikTok("https://tiktok.com/@user/video/TIMEOUT"),
      ).rejects.toThrow("Failed to scrape TikTok URL");
    });

    it("should extract hashtags and mentions correctly", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:description" content="#fyp #viral @creator1 @creator2 Amazing!">
          <script type="application/ld+json">
          {
            "@type": "VideoObject",
            "description": "#fyp #viral @creator1 @creator2 Amazing!",
            "author": { "identifier": { "value": "testuser" } }
          }
          </script>
        </head>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const result = await scrapeTikTok("https://tiktok.com/@test/video/999");

      expect(result.hashtags).toEqual(["fyp", "viral"]);
      expect(result.mentions).toEqual(["creator1", "creator2"]);
    });
  });
});
