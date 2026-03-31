"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Star,
  LogOut,
  BarChart3,
  ClipboardCheck,
  Settings,
  X,
  User,
  Map,
  BookOpen,
} from "lucide-react";
import { useMentorContext } from "./MentorContext";
import AdminPanel from "@/components/admin/AdminPanel";

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
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const archetype = user?.archetype;
  const isMentorOrAdmin = user?.role === "mentor" || user?.role === "admin";
  const isAdmin = user?.role === "admin";
  const initial = user?.displayName?.charAt(0)?.toUpperCase() ?? "?";

  const roleBadge = isAdmin
    ? { label: "Admin", color: "#F0A830" }
    : isMentorOrAdmin
      ? { label: "Mentor", color: "#4A7CFF" }
      : { label: "Learner", color: "#34D399" };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-4 bg-[#151A28]/90 backdrop-blur-md border-b border-steel-edge">
      {/* Left: menu + logo */}
      <div className="flex items-center gap-3 relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`p-1 rounded transition-colors ${
            menuOpen ? "text-moonlight bg-anvil-gray" : "text-mist hover:text-moonlight"
          }`}
          title="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <img
          src="/assets/logo.svg"
          alt="SkillForge"
          width={140}
          height={34}
          className="h-[34px] w-auto min-w-[140px]"
        />

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#151A28] border border-steel-edge rounded-lg shadow-2xl overflow-hidden z-[60]">
            {/* User info */}
            <div className="px-4 py-3 border-b border-steel-edge">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-moonlight font-heading text-sm shrink-0"
                  style={{ backgroundColor: archetype?.color ?? "#1E2438" }}
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-moonlight text-sm font-medium truncate">
                    {user?.displayName ?? "User"}
                  </p>
                  <span
                    className="text-xs font-heading px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${roleBadge.color}20`,
                      color: roleBadge.color,
                    }}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="py-1">
              <button
                onClick={() => { setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-moonlight hover:bg-anvil-gray transition-colors"
              >
                <Map size={16} className="text-arcane-blue" />
                Skill Tree
              </button>

              {archetype && (
                <button
                  onClick={() => { setMenuOpen(false); router.push("/archetype-quiz"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:bg-anvil-gray hover:text-moonlight transition-colors"
                >
                  <User size={16} />
                  My Archetype
                </button>
              )}

              {isMentorOrAdmin && (
                <>
                  <div className="border-t border-steel-edge my-1" />
                  <p className="px-4 py-1 text-xs text-mist/60 font-heading uppercase tracking-wider">
                    Mentor Tools
                  </p>
                  <button
                    onClick={() => {
                      setHeatmapMode(!heatmapMode);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:bg-anvil-gray hover:text-moonlight transition-colors"
                  >
                    <BarChart3 size={16} className={heatmapMode ? "text-arcane-blue" : ""} />
                    Cohort Heatmap
                    {heatmapMode && (
                      <span className="ml-auto text-xs text-arcane-blue">ON</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setReviewPanelOpen(!reviewPanelOpen);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:bg-anvil-gray hover:text-moonlight transition-colors"
                  >
                    <ClipboardCheck size={16} className={reviewPanelOpen ? "text-arcane-blue" : ""} />
                    Review Submissions
                    {pendingReviewCount > 0 && (
                      <span className="ml-auto text-xs bg-ember-gold text-void-black rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {pendingReviewCount > 9 ? "9+" : pendingReviewCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {isAdmin && (
                <>
                  <div className="border-t border-steel-edge my-1" />
                  <p className="px-4 py-1 text-xs text-mist/60 font-heading uppercase tracking-wider">
                    Admin Tools
                  </p>
                  <button
                    onClick={() => {
                      setAdminPanelOpen(!adminPanelOpen);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:bg-anvil-gray hover:text-moonlight transition-colors"
                  >
                    <Settings size={16} className={adminPanelOpen ? "text-ember-gold" : ""} />
                    Admin Panel
                    {adminPanelOpen && (
                      <span className="ml-auto text-xs text-ember-gold">OPEN</span>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-steel-edge py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:bg-anvil-gray hover:text-blood-ruby transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
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
                src={`/assets/${archetype.iconKey}.svg`}
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
        {isMentorOrAdmin && (
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

        {/* Admin: settings toggle */}
        {isAdmin && (
          <button
            onClick={() => setAdminPanelOpen(!adminPanelOpen)}
            className={`relative p-1.5 rounded transition-colors ${
              adminPanelOpen
                ? "bg-ember-gold/20 text-ember-gold"
                : "text-mist hover:text-moonlight"
            }`}
            title={adminPanelOpen ? "Close admin panel" : "Open admin panel"}
          >
            <Settings size={18} />
          </button>
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

    {/* Admin Panel overlay */}
    <AdminPanel
      open={adminPanelOpen}
      onClose={() => setAdminPanelOpen(false)}
    />
    </>
  );
}
