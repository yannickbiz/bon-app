import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const platformEnum = pgEnum("platform", ["instagram", "tiktok"]);

export const scrapeStatusEnum = pgEnum("scrape_status", [
  "success",
  "failed",
  "rate_limited",
]);

export const scrapedContent = pgTable("scraped_content", {
  id: serial("id").primaryKey(),
  platform: platformEnum("platform").notNull(),
  postId: text("post_id").notNull(),
  url: text("url").notNull().unique(),
  title: text("title"),

  authorUsername: text("author_username").notNull(),
  authorDisplayName: text("author_display_name"),
  authorProfileUrl: text("author_profile_url").notNull(),
  authorAvatarUrl: text("author_avatar_url"),

  videoUrl: text("video_url"),
  coverImageUrl: text("cover_image_url"),

  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  views: integer("views"),

  hashtags: jsonb("hashtags").$type<string[]>().notNull().default([]),
  mentions: jsonb("mentions").$type<string[]>().notNull().default([]),

  postTimestamp: timestamp("post_timestamp"),

  musicInfo: jsonb("music_info").$type<{
    title: string | null;
    artist: string | null;
    url: string | null;
  } | null>(),

  location: text("location"),
  isVideo: boolean("is_video").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scrapingLogs = pgTable("scraping_logs", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  platform: platformEnum("platform").notNull(),
  status: scrapeStatusEnum("status").notNull(),

  scrapeDurationMs: integer("scrape_duration_ms"),
  httpStatusCode: integer("http_status_code"),
  errorMessage: text("error_message"),
  errorStack: text("error_stack"),

  requestMetadata: jsonb("request_metadata").$type<{
    ip: string | null;
    userAgent: string | null;
    rateLimitRemaining: number | null;
    rateLimitReset: string | null;
  }>(),

  unavailableFields: jsonb("unavailable_fields").$type<string[]>(),

  scrapedContentId: integer("scraped_content_id").references(
    () => scrapedContent.id,
  ),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
