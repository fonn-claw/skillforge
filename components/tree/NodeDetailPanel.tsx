"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock, FileCode, ClipboardList } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";
import MasterySteps from "./MasterySteps";
import ChallengeModal from "./ChallengeModal";

const MASTERY_ORDER = [
  "locked",
  "novice",
  "apprentice",
  "journeyman",
  "expert",
  "master",
] as const;

const MASTERY_COLORS: Record<string, string> = {
  locked: "#2A3150",
  novice: "rgba(74,124,255,0.6)",
  apprentice: "#4A7CFF",
  journeyman: "#14B8A6",
  expert: "#F0A830",
  master: "#FFF7DB",
};

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  type: "quiz" | "project_submission";
  masteryLevel: string;
  sortOrder: number;
};

type Props = {
  nodeId: string;
  nodesData: Node[];
  edgesData: Edge[];
  onClose: () => void;
  onTreeRefresh?: () => void;
};

function getMasteryIndex(level: string): number {
  return MASTERY_ORDER.indexOf(level as (typeof MASTERY_ORDER)[number]);
}

export default function NodeDetailPanel({
  nodeId,
  nodesData,
  edgesData,
  onClose,
  onTreeRefresh,
}: Props) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const node = nodesData.find((n) => n.id === nodeId);
  const data = node?.data as Record<string, unknown> | undefined;

  const name = (data?.name as string) ?? "Unknown Skill";
  const mastery = (data?.mastery as string) ?? "locked";
  const description = (data?.description as string) ?? "";
  const iconKey = (data?.iconKey as string) ?? null;
  const branchName = (data?.branchName as string) ?? null;
  const xpCurrent = (data?.xpCurrent as number) ?? 0;
  const xpRequired = (data?.xpRequired as number) ?? 100;

  // Find prerequisites (edges where this node is the target)
  const prereqEdges = edgesData.filter(
    (e) => e.target === nodeId
  );

  const prerequisites = prereqEdges.map((edge) => {
    const sourceNode = nodesData.find((n) => n.id === edge.source);
    const sourceData = sourceNode?.data as Record<string, unknown> | undefined;
    const sourceMastery = (sourceData?.mastery as string) ?? "locked";
    const requiredLevel = (edge.data as Record<string, unknown>)?.requiredMasteryLevel as string ?? "novice";
    const met =
      getMasteryIndex(sourceMastery) >= getMasteryIndex(requiredLevel);
    return {
      name: (sourceData?.name as string) ?? "Unknown",
      requiredLevel,
      met,
    };
  });

  // Fetch challenges
  function fetchChallenges() {
    setLoadingChallenges(true);
    fetch(`/api/tree/nodes/${nodeId}/challenges`)
      .then((r) => r.json())
      .then((data: Challenge[]) => setChallenges(data))
      .catch(() => setChallenges([]))
      .finally(() => setLoadingChallenges(false));
  }

  useEffect(() => {
    fetchChallenges();
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChallengeComplete() {
    setActiveChallengeId(null);
    fetchChallenges();
    onTreeRefresh?.();
  }

  // Escape key handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Responsive check
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const masteryColor = MASTERY_COLORS[mastery] ?? MASTERY_COLORS.locked;
  const iconSrc = iconKey
    ? `/assets/icon-node-${mastery === "locked" ? "locked" : mastery}.svg`
    : `/assets/icon-node-${mastery === "locked" ? "locked" : "novice"}.svg`;

  const panelContent = (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-mist hover:text-moonlight transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pr-8">
        <img
          src={iconSrc}
          alt={name}
          width={32}
          height={32}
          className="w-8 h-8 shrink-0"
        />
        <div>
          <h2 className="font-heading text-xl text-moonlight leading-tight">
            {name}
          </h2>
          {mastery !== "locked" && (
            <span
              className="inline-block mt-1 rounded-full px-3 py-0.5 text-sm capitalize"
              style={{
                backgroundColor: `${masteryColor}20`,
                color: masteryColor,
              }}
            >
              {mastery}
            </span>
          )}
        </div>
      </div>

      {/* Branch tag */}
      {branchName && (
        <span className="inline-block mb-4 text-xs text-mist bg-anvil-gray rounded-full px-2 py-0.5">
          {branchName}
        </span>
      )}

      {/* Mastery Steps */}
      <div className="mb-4">
        <MasterySteps currentLevel={mastery} />
      </div>

      {/* XP */}
      {mastery !== "locked" && (
        <p className="text-sm text-mist mb-5">
          {xpCurrent}/{xpRequired} XP
        </p>
      )}

      {/* Description */}
      <div className="mb-5">
        <h3 className="font-heading text-sm text-mist uppercase tracking-wide mb-2">
          About
        </h3>
        <p className="text-moonlight/90 text-sm leading-relaxed">
          {description || "No description available."}
        </p>
      </div>

      {/* Prerequisites */}
      <div className="mb-5">
        <h3 className="font-heading text-sm text-mist uppercase tracking-wide mb-2">
          Prerequisites
        </h3>
        {prerequisites.length === 0 ? (
          <p className="text-sm text-mist/70">
            No prerequisites — this is a root skill
          </p>
        ) : (
          <ul className="space-y-2">
            {prerequisites.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {p.met ? (
                  <Check size={16} className="text-verdant shrink-0" />
                ) : (
                  <Lock size={16} className="text-mist shrink-0" />
                )}
                <span className="text-moonlight/90">{p.name}</span>
                <span className="text-mist text-xs capitalize">
                  ({p.requiredLevel})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Challenges */}
      <div>
        <h3 className="font-heading text-sm text-mist uppercase tracking-wide mb-2">
          Challenges
        </h3>
        {loadingChallenges ? (
          <p className="text-sm text-mist animate-pulse">Loading...</p>
        ) : challenges.length === 0 ? (
          <p className="text-sm text-mist/70">No challenges yet</p>
        ) : (
          <div className="space-y-2">
            {challenges.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveChallengeId(c.id)}
                className="bg-anvil-gray rounded-lg p-3 border border-steel-edge hover:border-arcane-blue/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-moonlight text-sm font-medium">
                    {c.title}
                  </span>
                  {c.type === "quiz" ? (
                    <ClipboardList size={14} className="text-arcane-blue shrink-0" />
                  ) : (
                    <FileCode size={14} className="text-ember-gold shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mist capitalize">
                    {c.type === "project_submission" ? "project" : c.type}
                  </span>
                  <span className="text-xs text-mist capitalize">
                    {c.masteryLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        challengeId={activeChallengeId}
        onClose={() => setActiveChallengeId(null)}
        onComplete={handleChallengeComplete}
      />
    </>
  );

  // Desktop: slide from right. Mobile: slide from bottom.
  if (isMobile) {
    return (
      <motion.div
        key={nodeId}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 h-[60vh] z-50 bg-[#151A28]/95 backdrop-blur-[20px] border-t border-steel-edge rounded-t-2xl overflow-y-auto p-6"
      >
        {panelContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={nodeId}
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 w-[400px] h-full z-50 bg-[#151A28]/95 backdrop-blur-[20px] border-l border-steel-edge overflow-y-auto p-6"
    >
      {panelContent}
    </motion.div>
  );
}
