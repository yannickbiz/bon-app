import type { PlatformType } from "./types";

export function isInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    if (hostname !== "instagram.com") {
      return false;
    }

    const pathname = urlObj.pathname;
    return /^\/(p|reel)\/[A-Za-z0-9_-]+\/?$/.test(pathname);
  } catch {
    return false;
  }
}

export function isTikTokUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    if (hostname !== "tiktok.com") {
      return false;
    }

    const pathname = urlObj.pathname;
    return /^\/@[A-Za-z0-9._-]+\/video\/\d+\/?$/.test(pathname);
  } catch {
    return false;
  }
}

export function validateUrl(url: string): PlatformType | null {
  if (isInstagramUrl(url)) {
    return "instagram";
  }

  if (isTikTokUrl(url)) {
    return "tiktok";
  }

  return null;
}

export function extractPostId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const instagramMatch = pathname.match(/^\/(p|reel)\/([A-Za-z0-9_-]+)/);
    if (instagramMatch) {
      return instagramMatch[2];
    }

    const tiktokMatch = pathname.match(/\/video\/(\d+)/);
    if (tiktokMatch) {
      return tiktokMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}
