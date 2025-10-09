# PRD: Social Media Scraper API (Instagram & TikTok)

## Introduction/Overview

This feature introduces a scraper/crawler API that accepts Instagram and TikTok post URLs as input and returns normalized, structured data about the content. The primary use case is content aggregation for a platform, enabling users to collect and display social media content in a unified format.

The scraper will extract essential metadata (title/description, author, video URL, cover image) along with engagement metrics, hashtags, timestamps, and other relevant information from public posts without requiring authentication.

## Goals

1. Provide a reliable API endpoint that accepts Instagram and TikTok single post URLs
2. Return normalized, type-safe data in a consistent format across both platforms
3. Extract comprehensive metadata including engagement metrics, hashtags, timestamps, and media information
4. Implement rate limiting to prevent IP blocking and ensure sustainable scraping
5. Handle errors gracefully by returning null/empty values for missing fields
6. Support only public content without authentication requirements

## User Stories

1. **As a platform user**, I want to input an Instagram post URL so that I can retrieve structured data about the post for display on my platform.

2. **As a platform user**, I want to input a TikTok video URL so that I can retrieve the same structured format as Instagram posts for consistent handling.

3. **As a developer**, I want a TypeScript-typed response so that I can safely work with the scraped data in my application code.

4. **As a system administrator**, I want the scraper to respect rate limits so that our service doesn't get blocked by Instagram or TikTok.

5. **As a developer**, I want clear error handling so that I can understand why a scrape failed and handle missing data gracefully.

## Functional Requirements

1. The system must accept a single Instagram post URL in the format `instagram.com/p/{post_id}` or `instagram.com/reel/{reel_id}`.

2. The system must accept a single TikTok video URL in the format `tiktok.com/@{username}/video/{video_id}`.

3. The system must validate the input URL format before attempting to scrape.

4. The system must persist scraped content to the database using the schema defined in the Design Considerations section.

5. The system must check if a URL has already been scraped (by checking the unique `url` field) and return cached data if available, unless a `force` parameter is provided.

6. The system must return a normalized TypeScript interface containing the following fields:
   - `platform`: "instagram" | "tiktok"
   - `postId`: string
   - `url`: string (original input URL)
   - `title`: string | null (description/caption)
   - `author`: object with `username`, `displayName`, `profileUrl`, `avatarUrl`
   - `videoUrl`: string | null
   - `coverImageUrl`: string | null
   - `engagement`: object with `likes`, `comments`, `shares`, `views` (all number | null)
   - `hashtags`: string[]
   - `mentions`: string[]
   - `timestamp`: ISO 8601 date string | null
   - `musicInfo`: object with `title`, `artist`, `url` (for TikTok, null for Instagram)
   - `location`: string | null
   - `isVideo`: boolean

7. The system must return null for any field that cannot be extracted rather than throwing errors.

8. The system must implement configurable rate limiting with the following defaults:
   - Maximum 10 requests per minute per IP
   - Configurable delay between requests (default: 6 seconds)
   - Exponential backoff for retries

9. The system must expose a REST API endpoint at `/api/scraper` accepting POST requests with JSON body containing `{ url: string, force?: boolean }`.

10. The system must return appropriate HTTP status codes:
   - 200: Success
   - 400: Invalid URL format
   - 429: Rate limit exceeded
   - 500: Internal server error

11. The system must log failed scraping attempts to the database for debugging and monitoring purposes (see requirements 15-18).

12. The system must work only with publicly accessible content (no authentication).

13. The system must handle platform-specific differences internally and return data in the unified format.

14. The system must update the `updatedAt` timestamp when re-scraping an existing URL with the `force` parameter.

15. The system must log all **failed** scraping attempts to the `scraping_logs` table with the following information:
    - URL and platform
    - Status (failed, rate_limited)
    - Scrape duration in milliseconds
    - HTTP status code
    - Error message and stack trace
    - Request metadata (IP, user agent, rate limit info)
    - List of unavailable fields that couldn't be extracted

16. The system must NOT log successful scraping attempts to reduce database storage overhead.

17. The system must track which fields were unavailable during scraping to detect platform API changes over time.

18. The system must link failed scraping logs to the `scraped_content` record if one exists (for re-scrape failures).

## Non-Goals (Out of Scope)

1. **Bulk scraping multiple URLs at once** - The API will only accept a single URL per request. Bulk operations should be implemented at the application layer if needed.

2. **Real-time monitoring/webhooks** - The system will not monitor posts for changes or provide webhook notifications. It's a one-time scrape per request.

3. **Analytics dashboard for scraped data** - Data visualization and analytics are handled by other parts of the application.

4. Scraping user profiles or multiple posts from a profile
5. Downloading or storing actual video files (only URLs are returned)
6. Authenticated scraping or private content access
7. Browser automation (prefer API/HTTP-based scraping where possible)
8. Scheduled/automated scraping jobs
9. Tracking scrape history (only the latest version of scraped content is stored)
9. Caching scraped results (can be added later if needed)

## Design Considerations

### TypeScript Interface

```typescript
interface ScrapedContent {
  platform: 'instagram' | 'tiktok';
  postId: string;
  url: string;
  title: string | null;
  author: {
    username: string;
    displayName: string | null;
    profileUrl: string;
    avatarUrl: string | null;
  };
  videoUrl: string | null;
  coverImageUrl: string | null;
  engagement: {
    likes: number | null;
    comments: number | null;
    shares: number | null;
    views: number | null;
  };
  hashtags: string[];
  mentions: string[];
  timestamp: string | null; // ISO 8601
  musicInfo: {
    title: string | null;
    artist: string | null;
    url: string | null;
  } | null;
  location: string | null;
  isVideo: boolean;
}

interface ScraperResponse {
  success: boolean;
  data: ScrapedContent | null;
  error: string | null;
}
```

