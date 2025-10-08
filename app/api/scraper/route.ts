import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getCachedContent,
  logFailedScrape,
  upsertScrapedContent,
} from "@/lib/scraper/database";
import { scrapeInstagram } from "@/lib/scraper/instagram-scraper";
import { checkRateLimit } from "@/lib/scraper/rate-limiter";
import { scrapeTikTok } from "@/lib/scraper/tiktok-scraper";
import type { ScraperResponse } from "@/lib/scraper/types";
import { validateUrl } from "@/lib/scraper/url-validator";

const requestSchema = z.object({
  url: z.string().min(1),
  force: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestBody: z.infer<typeof requestSchema>;

  try {
    requestBody = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error:
          "Invalid request body. Expected { url: string, force?: boolean }",
      } satisfies ScraperResponse,
      { status: 400 },
    );
  }

  const { url, force = false } = requestBody;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Rate limit exceeded. Please try again later.",
      } satisfies ScraperResponse,
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.reset,
        },
      },
    );
  }

  const platform = validateUrl(url);

  if (!platform) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error:
          "Invalid URL format. Expected Instagram post/reel or TikTok video URL.",
      } satisfies ScraperResponse,
      {
        status: 400,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset,
        },
      },
    );
  }

  if (!force) {
    try {
      const cached = await getCachedContent(url);
      if (cached) {
        return NextResponse.json(
          {
            success: true,
            data: cached,
            error: null,
          } satisfies ScraperResponse,
          {
            status: 200,
            headers: {
              "X-RateLimit-Remaining": rateLimit.remaining.toString(),
              "X-RateLimit-Reset": rateLimit.reset,
            },
          },
        );
      }
    } catch (error) {
      console.error("Cache lookup error:", error);
    }
  }

  try {
    const scrapedData =
      platform === "instagram"
        ? await scrapeInstagram(url)
        : await scrapeTikTok(url);

    await upsertScrapedContent(scrapedData);

    return NextResponse.json(
      {
        success: true,
        data: scrapedData,
        error: null,
      } satisfies ScraperResponse,
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset,
        },
      },
    );
  } catch (error) {
    const scrapeDurationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    try {
      await logFailedScrape({
        url,
        platform,
        status: "failed",
        scrapeDurationMs,
        errorMessage,
        errorStack,
        requestMetadata: {
          ip,
          userAgent: request.headers.get("user-agent"),
          rateLimitRemaining: rateLimit.remaining,
          rateLimitReset: rateLimit.reset,
        },
        unavailableFields: [],
      });
    } catch (logError) {
      console.error("Failed to log scraping error:", logError);
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Failed to scrape URL: ${errorMessage}`,
      } satisfies ScraperResponse,
      {
        status: 500,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset,
        },
      },
    );
  }
}
