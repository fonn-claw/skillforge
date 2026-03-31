"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/");
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
            Begin Your Journey
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
              <label
                htmlFor="displayName"
                className="block text-sm text-mist mb-1.5"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-void-black border border-steel-edge rounded-lg text-moonlight placeholder:text-mist/50 focus:outline-none focus:border-arcane-blue transition-colors"
                placeholder="Your adventurer name"
              />
            </div>

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
                placeholder="you@example.com"
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
                minLength={6}
                className="w-full px-4 py-3 bg-void-black border border-steel-edge rounded-lg text-moonlight placeholder:text-mist/50 focus:outline-none focus:border-arcane-blue transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-arcane-blue hover:bg-arcane-blue/80 disabled:opacity-50 rounded-lg text-moonlight font-heading text-lg transition-colors"
            >
              {loading ? "Forging..." : "Forge Your Path"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-mist">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-arcane-blue hover:text-arcane-blue/80 transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
