"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type HexNodeData = {
  name: string;
  mastery:
    | "locked"
    | "novice"
    | "apprentice"
    | "journeyman"
    | "expert"
    | "master";
  iconKey: string | null;
  branchName: string | null;
  description: string;
  xpCurrent: number;
  xpRequired: number;
  canUnlock?: boolean;
  justUnlocked?: boolean;
};

function HexagonNode({ data }: NodeProps) {
  const d = data as unknown as HexNodeData;
  const mastery = d.mastery ?? "locked";
  const isLocked = mastery === "locked";
  const masteryLabel = mastery.charAt(0).toUpperCase() + mastery.slice(1);

  const extraClasses = [
    `hexagon-node`,
    `mastery-${mastery}`,
    d.justUnlocked ? "node-unlock-flash" : "",
    d.canUnlock && isLocked ? "node-can-unlock" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={extraClasses}>
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0"
      />

      <svg viewBox="0 0 64 64" width={64} height={64}>
        {/* Outer hexagon - mastery-colored via CSS */}
        <polygon
          points="32,4 56,18 56,46 32,60 8,46 8,18"
          className="hex-fill"
          strokeWidth={2}
        />
        {/* Inner hexagon for depth */}
        <polygon
          points="32,12 48,22 48,42 32,52 16,42 16,22"
          className="hex-inner"
          fill="#1E2438"
          opacity={0.3}
          strokeWidth={1}
        />
      </svg>

      {/* Mastery indicator icon */}
      <img
        src={`/assets/icon-node-${mastery}.svg`}
        alt=""
        className="mastery-indicator"
        width={16}
        height={16}
      />

      {/* Lock icon overlay for locked nodes */}
      {isLocked && (
        <img
          src="/assets/icon-node-locked.svg"
          alt="Locked"
          className="lock-overlay"
          width={20}
          height={20}
        />
      )}

      {/* Hover tooltip */}
      <div className="node-tooltip">
        {d.name} - {masteryLabel}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0"
      />
    </div>
  );
}

export default memo(HexagonNode);
