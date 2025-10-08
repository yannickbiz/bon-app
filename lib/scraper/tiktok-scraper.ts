import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedContent } from "./types";
import { extractPostId } from "./url-validator";

const TIMEOUT = 30000;

export async function scrapeTikTok(url: string): Promise<ScrapedContent> {
  const unavailableFields: string[] = [];

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

    // biome-ignore lint/suspicious/noExplicitAny: External JSON data from scraped HTML
    let jsonData: any = null;
    $("script#__UNIVERSAL_DATA_FOR_REHYDRATION__").each((_i, elem) => {
      try {
        const data = JSON.parse($(elem).html() ?? "");
        if (data?.__DEFAULT_SCOPE__?.["webapp.video-detail"]) {
          jsonData = data.__DEFAULT_SCOPE__["webapp.video-detail"];
        }
      } catch {
        // Try alternative JSON-LD format
      }
    });

    if (!jsonData) {
      $("script[type='application/ld+json']").each((_i, elem) => {
        try {
          const data = JSON.parse($(elem).html() ?? "");
          if (data["@type"] === "VideoObject") {
            jsonData = data;
          }
        } catch {
          // Ignore invalid JSON
        }
      });
    }

    const title = extractTitle($, jsonData, unavailableFields);
    const author = extractAuthor($, jsonData, url, unavailableFields);
    const { videoUrl, coverImageUrl } = extractMedia(
      $,
      jsonData,
      unavailableFields,
    );
    const engagement = extractEngagement($, jsonData, unavailableFields);
    const { hashtags, mentions } = extractHashtagsAndMentions(title);
    const timestamp = extractTimestamp($, jsonData, unavailableFields);
    const musicInfo = extractMusicInfo(jsonData, unavailableFields);

    return {
      platform: "tiktok",
      postId,
      url,
      title,
      author,
      videoUrl,
      coverImageUrl,
      engagement,
      hashtags,
      mentions,
      timestamp,
      musicInfo,
      location: null,
      isVideo: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape TikTok URL: ${error.message}`);
    }
    throw new Error("Failed to scrape TikTok URL: Unknown error");
  }
}

function extractTitle(
  $: cheerio.CheerioAPI,
  // biome-ignore lint/suspicious/noExplicitAny: External JSON data
  jsonData: any,
  unavailableFields: string[],
): string | null {
  if (jsonData?.itemInfo?.itemStruct?.desc) {
    return jsonData.itemInfo.itemStruct.desc;
  }

  if (jsonData?.description) {
    return jsonData.description;
  }

  const metaDescription = $('meta[property="og:description"]').attr("content");
  if (metaDescription) {
    return metaDescription;
  }

  const metaTitle = $('meta[name="description"]').attr("content");
  if (metaTitle) {
    return metaTitle;
  }

  unavailableFields.push("title");
  return null;
}

function extractAuthor(
  _$: cheerio.CheerioAPI,
  // biome-ignore lint/suspicious/noExplicitAny: External JSON data
  jsonData: any,
  url: string,
  unavailableFields: string[],
): ScrapedContent["author"] {
  let username = "";
  let displayName: string | null = null;
  let profileUrl = "";
  let avatarUrl: string | null = null;

  if (jsonData?.itemInfo?.itemStruct?.author) {
    const authorData = jsonData.itemInfo.itemStruct.author;
    username = authorData.uniqueId ?? authorData.id ?? "";
    displayName = authorData.nickname ?? null;
    profileUrl = `https://tiktok.com/@${username}`;
    avatarUrl = authorData.avatarThumb ?? authorData.avatarMedium ?? null;
  } else if (jsonData?.author) {
    username = jsonData.author.identifier?.value ?? jsonData.author.name ?? "";
    displayName = jsonData.author.name ?? null;
    profileUrl = jsonData.author.url ?? `https://tiktok.com/@${username}`;
    avatarUrl = jsonData.author.image ?? null;
  }

  if (!username) {
    const urlMatch = url.match(/\/@([^/]+)/);
    if (urlMatch) {
      username = urlMatch[1];
      profileUrl = `https://tiktok.com/@${username}`;
    } else {
      unavailableFields.push("author.username");
    }
  }

  if (!avatarUrl) {
    unavailableFields.push("author.avatarUrl");
  }

  if (!displayName) {
    unavailableFields.push("author.displayName");
  }

  return {
    username,
    displayName,
    profileUrl,
    avatarUrl,
  };
}

