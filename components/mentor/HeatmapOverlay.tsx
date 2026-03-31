"use client";

import { motion } from "framer-motion";
import { X, Users, AlertTriangle } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type HeatmapNodeData = {
  nodeId: string;
  nodeName: string;
  totalLearners: number;
  breakdown: {
    locked: number;
    novice: number;
    apprentice: number;
    journeyman: number;
    expert: number;
    master: number;
  };
  avgMasteryIndex: number;
  stuckCount: number;
};

// ─── Color Utils ────────────────────────────────────────────────────────────

function heatmapColor(avgIndex: number): string {
  if (avgIndex < 1) return "#4A7CFF"; // blue — mostly locked/novice
  if (avgIndex < 2) return "#14B8A6"; // teal — apprentice range
  if (avgIndex < 3) return "#22C55E"; // green — journeyman range
  if (avgIndex < 4) return "#F0A830"; // gold — expert range
  return "#FFF7DB"; // white-gold — master range
}

const LEVEL_COLORS: Record<string, string> = {
  locked: "#2A3150",
  novice: "rgba(74,124,255,0.7)",
  apprentice: "#4A7CFF",
  journeyman: "#14B8A6",
  expert: "#F0A830",
  master: "#FFF7DB",
};

// ─── HeatmapNodeBadge ──────────────────────────────────────────────────────

export function HeatmapNodeBadge({ data }: { data: HeatmapNodeData }) {
  const color = heatmapColor(data.avgMasteryIndex);
  const hasStuck = data.stuckCount > 0;

  return (
    <div
      className="absolute -top-2 -right-2 z-10 flex items-center justify-center rounded-full text-[10px] font-bold"
      style={{
        width: 24,
        height: 24,
        backgroundColor: color,
        color: data.avgMasteryIndex >= 4 ? "#0A0E17" : "#FFF",
        boxShadow: hasStuck
          ? "0 0 0 2px #F59E0B, 0 0 8px #F59E0B"
          : `0 0 6px ${color}80`,
      }}
    >
      {data.totalLearners}
      {hasStuck && (
        <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-amber-glow animate-pulse" />
      )}
    </div>
  );
}

// ─── HeatmapDetailPanel ────────────────────────────────────────────────────

type DetailProps = {
  data: HeatmapNodeData;
  onClose: () => void;
};

const LEVELS = ["locked", "novice", "apprentice", "journeyman", "expert", "master"] as const;

export function HeatmapDetailPanel({ data, onClose }: DetailProps) {
  const maxCount = Math.max(
    1,
    ...LEVELS.map((l) => data.breakdown[l] ?? 0)
  );

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 w-[400px] h-full z-50 bg-[#151A28]/95 backdrop-blur-[20px] border-l border-steel-edge overflow-y-auto p-6"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-mist hover:text-moonlight transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2 pr-8">
        <Users size={20} className="text-arcane-blue shrink-0" />
        <h2 className="font-heading text-xl text-moonlight leading-tight">
          {data.nodeName}
        </h2>
      </div>

      <p className="text-sm text-mist mb-6">
        Cohort Mastery Overview — {data.totalLearners} learner
        {data.totalLearners !== 1 ? "s" : ""} with progress
      </p>

      {/* Avg mastery */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-mist">Avg Mastery:</span>
        <span
          className="text-lg font-heading"
          style={{ color: heatmapColor(data.avgMasteryIndex) }}
        >
          {data.avgMasteryIndex.toFixed(1)}
        </span>
        <span className="text-xs text-mist">/5.0</span>
      </div>

      {/* Mastery breakdown bars */}
      <div className="mb-6">
        <h3 className="font-heading text-sm text-mist uppercase tracking-wide mb-3">
          Level Distribution
        </h3>
        <div className="space-y-2">
          {LEVELS.map((level) => {
            const cnt = data.breakdown[level] ?? 0;
            const pct = maxCount > 0 ? (cnt / maxCount) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <span className="text-xs text-mist capitalize w-24 text-right">
                  {level}
                </span>
                <div className="flex-1 h-5 bg-forge-gray rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: LEVEL_COLORS[level],
                    }}
                  />
                </div>
                <span className="text-xs text-moonlight w-8 text-right">
                  {cnt}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stuck learners warning */}
      {data.stuckCount > 0 && (
        <div className="bg-amber-glow/10 border border-amber-glow/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-glow" />
            <span className="text-sm font-heading text-amber-glow">
              Stuck Learners
            </span>
          </div>
          <p className="text-xs text-mist">
            {data.stuckCount} learner{data.stuckCount !== 1 ? "s" : ""} at
            novice/apprentice level with no activity in 3+ days.
          </p>
        </div>
      )}
    </motion.div>
  );
}
