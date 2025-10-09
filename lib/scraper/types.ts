export type PlatformType = "instagram" | "tiktok";

export type ScrapeStatus = "success" | "failed" | "rate_limited";

export interface ScrapedContent {
  platform: PlatformType;
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
  timestamp: string | null;
  musicInfo: {
    title: string | null;
    artist: string | null;
    url: string | null;
  } | null;
}

export interface ScraperResponse {
  success: boolean;
  data: ScrapedContent | null;
  error: string | null;
}

export interface ScraperRequestBody {
  url: string;
  force?: boolean;
}
