"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ScraperResponse } from "@/lib/scraper/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScraperResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, force }),
      });

      const data: ScraperResponse = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="container max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Social Media Scraper
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                Extract metadata from Instagram and TikTok posts. Enter a URL
                below to get started.
              </p>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Scrape Social Media Content</CardTitle>
                <CardDescription>
                  Supports Instagram posts/reels and TikTok videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => handleSubmit(e, false)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="text"
                      placeholder="https://instagram.com/p/ABC123 or https://tiktok.com/@user/video/123456"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Scraping..." : "Scrape URL"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={(e) => handleSubmit(e, true)}
                    >
                      Force Re-scrape
                    </Button>
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {result?.success && result.data && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-muted rounded-md">
                      <h3 className="font-semibold mb-2">Scraped Data</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Platform:</span>{" "}
                          {result.data.platform}
                        </div>
                        <div>
                          <span className="font-medium">Post ID:</span>{" "}
                          {result.data.postId}
                        </div>
                        {result.data.title && (
                          <div>
                            <span className="font-medium">Title:</span>{" "}
                            {result.data.title}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Author:</span>{" "}
                          {result.data.author.username}
                          {result.data.author.displayName &&
                            ` (${result.data.author.displayName})`}
                        </div>
                        {result.data.hashtags.length > 0 && (
                          <div>
                            <span className="font-medium">Hashtags:</span>{" "}
                            {result.data.hashtags
                              .map((tag) => `#${tag}`)
                              .join(", ")}
                          </div>
                        )}
                        {result.data.engagement.likes !== null && (
                          <div>
                            <span className="font-medium">Likes:</span>{" "}
                            {result.data.engagement.likes.toLocaleString()}
                          </div>
                        )}
                        {result.data.engagement.comments !== null && (
                          <div>
                            <span className="font-medium">Comments:</span>{" "}
                            {result.data.engagement.comments.toLocaleString()}
                          </div>
                        )}
                        {result.data.engagement.views !== null && (
                          <div>
                            <span className="font-medium">Views:</span>{" "}
                            {result.data.engagement.views.toLocaleString()}
                          </div>
                        )}
                        {result.data.musicInfo && (
                          <div>
                            <span className="font-medium">Music:</span>{" "}
                            {result.data.musicInfo.title}
                            {result.data.musicInfo.artist &&
                              ` by ${result.data.musicInfo.artist}`}
                          </div>
                        )}
                      </div>

                      {(result.data.coverImageUrl || result.data.videoUrl) && (
                        <div className="mt-4 space-y-2">
                          {result.data.coverImageUrl && (
                            <div>
                              <span className="font-medium">Cover Image:</span>
                              {/* biome-ignore lint/performance/noImgElement: External image URL from scraped content */}
                              <img
                                src={result.data.coverImageUrl}
                                alt="Cover"
                                className="mt-2 max-w-full h-auto rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">
                        View Raw JSON
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
              Note: This scraper only works with public posts. Rate limited to
              10 requests per minute.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
