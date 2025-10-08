import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as supabaseServer from "@/lib/supabase/server";
import Home from "../page";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Home", () => {
  it("renders welcome message for unauthenticated users", async () => {
    (supabaseServer.createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
    );

    const Component = await Home();
    render(Component);

    expect(screen.getByText("Welcome to Bon App")).toBeTruthy();
    expect(screen.getByText("Sign In")).toBeTruthy();
    expect(screen.getByText("Sign Up")).toBeTruthy();
  });
});
