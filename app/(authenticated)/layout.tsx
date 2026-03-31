"use client";

import TopBar from "@/components/tree/TopBar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-void-black flex flex-col">
      <TopBar />
      {/* Content - pt-12 accounts for 48px fixed top bar */}
      <main className="flex-1 pt-12">{children}</main>
    </div>
  );
}
