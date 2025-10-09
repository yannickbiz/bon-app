CREATE TYPE "public"."platform" AS ENUM('instagram', 'tiktok');--> statement-breakpoint
CREATE TYPE "public"."scrape_status" AS ENUM('success', 'failed', 'rate_limited');--> statement-breakpoint
CREATE TABLE "scraped_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" "platform" NOT NULL,
	"post_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"author_username" text NOT NULL,
	"author_display_name" text,
	"author_profile_url" text NOT NULL,
	"author_avatar_url" text,
	"video_url" text,
	"cover_image_url" text,
	"likes" integer,
	"comments" integer,
	"shares" integer,
	"views" integer,
	"hashtags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mentions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"post_timestamp" timestamp,
	"music_info" jsonb,
	"location" text,
	"is_video" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scraped_content_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "scraping_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"platform" "platform" NOT NULL,
	"status" "scrape_status" NOT NULL,
	"scrape_duration_ms" integer,
	"http_status_code" integer,
	"error_message" text,
	"error_stack" text,
	"request_metadata" jsonb,
	"unavailable_fields" jsonb,
	"scraped_content_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scraping_logs" ADD CONSTRAINT "scraping_logs_scraped_content_id_scraped_content_id_fk" FOREIGN KEY ("scraped_content_id") REFERENCES "public"."scraped_content"("id") ON DELETE no action ON UPDATE no action;