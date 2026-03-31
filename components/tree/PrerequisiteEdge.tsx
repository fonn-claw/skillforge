"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export type PrereqEdgeData = {
  status: "inactive" | "active" | "completed" | "unlocking";
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

  const isUnlocking = d.status === "unlocking";

  const strokeColor =
    d.status === "completed"
      ? "#34D399"
      : d.status === "active" || isUnlocking
        ? `url(#grad-${id})`
        : "#2A3150";

  return (
    <g className={isUnlocking ? "edge-unlocking" : undefined}>
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
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: isUnlocking ? 3 : 2,
        }}
      />

      {/* Unlocking: one-shot 800ms energy flow with trailing glow */}
      {isUnlocking && (
        <>
          {/* Trailing glow circle */}
          <circle r="10" fill="#4A7CFF" opacity="0.3">
            <animateMotion
              dur="0.8s"
              repeatCount="1"
              fill="freeze"
              path={edgePath}
              begin="0.1s"
            />
          </circle>
          {/* Main energy particle */}
          <circle
            r="6"
            fill="#4A7CFF"
            filter={`url(#glow-${id})`}
          >
            <animateMotion
              dur="0.8s"
              repeatCount="1"
              fill="freeze"
              path={edgePath}
            />
          </circle>
        </>
      )}

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
    </g>
  );
}
