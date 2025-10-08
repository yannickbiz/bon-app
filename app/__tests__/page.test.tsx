import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../page";

global.fetch = vi.fn();

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders scraper interface", () => {
    render(<Home />);

    expect(screen.getByText("Social Media Scraper")).toBeTruthy();
    expect(screen.getByLabelText("URL")).toBeTruthy();
    expect(screen.getByText("Scrape URL")).toBeTruthy();
  });

  it("submits scraper request", async () => {
    const mockResponse = {
      success: true,
      data: {
        platform: "instagram",
        postId: "ABC123",
        url: "https://instagram.com/p/ABC123",
        title: "Test post",
        author: {
          username: "testuser",
          displayName: "Test User",
          profileUrl: "https://instagram.com/testuser",
          avatarUrl: null,
        },
        videoUrl: null,
        coverImageUrl: "https://example.com/cover.jpg",
        engagement: { likes: 100, comments: 10, shares: null, views: null },
        hashtags: ["test"],
        mentions: [],
        timestamp: null,
        musicInfo: null,
        location: null,
        isVideo: false,
      },
      error: null,
    };

    vi.mocked(fetch).mockResolvedValue({
      json: async () => mockResponse,
    } as Response);

    render(<Home />);

    const input = screen.getByLabelText("URL") as HTMLInputElement;
    const button = screen.getByText("Scrape URL");

    fireEvent.change(input, {
      target: { value: "https://instagram.com/p/ABC123" },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Scraped Data")).toBeTruthy();
      expect(screen.getByText("Platform:")).toBeTruthy();
      expect(screen.getByText("instagram")).toBeTruthy();
    });
  });

  it("displays error message on failure", async () => {
    const mockResponse = {
      success: false,
      data: null,
      error: "Invalid URL format",
    };

    vi.mocked(fetch).mockResolvedValue({
      json: async () => mockResponse,
    } as Response);

    render(<Home />);

    const input = screen.getByLabelText("URL") as HTMLInputElement;
    const button = screen.getByText("Scrape URL");

    fireEvent.change(input, { target: { value: "https://invalid.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeTruthy();
      expect(screen.getByText("Invalid URL format")).toBeTruthy();
    });
  });
});
