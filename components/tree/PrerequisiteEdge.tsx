"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export type PrereqEdgeData = {
  status: "inactive" | "active" | "completed";
};

export default function PrerequisiteEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const d = (data as PrereqEdgeData) ?? { status: "inactive" };

  const strokeColor =
    d.status === "completed"
      ? "#34D399"
      : d.status === "active"
        ? `url(#grad-${id})`
        : "#2A3150";

  return (
    <>
      <defs>
        <linearGradient
          id={`grad-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#4A7CFF" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: 2,
        }}
      />

      {d.status === "active" && (
        <circle r="4" fill="#4A7CFF">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {d.status === "completed" && (
        <circle r="3" fill="#34D399" opacity="0.6">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
}
