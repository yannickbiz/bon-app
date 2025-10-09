import axios from "axios";
import * as cheerio from "cheerio";
import type { InstagramJSONData } from "./instagram.types";
import type { ScrapedContent } from "./types";
import { extractPostId } from "./url-validator";
import { findKeyRecursively } from "./utils";

const TIMEOUT = 30000;

export async function scrapeInstagram(url: string): Promise<ScrapedContent> {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const $ = cheerio.load(response.data);
    const postId = extractPostId(url) ?? "";

    let xdtData:
      | InstagramJSONData["xdt_api__v1__media__shortcode__web_info"]
      | undefined;

    $("script[type='application/json']").each((_i, elem) => {
      try {
        const data = JSON.parse($(elem).html() ?? "");
        const foundData = findKeyRecursively(
          data,
          "xdt_api__v1__media__shortcode__web_info",
        ) as
          | InstagramJSONData["xdt_api__v1__media__shortcode__web_info"]
          | undefined;
        if (foundData) {
          xdtData = foundData;
        }
      } catch {}
    });

    if (!xdtData) {
      throw new Error(
        "Failed to extract Instagram data: xdt_api__v1__media__shortcode__web_info not found in page",
      );
    }

    const item = xdtData.items[0];
    const title = item.caption?.text ?? null;
    const { hashtags } = extractHashtags(title);

    const authorData = item.owner;
    const username = authorData.username;

    const videoUrl = item.video_versions?.[0]?.url ?? null;
    const coverImageUrl = item.image_versions2?.candidates?.[0]?.url ?? null;

    return {
      platform: "instagram",
      postId: item.code ?? item.pk ?? item.id ?? postId,
      url,
      title,
      author: {
        username,
        displayName: null,
        profileUrl: `https://instagram.com/${username}`,
        avatarUrl: authorData.profile_pic_url,
      },
      videoUrl,
      coverImageUrl,
      engagement: {
        likes: item.like_count,
        comments: item.comment_count,
        shares: null,
        views: item.view_count,
      },
      hashtags,
      timestamp: new Date(item.taken_at * 1000).toISOString(),
      musicInfo: null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape Instagram URL: ${error.message}`);
    }
    throw new Error("Failed to scrape Instagram URL: Unknown error");
  }
}

function extractHashtags(text: string | null): {
  hashtags: string[];
} {
  if (!text) {
    return { hashtags: [] };
  }

  const hashtags = Array.from(text.matchAll(/#(\w+)/g)).map((m) => m[1]);

  return { hashtags };
}
