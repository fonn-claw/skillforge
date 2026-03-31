"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-void-black flex flex-col">
      {/* Top bar */}
      <header className="h-12 flex items-center justify-between px-4 bg-forge-gray/80 border-b border-steel-edge backdrop-blur-sm shrink-0">
        <Image
          src="/assets/logo.svg"
          alt="SkillForge"
          width={120}
          height={29}
        />
        <button
          onClick={handleLogout}
          className="text-sm text-mist hover:text-moonlight transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
