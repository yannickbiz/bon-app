import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as supabaseClient from "@/lib/supabase/client";
import ProfilePage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("ProfilePage", () => {
  const mockPush = vi.fn();
  const mockGetUser = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });

    mockSingle.mockResolvedValue({ data: null, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate });

    (supabaseClient.createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: mockGetUser,
        updateUser: mockUpdateUser,
        signOut: mockSignOut,
      },
      from: mockFrom,
    });
  });

  it("should redirect to login if user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should load and display user profile data", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockProfile = {
      id: "user-123",
      full_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
    };

    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeTruthy();
    });

    expect(
      screen.getByDisplayValue("https://example.com/avatar.jpg"),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("test@example.com")).toBeTruthy();
  });

  it("should update profile name and avatar", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({
      data: { full_name: "", avatar_url: "" },
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Full Name")).toBeTruthy();
    });

    const nameInput = screen.getByLabelText("Full Name");
    const avatarInput = screen.getByLabelText("Avatar URL");
    const updateButton = screen.getByRole("button", {
      name: /Update Profile/i,
    });

    fireEvent.change(nameInput, { target: { value: "New Name" } });
    fireEvent.change(avatarInput, {
      target: { value: "https://new-avatar.com/img.jpg" },
    });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully!")).toBeTruthy();
    });
  });

  it("should update password with validation", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("New Password")).toBeTruthy();
    });

    const passwordInput = screen.getByLabelText("New Password");
    const updatePasswordButton = screen.getByRole("button", {
      name: /Update Password/i,
    });

    fireEvent.change(passwordInput, { target: { value: "NewPass123!" } });
    fireEvent.click(updatePasswordButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "NewPass123!" });
    });

    expect(screen.getByText("Password updated successfully!")).toBeTruthy();
  });

  it("should show error for weak password", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("New Password")).toBeTruthy();
    });

    const passwordInput = screen.getByLabelText("New Password");
    const updatePasswordButton = screen.getByRole("button", {
      name: /Update Password/i,
    });

    fireEvent.change(passwordInput, { target: { value: "weak" } });
    fireEvent.click(updatePasswordButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/),
      ).toBeTruthy();
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("should update email address", async () => {
    const mockUser = { id: "user-123", email: "old@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("New Email")).toBeTruthy();
    });

    const emailInput = screen.getByLabelText("New Email");
    const updateEmailButton = screen.getByRole("button", {
      name: /Update Email/i,
    });

    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.click(updateEmailButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ email: "new@example.com" });
    });

    expect(screen.getByText(/Verification email sent/)).toBeTruthy();
  });

  it("should disable email update button when email unchanged", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("New Email")).toBeTruthy();
    });

    const updateEmailButton = screen.getByRole("button", {
      name: /Update Email/i,
    });
    expect(updateEmailButton).toHaveProperty("disabled", true);
  });

  it("should show delete account confirmation dialog", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Delete Account" }),
      ).toBeTruthy();
    });

    const deleteButton = screen.getByRole("button", { name: "Delete Account" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to delete your account/),
      ).toBeTruthy();
    });

    expect(
      screen.getByRole("button", { name: /Yes, Delete My Account/i }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("should delete account and sign out", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockSignOut.mockResolvedValue({ error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Delete Account" }),
      ).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Yes, Delete My Account/i }),
      ).toBeTruthy();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Yes, Delete My Account/i }),
    );

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should cancel account deletion", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Delete Account" }),
      ).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText(/Are you sure/)).toBeFalsy();
    });

    expect(screen.getByRole("button", { name: "Delete Account" })).toBeTruthy();
  });

  it("should handle logout", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockSingle.mockResolvedValue({ data: {}, error: null });
    mockSignOut.mockResolvedValue({ error: null });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Logout" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should display loading state initially", () => {
    mockGetUser.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ProfilePage />);

    expect(screen.getByText("Loading...")).toBeTruthy();
  });
});
