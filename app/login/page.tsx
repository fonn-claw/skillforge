"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-void-black/80" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-forge-gray border border-steel-edge rounded-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/logo.svg"
              alt="SkillForge"
              width={200}
              height={48}
              priority
            />
          </div>

          {/* Heading */}
          <h1 className="font-heading text-2xl text-moonlight text-center mb-8">
            Welcome Back, Adventurer
          </h1>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-blood-ruby/10 border border-blood-ruby/30 text-blood-ruby text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-mist mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-void-black border border-steel-edge rounded-lg text-moonlight placeholder:text-mist/50 focus:outline-none focus:border-arcane-blue transition-colors"
                placeholder="learner@skillforge.app"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-mist mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-void-black border border-steel-edge rounded-lg text-moonlight placeholder:text-mist/50 focus:outline-none focus:border-arcane-blue transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-arcane-blue hover:bg-arcane-blue/80 disabled:opacity-50 rounded-lg text-moonlight font-heading text-lg transition-colors"
            >
              {loading ? "Entering..." : "Enter the Forge"}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-mist">
            New to the forge?{" "}
            <a
              href="/register"
              className="text-arcane-blue hover:text-arcane-blue/80 transition-colors"
            >
              Create your account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
