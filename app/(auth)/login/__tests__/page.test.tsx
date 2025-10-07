import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as supabaseClient from "@/lib/supabase/client";
import LoginPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("LoginPage", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockSignInWithOtp = vi.fn();
  const mockSignInWithPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (supabaseClient.createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signInWithOtp: mockSignInWithOtp,
        signInWithPassword: mockSignInWithPassword,
      },
    });
  });

  it("should render login form with all elements", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign In")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Send Magic Link" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Sign In with Password" }),
    ).toBeTruthy();
    expect(screen.getByText("Forgot password?")).toBeTruthy();
    expect(screen.getByText("Don't have an account? Sign up")).toBeTruthy();
  });

  it("should handle magic link submission with valid email", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Magic Link",
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });

    expect(
      screen.getByText("Check your email for the magic link!"),
    ).toBeTruthy();
  });

  it("should show error for invalid email on magic link", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeTruthy();
    });

    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("should handle magic link error from Supabase", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: "Email not found" },
    });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Magic Link",
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email not found")).toBeTruthy();
    });
  });

  it("should handle password login with valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: "Sign In with Password",
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should show error for invalid email on password login", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: "Sign In with Password",
    });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeTruthy();
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("should show error when password is empty", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = passwordInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Please enter your password")).toBeTruthy();
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("should handle password login error from Supabase", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: "Sign In with Password",
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should disable inputs and buttons while loading", async () => {
    mockSignInWithOtp.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 100),
        ),
    );
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const magicLinkButton = screen.getByRole("button", {
      name: "Send Magic Link",
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(magicLinkButton);

    expect(screen.getByRole("button", { name: "Sending..." })).toBeTruthy();
    expect(emailInput).toHaveProperty("disabled", true);

    await waitFor(() => {
      expect(
        screen.getByText("Check your email for the magic link!"),
      ).toBeTruthy();
    });
  });

  it("should clear error and message on new submission", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: "Error occurred" },
    });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: "Send Magic Link",
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error occurred")).toBeTruthy();
    });

    mockSignInWithOtp.mockResolvedValue({ error: null });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Error occurred")).toBeFalsy();
      expect(
        screen.getByText("Check your email for the magic link!"),
      ).toBeTruthy();
    });
  });
});
