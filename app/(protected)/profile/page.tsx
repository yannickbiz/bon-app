"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validatePassword } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [_profile, setProfile] = useState<{
    full_name?: string;
    avatar_url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [_currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setNewEmail(user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setAvatarUrl(profileData.avatar_url || "");
      }

      setLoading(false);
    }

    loadUserData();
  }, [router, supabase]);

  async function handleUpdateProfile() {
    setIsUpdating(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Profile updated successfully!");
    }

    setIsUpdating(false);
  }

  async function handleUpdatePassword() {
    setIsUpdating(true);
    setError("");
    setMessage("");

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      setIsUpdating(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    }

    setIsUpdating(false);
  }

  async function handleUpdateEmail() {
    setIsUpdating(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(
        "Verification email sent to your new address. Please confirm to complete the change.",
      );
    }

    setIsUpdating(false);
  }

  async function handleDeleteAccount() {
    setIsUpdating(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setIsUpdating(false);
    } else {
      await supabase.auth.signOut();
      router.push("/login");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
            {message}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium mb-2"
            >
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isUpdating}
            />
          </div>

          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Change Password</h2>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-2"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isUpdating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, digit,
              and symbol
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={isUpdating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Change Email</h2>

          <div>
            <label
              htmlFor="newEmail"
              className="block text-sm font-medium mb-2"
            >
              New Email
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isUpdating}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can change your email once per 24 hours
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpdateEmail}
            disabled={isUpdating || newEmail === user?.email}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Email"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isUpdating}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isUpdating ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
