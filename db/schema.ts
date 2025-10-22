import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
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

  postTimestamp: timestamp("post_timestamp"),

  musicInfo: jsonb("music_info").$type<{
    title: string | null;
    artist: string | null;
    url: string | null;
  } | null>(),

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

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    ingredients: jsonb("ingredients").$type<string[]>().notNull(),
    instructions: jsonb("instructions").$type<string[]>().notNull(),
    scrapedContentId: integer("scraped_content_id")
      .references(() => scrapedContent.id)
      .notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    aiProvider: text("ai_provider"),
    transcription: text("transcription"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueScrapedContent: unique().on(table.scrapedContentId),
  }),
);

export const userRecipes = pgTable(
  "user_recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => profiles.id)
      .notNull(),
    recipeId: uuid("recipe_id")
      .references(() => recipes.id)
      .notNull(),
    customTitle: text("custom_title"),
    customIngredients: jsonb("custom_ingredients").$type<string[]>(),
    customInstructions: jsonb("custom_instructions").$type<string[]>(),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userRecipeIdx: index("user_recipe_idx").on(table.userId, table.recipeId),
  }),
);

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => profiles.id)
      .notNull(),
    text: text("text").notNull(),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("todos_user_id_idx").on(table.userId),
    createdAtIdx: index("todos_created_at_idx").on(table.createdAt),
  }),
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => profiles.id)
      .notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    content: text("content").notNull().default(""),
    isPinned: boolean("is_pinned").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notes_user_id_idx").on(table.userId),
    userNotesIdx: index("notes_user_notes_idx").on(
      table.userId,
      table.isDeleted,
      table.isPinned,
      table.updatedAt,
    ),
  }),
);
