import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as supabaseClient from "@/lib/supabase/client";
import ResetPasswordPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("ResetPasswordPage", () => {
  const mockPush = vi.fn();
  const mockResetPasswordForEmail = vi.fn();
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
      get: () => null,
    });
    (supabaseClient.createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
        updateUser: mockUpdateUser,
      },
    });
  });

  describe("Forgot Password Flow", () => {
    it("should render forgot password form with all elements", () => {
      render(<ResetPasswordPage />);

      expect(
        screen.getByRole("heading", { name: "Forgot Password" }),
      ).toBeTruthy();
      expect(
        screen.getByText("Enter your email to receive a password reset link"),
      ).toBeTruthy();
      expect(screen.getByLabelText("Email")).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Send Reset Link" }),
      ).toBeTruthy();
      expect(screen.getByText("Back to login")).toBeTruthy();
    });

    it("should handle successful forgot password request", async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null });
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText("Email");
      const form = emailInput.closest("form") as HTMLFormElement;

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
          "test@example.com",
          {
            redirectTo: expect.stringContaining(
              "/reset-password?type=recovery",
            ),
          },
        );
      });

      expect(
        screen.getByText("Password reset link sent! Check your email."),
      ).toBeTruthy();
    });

    it("should show error for invalid email", async () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText("Email");
      const form = emailInput.closest("form") as HTMLFormElement;

      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address"),
        ).toBeTruthy();
      });

      expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
    });

    it("should handle error from Supabase", async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        error: { message: "Email not found" },
      });
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText("Email");
      const form = emailInput.closest("form") as HTMLFormElement;

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Email not found")).toBeTruthy();
      });
    });

    it("should disable input and button while loading", async () => {
      mockResetPasswordForEmail.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ error: null }), 100),
          ),
      );
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText("Email");
      const form = emailInput.closest("form") as HTMLFormElement;

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(form);

      expect(screen.getByRole("button", { name: "Sending..." })).toBeTruthy();
      expect(emailInput).toHaveProperty("disabled", true);

      await waitFor(() => {
        expect(
          screen.getByText("Password reset link sent! Check your email."),
        ).toBeTruthy();
      });
    });

    it("should clear error and message on new submission", async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        error: { message: "Failed to send" },
      });
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText("Email");
      const form = emailInput.closest("form") as HTMLFormElement;

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Failed to send")).toBeTruthy();
      });

      mockResetPasswordForEmail.mockResolvedValue({ error: null });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText("Failed to send")).toBeFalsy();
        expect(
          screen.getByText("Password reset link sent! Check your email."),
        ).toBeTruthy();
      });
    });
  });
});
