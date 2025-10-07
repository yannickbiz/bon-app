"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleResendVerification() {
    setIsLoading(true);
    setError("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setError("No user found. Please sign up again.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Verification email sent! Check your inbox.");
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent you a verification email. Please check your inbox and
            click the link to verify your account.
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

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </button>

          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
