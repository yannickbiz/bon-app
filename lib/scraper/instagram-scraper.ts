import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedContent } from "./types";
import { extractPostId } from "./url-validator";

const TIMEOUT = 30000;

export async function scrapeInstagram(url: string): Promise<ScrapedContent> {
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

    let jsonData: any = null;
    $("script[type='application/ld+json']").each((_i, elem) => {
      try {
        const data = JSON.parse($(elem).html() ?? "");
        if (
          data["@type"] === "VideoObject" ||
          data["@type"] === "ImageObject"
        ) {
          jsonData = data;
        }
      } catch {
        // Ignore invalid JSON
      }
    });

    const title = extractTitle($, jsonData, unavailableFields);
    const author = extractAuthor($, jsonData, unavailableFields);
    const { videoUrl, coverImageUrl } = extractMedia(
      $,
      jsonData,
      unavailableFields,
    );
    const engagement = extractEngagement($, jsonData, unavailableFields);
    const { hashtags, mentions } = extractHashtagsAndMentions(title);
    const timestamp = extractTimestamp($, jsonData, unavailableFields);
    const location = extractLocation($, jsonData, unavailableFields);

    return {
      platform: "instagram",
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
      musicInfo: null,
      location,
      isVideo: videoUrl !== null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape Instagram URL: ${error.message}`);
    }
    throw new Error("Failed to scrape Instagram URL: Unknown error");
  }
}

function extractTitle(
  $: cheerio.CheerioAPI,
  jsonData: any,
  unavailableFields: string[],
): string | null {
  if (jsonData?.description) {
    return jsonData.description;
  }

  const metaDescription = $('meta[property="og:description"]').attr("content");
  if (metaDescription) {
    return metaDescription;
  }

  const metaTitle = $('meta[property="og:title"]').attr("content");
  if (metaTitle && metaTitle !== "Instagram") {
    return metaTitle;
  }

  unavailableFields.push("title");
  return null;
}

function extractAuthor(
  $: cheerio.CheerioAPI,
  jsonData: any,
  unavailableFields: string[],
): ScrapedContent["author"] {
  let username = "";
  let displayName: string | null = null;
  let profileUrl = "";
  let avatarUrl: string | null = null;

  if (jsonData?.author) {
    username = jsonData.author.identifier?.value ?? jsonData.author.name ?? "";
    displayName = jsonData.author.name ?? null;
    profileUrl = jsonData.author.url ?? `https://instagram.com/${username}`;
    avatarUrl = jsonData.author.image ?? null;
  }

  if (!username) {
    const urlMatch = $('meta[property="og:url"]')
      .attr("content")
      ?.match(/instagram\.com\/([^/]+)/);
    if (urlMatch) {
      username = urlMatch[1];
      profileUrl = `https://instagram.com/${username}`;
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
  jsonData: any,
  unavailableFields: string[],
): { videoUrl: string | null; coverImageUrl: string | null } {
  let videoUrl: string | null = null;
  let coverImageUrl: string | null = null;

  if (jsonData?.["@type"] === "VideoObject") {
    videoUrl = jsonData.contentUrl ?? null;
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
  jsonData: any,
  unavailableFields: string[],
): ScrapedContent["engagement"] {
  let likes: number | null = null;
  let comments: number | null = null;
  let views: number | null = null;

  if (jsonData?.interactionStatistic) {
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
  if (views === null) {
    unavailableFields.push("engagement.views");
  }

  return {
    likes,
    comments,
    shares: null,
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
  $: cheerio.CheerioAPI,
  jsonData: any,
  unavailableFields: string[],
): string | null {
  if (jsonData?.uploadDate) {
    return new Date(jsonData.uploadDate).toISOString();
  }

  const datePublished = $('meta[property="article:published_time"]').attr(
    "content",
  );
  if (datePublished) {
    return new Date(datePublished).toISOString();
  }

  unavailableFields.push("timestamp");
  return null;
}

function extractLocation(
  _$: cheerio.CheerioAPI,
  jsonData: any,
  unavailableFields: string[],
): string | null {
  if (jsonData?.contentLocation?.name) {
    return jsonData.contentLocation.name;
  }

  unavailableFields.push("location");
  return null;
}
