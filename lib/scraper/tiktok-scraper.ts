import axios from "axios";
import * as cheerio from "cheerio";
import type { TikTokJSONDataVideoDetail } from "./tiktok.types";
import type { ScrapedContent } from "./types";
import { extractPostId } from "./url-validator";

const TIMEOUT = 30000;

export async function scrapeTikTok(url: string): Promise<ScrapedContent> {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const $ = cheerio.load(response.data);
    const postId = extractPostId(url) ?? "";

    const scriptElem = $("script#__UNIVERSAL_DATA_FOR_REHYDRATION__");
    if (scriptElem.length === 0) {
      throw new Error(
        "Failed to extract TikTok data: script element not found",
      );
    }

    const data = JSON.parse(scriptElem.html() ?? "");
    const jsonData: TikTokJSONDataVideoDetail =
      data?.__DEFAULT_SCOPE__?.["webapp.video-detail"];

    if (!jsonData) {
      throw new Error(
        'Failed to extract TikTok data: "webapp.video-detail" not found in page',
      );
    }

    const item = jsonData.itemInfo?.itemStruct;
    const title = item?.desc ?? null;
    const { hashtags } = extractHashtags(title);

    const authorData = item?.author;
    const username = authorData?.uniqueId ?? authorData?.id ?? "";
    const urlMatch = !username ? url.match(/\/@([^/]+)/) : null;
    const finalUsername = username || urlMatch?.[1] || "";

    const videoData = item?.video;
    const stats = item?.stats;
    const music = item?.music;

    return {
      platform: "tiktok",
      postId: item?.id ?? postId,
      url,
      title,
      author: {
        username: finalUsername,
        displayName: authorData?.nickname ?? null,
        profileUrl: finalUsername ? `https://tiktok.com/@${finalUsername}` : "",
        avatarUrl: authorData?.avatarThumb ?? authorData?.avatarMedium ?? null,
      },
      videoUrl: videoData?.playAddr ?? videoData?.downloadAddr ?? null,
      coverImageUrl:
        videoData?.cover ??
        videoData?.originCover ??
        videoData?.dynamicCover ??
        null,
      engagement: {
        likes: stats?.diggCount ?? null,
        comments: stats?.commentCount ?? null,
        shares: stats?.shareCount ?? null,
        views: stats?.playCount ?? null,
      },
      hashtags,
      timestamp: item?.createTime
        ? new Date(Number(item.createTime) * 1000).toISOString()
        : null,
      musicInfo: music
        ? {
            title: music.title ?? null,
            artist: music.authorName ?? null,
            url: music.playUrl ?? null,
          }
        : null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape TikTok URL: ${error.message}`);
    }
    throw new Error("Failed to scrape TikTok URL: Unknown error");
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
