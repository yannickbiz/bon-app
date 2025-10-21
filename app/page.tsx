"use client";

import { useRouter } from "next/navigation";
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

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [_, setResult] = useState<ScraperResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ url }),
      });

      const data: ScraperResponse = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.error);
      } else if (data.recipeId) {
        router.push("/recipes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="container max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Recipe Extractor
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                Paste a tiktok or instagram link and instantly extract
                ingredients, instructions, and more!
              </p>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Extract from Social Media Content</CardTitle>
                <CardDescription>
                  Supports Instagram posts/reels and TikTok videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="url" hidden>
                      URL
                    </Label>
                    <Input
                      id="url"
                      type="text"
                      placeholder="https://instagram.com/p/ABC123 or https://tiktok.com/@user/video/123456"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Extracting recipe..." : "Extract Recipe"}
                  </Button>
                </form>

                {error && (
                  <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
              Note: Only works with public posts. Rate limited to 10 requests
              per minute.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