### API Endpoint Design

- **Endpoint:** `POST /api/scraper`
- **Request Body:** `{ url: string, force?: boolean }`
  - `url`: The Instagram or TikTok post URL to scrape
  - `force`: Optional. If true, bypass cache and re-scrape the content
- **Response:** `ScraperResponse`

### Database Schema

The scraped content should be persisted in the database using Drizzle ORM. Below is the proposed schema:

```typescript
// db/schema.ts additions

import { pgTable, serial, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const platformEnum = pgEnum('platform', ['instagram', 'tiktok']);

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
```

```typescript
// Scraping logs table for tracking all scrape attempts (failed only)
export const scrapeStatusEnum = pgEnum('scrape_status', ['success', 'failed', 'rate_limited']);

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
  
  scrapedContentId: integer("scraped_content_id").references(() => scrapedContent.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Schema Notes:**

**scraped_content table:**
- `url` is unique to prevent duplicate scrapes
- `hashtags` and `mentions` stored as JSONB arrays for flexibility
- `musicInfo` stored as JSONB object (null for Instagram)
- Engagement metrics (likes, comments, shares, views) are nullable integers
- `postTimestamp` represents when the content was originally posted
- `createdAt`/`updatedAt` track when the record was scraped/updated
- Platform enum ensures type safety at database level

**scraping_logs table:**
- Only logs **failed attempts** for debugging purposes (success not logged to reduce storage)
- Foreign key to `scraped_content` (nullable since failed scrapes may not create content records)
- `scrapeDurationMs` tracks performance metrics
- `httpStatusCode` captures the response status from scraping attempt
- `errorMessage` and `errorStack` provide debugging information
- `requestMetadata` stores IP, user agent, and rate limit information
- `unavailableFields` tracks which fields couldn't be extracted (helps detect platform API changes)
- Indexed by `url` and `createdAt` for efficient failure analysis queries

### UI/UX Considerations

No UI components are required for this feature as it's a backend API. Future features may add a frontend interface for testing or bulk scraping.

## Technical Considerations

1. **Scraping Approach:** Consider using libraries like `cheerio` or `puppeteer` depending on whether the platforms require JavaScript rendering. Start with HTTP-based scraping for better performance.

2. **Rate Limiting:** Implement using middleware or a library like `express-rate-limit` or custom Next.js middleware.

3. **Error Handling:** Use try-catch blocks for external requests but return null values in the response rather than throwing errors to the client.

4. **Platform Detection:** Implement URL parsing to automatically detect whether the URL is Instagram or TikTok.

5. **Configuration:** Store rate limit settings and scraping parameters in environment variables or a configuration file.

6. **Legal/ToS Compliance:** Ensure compliance with Instagram and TikTok Terms of Service. Consider adding user-agent headers and respecting robots.txt.

7. **Dependencies:** May require libraries such as:
   - `axios` or `node-fetch` for HTTP requests
   - `cheerio` for HTML parsing
   - `zod` for runtime validation
   - Rate limiting library

8. **Next.js Integration:** Create API route at `app/api/scraper/route.ts` following Next.js 15 App Router conventions.

9. **Database Integration:** Use Drizzle ORM to interact with the database. The schema should be added to `db/schema.ts` and migrations generated using `npm run db:generate`.

10. **Caching Strategy:** Before scraping, query the database by URL. If found and `force` is not true, return the cached data. Otherwise, scrape fresh data and upsert to the database.

11. **Logging Strategy:** Only log failed scraping attempts to the `scraping_logs` table. Include performance metrics, error details, request metadata, and unavailable fields. This helps with debugging and detecting platform API changes without overwhelming the database with success logs.

12. **Performance Monitoring:** Track `scrapeDurationMs` for failed attempts to identify slow-performing URLs or platform issues.

13. **API Change Detection:** Use the `unavailableFields` array to detect when platform changes break field extraction, enabling proactive fixes.

## Success Metrics

1. **API Reliability:** 95%+ success rate for valid public post URLs
2. **Response Time:** Average response time under 3 seconds per scrape
3. **Error Rate:** Less than 5% error rate excluding invalid URLs
4. **Platform Coverage:** Successfully extract all required fields for both Instagram and TikTok
5. **Rate Limit Compliance:** Zero IP blocks from Instagram/TikTok due to rate limiting
6. **Type Safety:** Zero runtime type errors in production
7. **Failure Tracking:** All failed scrape attempts logged with complete diagnostic information
8. **API Change Detection:** Detect field unavailability within 24 hours of platform API changes

## Open Questions

1. What should the maximum timeout be for scraping requests before returning an error? 30 seconds.
2. Do we need to support Instagram Stories or IGTV URLs in the future? No.
3. What is the expected request volume, and should we implement a queueing system for high traffic? Not for now.
5. Should we support URL shorteners (bit.ly, etc.) or require canonical URLs only? Canonical only for now.
6. Do we need to implement proxy rotation for higher volume scraping in the future? Not for now.
7. Should we add a TTL (time-to-live) for cached data and automatically re-scrape after a certain period? No.
8. Do we need to track scrape history (multiple snapshots of the same URL over time) or just keep the latest version? Just the latest version.
