"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "recovery") {
      setIsResetMode(true);
    }
  }, [searchParams]);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?type=recovery`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset link sent! Check your email.");
    }

    setIsLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-center">Reset Password</h1>
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

          <form onSubmit={handleResetPassword} className="space-y-4">
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
                required
                className="w-full px-3 py-2 border rounded"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, digit,
                and symbol
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
          <p className="text-center text-gray-600 mt-2">
            Enter your email to receive a password reset link
          </p>
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

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <a href="/login" className="text-sm text-blue-600 hover:underline">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
