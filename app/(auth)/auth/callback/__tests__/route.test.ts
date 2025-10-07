import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as supabaseServer from "@/lib/supabase/server";
import { GET } from "../route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Auth Callback Route", () => {
  const mockExchangeCodeForSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseServer.createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        auth: {
          exchangeCodeForSession: mockExchangeCodeForSession,
        },
      },
    );
  });

  it("should redirect to login with error when error param is present", async () => {
    const request = new NextRequest(
      "http://localhost:3000/auth/callback?error=access_denied&error_description=User%20cancelled",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=User%20cancelled",
    );
  });

  it("should redirect to login with error code when no description provided", async () => {
    const request = new NextRequest(
      "http://localhost:3000/auth/callback?error=access_denied",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=access_denied",
    );
  });

  it("should exchange code for session and redirect to default path", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-auth-code",
    );

    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-auth-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("should redirect to custom next path after successful authentication", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-auth-code&next=/profile",
    );

    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-auth-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/profile",
    );
  });

  it("should redirect to login when code exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "Invalid code" },
    });

    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=invalid-code",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=Invalid%20code",
    );
  });

  it("should use forwarded host in production when x-forwarded-host header is present", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-auth-code&next=/dashboard",
    );
    request.headers.set("x-forwarded-host", "example.com");

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/dashboard",
    );

    process.env.NODE_ENV = originalEnv;
  });

  it("should use request origin in development environment", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-auth-code",
    );
    request.headers.set("x-forwarded-host", "example.com");

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");

    process.env.NODE_ENV = originalEnv;
  });

  it("should redirect to login when no code or error is provided", async () => {
    const request = new NextRequest("http://localhost:3000/auth/callback");

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("should handle URL encoded special characters in error messages", async () => {
    const request = new NextRequest(
      "http://localhost:3000/auth/callback?error=invalid_request&error_description=Something%20went%20wrong%21",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=Something%20went%20wrong!",
    );
  });
});
