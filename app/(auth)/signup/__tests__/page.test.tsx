import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as supabaseClient from "@/lib/supabase/client";
import SignupPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("SignupPage", () => {
  const mockPush = vi.fn();
  const mockSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
    (supabaseClient.createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    });
  });

  it("should render signup form with all elements", () => {
    render(<SignupPage />);

    expect(screen.getByRole("heading", { name: "Sign Up" })).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByText(/Must be at least 8 characters/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeTruthy();
    expect(screen.getByText("Already have an account? Sign in")).toBeTruthy();
  });

  it("should handle successful signup", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test123!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Test123!@#",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });

    expect(
      screen.getByText("Check your email to verify your account!"),
    ).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith("/verify");
  });

  it("should show error for invalid email", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "Test123!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show error for weak password (too short)", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test1!" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters long/),
      ).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show error for password without uppercase", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "test123!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one uppercase letter/),
      ).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show error for password without lowercase", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "TEST123!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one lowercase letter/),
      ).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show error for password without digit", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "TestTest!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one digit/),
      ).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show error for password without symbol", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test1234" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one symbol/),
      ).toBeTruthy();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show multiple password errors joined with period", async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "test" } });
    fireEvent.submit(form);

    await waitFor(() => {
      const errorText = screen.getByText(
        /Password must be at least 8 characters/,
      );
      expect(errorText.textContent).toContain(".");
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should handle signup error from Supabase", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "User already registered" },
    });
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test123!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("User already registered")).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should disable inputs and button while loading", async () => {
    mockSignUp.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 100),
        ),
    );
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test123!@#" } });
    fireEvent.submit(form);

    expect(
      screen.getByRole("button", { name: "Creating account..." }),
    ).toBeTruthy();
    expect(emailInput).toHaveProperty("disabled", true);
    expect(passwordInput).toHaveProperty("disabled", true);

    await waitFor(() => {
      expect(
        screen.getByText("Check your email to verify your account!"),
      ).toBeTruthy();
    });
  });

  it("should clear error and message on new submission", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Signup failed" } });
    render(<SignupPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = emailInput.closest("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test123!@#" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Signup failed")).toBeTruthy();
    });

    mockSignUp.mockResolvedValue({ error: null });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByText("Signup failed")).toBeFalsy();
      expect(
        screen.getByText("Check your email to verify your account!"),
      ).toBeTruthy();
    });
  });
});
