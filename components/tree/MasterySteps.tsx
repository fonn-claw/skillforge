"use client";

const MASTERY_LEVELS = ["novice", "apprentice", "journeyman", "expert", "master"] as const;
const MASTERY_LABELS = ["N", "A", "J", "E", "M"] as const;

const MASTERY_COLORS: Record<string, string> = {
  novice: "rgba(74,124,255,0.6)",
  apprentice: "#4A7CFF",
  journeyman: "#14B8A6",
  expert: "#F0A830",
  master: "#FFF7DB",
};

function getMasteryIndex(level: string): number {
  return MASTERY_LEVELS.indexOf(level as (typeof MASTERY_LEVELS)[number]);
}

export default function MasterySteps({ currentLevel }: { currentLevel: string }) {
  const currentIndex = getMasteryIndex(currentLevel);
  const isLocked = currentLevel === "locked";

  return (
    <div className="flex items-end gap-3">
      {MASTERY_LEVELS.map((level, i) => {
        const filled = !isLocked && i <= currentIndex;
        const isCurrent = !isLocked && i === currentIndex;
        const color = MASTERY_COLORS[level];

        return (
          <div key={level} className="flex flex-col items-center gap-1">
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              className="transition-transform duration-200"
              style={{
                transform: isCurrent ? "scale(1.15)" : "scale(1)",
                filter: filled
                  ? `drop-shadow(0 0 ${isCurrent ? "6px" : "3px"} ${color})`
                  : "none",
              }}
            >
              <polygon
                points="12,2 22,12 12,22 2,12"
                fill={filled ? color : "#2A3150"}
                stroke={filled ? color : "#2A3150"}
                strokeWidth="1"
              />
            </svg>
            <span className="text-[10px] text-mist leading-none">
              {MASTERY_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
