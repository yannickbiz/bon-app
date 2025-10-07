"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for the magic link!");
    }

    setIsLoading(false);
  }

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-center">Sign In</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <form onSubmit={handleMagicLink} className="space-y-4">
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
              {isLoading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white">Or continue with password</span>
            </div>
          </div>

          <form onSubmit={handleEmailPassword} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In with Password"}
            </button>
          </form>

          <div className="text-center space-y-2">
            <a
              href="/reset-password"
              className="text-sm text-blue-600 hover:underline block"
            >
              Forgot password?
            </a>
            <a
              href="/signup"
              className="text-sm text-blue-600 hover:underline block"
            >
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