function extractMedia(
  $: cheerio.CheerioAPI,
  // biome-ignore lint/suspicious/noExplicitAny: External JSON data
  jsonData: any,
  unavailableFields: string[],
): { videoUrl: string | null; coverImageUrl: string | null } {
  let videoUrl: string | null = null;
  let coverImageUrl: string | null = null;

  if (jsonData?.itemInfo?.itemStruct?.video) {
    const videoData = jsonData.itemInfo.itemStruct.video;
    videoUrl = videoData.playAddr ?? videoData.downloadAddr ?? null;
    coverImageUrl = videoData.cover ?? videoData.dynamicCover ?? null;
  } else if (jsonData?.contentUrl) {
    videoUrl = jsonData.contentUrl;
    coverImageUrl = jsonData.thumbnailUrl ?? null;
  }

  if (!videoUrl) {
    const ogVideo = $('meta[property="og:video"]').attr("content");
    if (ogVideo) {
      videoUrl = ogVideo;
    } else {
      unavailableFields.push("videoUrl");
    }
  }

  if (!coverImageUrl) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) {
      coverImageUrl = ogImage;
    } else {
      unavailableFields.push("coverImageUrl");
    }
  }

  return { videoUrl, coverImageUrl };
}

function extractEngagement(
  _$: cheerio.CheerioAPI,
  // biome-ignore lint/suspicious/noExplicitAny: External JSON data
  jsonData: any,
  unavailableFields: string[],
): ScrapedContent["engagement"] {
  let likes: number | null = null;
  let comments: number | null = null;
  let shares: number | null = null;
  let views: number | null = null;

  if (jsonData?.itemInfo?.itemStruct?.stats) {
    const stats = jsonData.itemInfo.itemStruct.stats;
    likes = stats.diggCount ?? null;
    comments = stats.commentCount ?? null;
    shares = stats.shareCount ?? null;
    views = stats.playCount ?? null;
  } else if (jsonData?.interactionStatistic) {
    for (const stat of jsonData.interactionStatistic) {
      if (stat.interactionType === "http://schema.org/LikeAction") {
        likes = Number.parseInt(stat.userInteractionCount, 10);
      } else if (stat.interactionType === "http://schema.org/CommentAction") {
        comments = Number.parseInt(stat.userInteractionCount, 10);
      } else if (stat.interactionType === "http://schema.org/WatchAction") {
        views = Number.parseInt(stat.userInteractionCount, 10);
      }
    }
  }

  if (likes === null) {
    unavailableFields.push("engagement.likes");
  }
  if (comments === null) {
    unavailableFields.push("engagement.comments");
  }
  if (shares === null) {
    unavailableFields.push("engagement.shares");
  }
  if (views === null) {
    unavailableFields.push("engagement.views");
  }

  return {
    likes,
    comments,
    shares,
    views,
  };
}

function extractHashtagsAndMentions(text: string | null): {
  hashtags: string[];
  mentions: string[];
} {
  if (!text) {
    return { hashtags: [], mentions: [] };
  }

  const hashtags = Array.from(text.matchAll(/#(\w+)/g)).map((m) => m[1]);
  const mentions = Array.from(text.matchAll(/@(\w+)/g)).map((m) => m[1]);

  return { hashtags, mentions };
}

function extractTimestamp(
  _$: cheerio.CheerioAPI,
  // biome-ignore lint/suspicious/noExplicitAny: External JSON data
  jsonData: any,
  unavailableFields: string[],
): string | null {
  if (jsonData?.itemInfo?.itemStruct?.createTime) {
    return new Date(
      jsonData.itemInfo.itemStruct.createTime * 1000,
    ).toISOString();
  }

  if (jsonData?.uploadDate) {
    return new Date(jsonData.uploadDate).toISOString();
  }

  unavailableFields.push("timestamp");
  return null;
}

function extractMusicInfo(
  // biome-ignore lint/suspicious/noExplicitAny: External JSON data
  jsonData: any,
  unavailableFields: string[],
): ScrapedContent["musicInfo"] {
  if (jsonData?.itemInfo?.itemStruct?.music) {
    const music = jsonData.itemInfo.itemStruct.music;
    return {
      title: music.title ?? null,
      artist: music.authorName ?? null,
      url: music.playUrl ?? null,
    };
  }

  unavailableFields.push("musicInfo");
  return null;
}
