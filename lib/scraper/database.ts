import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scrapedContent, scrapingLogs } from "@/db/schema";
import type { PlatformType, ScrapedContent, ScrapeStatus } from "./types";

export async function getCachedContent(
  url: string,
): Promise<ScrapedContent | null> {
  const result = await db
    .select()
    .from(scrapedContent)
    .where(eq(scrapedContent.url, url))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return transformDbToScrapedContent(result[0]);
}

export async function upsertScrapedContent(
  content: ScrapedContent,
): Promise<void> {
  const dbData = transformScrapedContentToDb(content);

  await db
    .insert(scrapedContent)
    .values(dbData)
    .onConflictDoUpdate({
      target: scrapedContent.url,
      set: {
        ...dbData,
        updatedAt: new Date(),
      },
    });
}

export interface FailedScrapeLog {
  url: string;
  platform: PlatformType;
  status: ScrapeStatus;
  scrapeDurationMs?: number;
  httpStatusCode?: number;
  errorMessage?: string;
  errorStack?: string;
  requestMetadata?: {
    ip: string | null;
    userAgent: string | null;
    rateLimitRemaining: number | null;
    rateLimitReset: string | null;
  };
  unavailableFields?: string[];
  scrapedContentId?: number;
}

export async function logFailedScrape(log: FailedScrapeLog): Promise<void> {
  await db.insert(scrapingLogs).values({
    url: log.url,
    platform: log.platform,
    status: log.status,
    scrapeDurationMs: log.scrapeDurationMs,
    httpStatusCode: log.httpStatusCode,
    errorMessage: log.errorMessage,
    errorStack: log.errorStack,
    requestMetadata: log.requestMetadata,
    unavailableFields: log.unavailableFields,
    scrapedContentId: log.scrapedContentId,
  });
}

function transformDbToScrapedContent(
  row: typeof scrapedContent.$inferSelect,
): ScrapedContent {
  return {
    platform: row.platform as PlatformType,
    postId: row.postId,
    url: row.url,
    title: row.title,
    author: {
      username: row.authorUsername,
      displayName: row.authorDisplayName,
      profileUrl: row.authorProfileUrl,
      avatarUrl: row.authorAvatarUrl,
    },
    videoUrl: row.videoUrl,
    coverImageUrl: row.coverImageUrl,
    engagement: {
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      views: row.views,
    },
    hashtags: row.hashtags as string[],
    timestamp: row.postTimestamp?.toISOString() ?? null,
    musicInfo: row.musicInfo as {
      title: string | null;
      artist: string | null;
      url: string | null;
    } | null,
  };
}

function transformScrapedContentToDb(content: ScrapedContent) {
  return {
    platform: content.platform,
    postId: content.postId,
    url: content.url,
    title: content.title,
    authorUsername: content.author.username,
    authorDisplayName: content.author.displayName,
    authorProfileUrl: content.author.profileUrl,
    authorAvatarUrl: content.author.avatarUrl,
    videoUrl: content.videoUrl,
    coverImageUrl: content.coverImageUrl,
    likes: content.engagement.likes,
    comments: content.engagement.comments,
    shares: content.engagement.shares,
    views: content.engagement.views,
    hashtags: content.hashtags,
    postTimestamp: content.timestamp ? new Date(content.timestamp) : null,
    musicInfo: content.musicInfo,
  };
}
