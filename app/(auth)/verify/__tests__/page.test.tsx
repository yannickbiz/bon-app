import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as supabaseClient from "@/lib/supabase/client";
import VerifyPage from "../page";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("VerifyPage", () => {
  const mockGetUser = vi.fn();
  const mockResend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseClient.createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: mockGetUser,
        resend: mockResend,
      },
    });
  });

  it("should render verification page with all elements", () => {
    render(<VerifyPage />);

    expect(
      screen.getByRole("heading", { name: "Verify Your Email" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/We've sent you a verification email/),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Resend Verification Email" }),
    ).toBeTruthy();
    expect(screen.getByText("Back to login")).toBeTruthy();
  });

  it("should successfully resend verification email", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });
    mockResend.mockResolvedValue({ error: null });

    render(<VerifyPage />);

    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });

    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
      expect(mockResend).toHaveBeenCalledWith({
        type: "signup",
        email: "test@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });

    expect(
      screen.getByText("Verification email sent! Check your inbox."),
    ).toBeTruthy();
  });

  it("should show error when no user is found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    render(<VerifyPage />);

    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });

    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(
        screen.getByText("No user found. Please sign up again."),
      ).toBeTruthy();
    });

    expect(mockResend).not.toHaveBeenCalled();
  });

  it("should show error when user has no email", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: null } } });

    render(<VerifyPage />);

    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });

    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(
        screen.getByText("No user found. Please sign up again."),
      ).toBeTruthy();
    });

    expect(mockResend).not.toHaveBeenCalled();
  });

  it("should handle resend error from Supabase", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });
    mockResend.mockResolvedValue({
      error: { message: "Email rate limit exceeded" },
    });

    render(<VerifyPage />);

    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });

    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText("Email rate limit exceeded")).toBeTruthy();
    });
  });

  it("should disable button while loading", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });
    mockResend.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 100),
        ),
    );

    render(<VerifyPage />);

    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });

    fireEvent.click(resendButton);

    expect(screen.getByRole("button", { name: "Sending..." })).toBeTruthy();
    expect(resendButton).toHaveProperty("disabled", true);

    await waitFor(() => {
      expect(
        screen.getByText("Verification email sent! Check your inbox."),
      ).toBeTruthy();
    });
  });

  it("should clear error and message on new resend attempt", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: "test@example.com" } },
    });
    mockResend.mockResolvedValue({
      error: { message: "Failed to send" },
    });

    render(<VerifyPage />);

    const resendButton = screen.getByRole("button", {
      name: "Resend Verification Email",
    });

    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to send")).toBeTruthy();
    });

    mockResend.mockResolvedValue({ error: null });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.queryByText("Failed to send")).toBeFalsy();
      expect(
        screen.getByText("Verification email sent! Check your inbox."),
      ).toBeTruthy();
    });
  });
});
