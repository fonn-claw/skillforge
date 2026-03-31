"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Star, LogOut, BarChart3, ClipboardCheck } from "lucide-react";
import { useMentorContext } from "./MentorContext";

type UserData = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  archetypeId: string | null;
  archetype: {
    name: string;
    color: string;
    iconKey: string;
  } | null;
};

type NodeSummary = {
  id: string;
  mastery: { currentLevel: string } | null;
};

export default function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const { heatmapMode, setHeatmapMode, reviewPanelOpen, setReviewPanelOpen } = useMentorContext();
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: UserData) => setUser(data))
      .catch(() => {});

    fetch("/api/tree/nodes")
      .then((r) => r.json())
      .then((nodes: NodeSummary[]) => {
        const total = nodes.length;
        const completed = nodes.filter(
          (n) => n.mastery && n.mastery.currentLevel !== "locked"
        ).length;
        setProgress({ completed, total });
      })
      .catch(() => {});
  }, []);

  // Fetch pending review count for mentors
  useEffect(() => {
    if (!user || (user.role !== "mentor" && user.role !== "admin")) return;
    fetch("/api/mentor/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((reviews: unknown[]) => setPendingReviewCount(reviews.length))
      .catch(() => {});
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const archetype = user?.archetype;
  const initial = user?.displayName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-4 bg-[#151A28]/90 backdrop-blur-md border-b border-steel-edge">
      {/* Left: menu + logo */}
      <div className="flex items-center gap-3">
        <button className="text-mist hover:text-moonlight transition-colors">
          <Menu size={20} />
        </button>
        <img
          src="/assets/logo.svg"
          alt="SkillForge"
          width={120}
          height={29}
          className="h-[29px] w-auto"
        />
      </div>

      {/* Center: archetype badge + progress */}
      <div className="flex items-center gap-3">
        {archetype ? (
          <>
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-full border"
              style={{ borderColor: archetype.color }}
            >
              <img
                src={`/assets/icon-archetype-${archetype.iconKey}.svg`}
                alt={archetype.name}
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span
                className="text-sm font-heading capitalize hidden md:inline"
                style={{ color: archetype.color }}
              >
                {archetype.name}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-sm text-mist">
              <Star size={14} className="text-ember-gold" />
              <span>
                {progress.completed}/{progress.total}
              </span>
            </div>
          </>
        ) : (
          <span className="text-sm text-mist hidden md:inline">
            No archetype
          </span>
        )}
      </div>

      {/* Right: mentor controls + avatar + logout */}
      <div className="flex items-center gap-3">
        {/* Mentor/Admin: heatmap toggle + review button */}
        {user && (user.role === "mentor" || user.role === "admin") && (
          <>
            <button
              onClick={() => setHeatmapMode(!heatmapMode)}
              className={`relative p-1.5 rounded transition-colors ${
                heatmapMode
                  ? "bg-arcane-blue/20 text-arcane-blue"
                  : "text-mist hover:text-moonlight"
              }`}
              title={heatmapMode ? "Disable heatmap" : "Enable heatmap"}
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setReviewPanelOpen(!reviewPanelOpen)}
              className={`relative p-1.5 rounded transition-colors ${
                reviewPanelOpen
                  ? "bg-arcane-blue/20 text-arcane-blue"
                  : "text-mist hover:text-moonlight"
              }`}
              title="Review submissions"
            >
              <ClipboardCheck size={18} />
              {pendingReviewCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ember-gold text-void-black text-[10px] font-bold flex items-center justify-center">
                  {pendingReviewCount > 9 ? "9+" : pendingReviewCount}
                </span>
              )}
            </button>
          </>
        )}

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-moonlight font-heading text-sm shrink-0"
          style={{
            backgroundColor: archetype?.color ?? "#1E2438",
          }}
        >
          {initial}
        </div>
        <button
          onClick={handleLogout}
          className="text-mist hover:text-moonlight transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
