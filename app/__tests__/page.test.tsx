import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../page";

global.fetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as never);
  });

  it("renders scraper interface", () => {
    render(<Home />);
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
    const button = screen.getByText("Extract Recipe");

    fireEvent.change(input, { target: { value: "https://invalid.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeTruthy();
      expect(screen.getByText("Invalid URL format")).toBeTruthy();
    });
  });
});
