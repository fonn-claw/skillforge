"use client";

import dynamic from "next/dynamic";
import "./tree-styles.css";

const SkillTreeFlow = dynamic(() => import("./SkillTreeFlow"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-void-black">
      <p className="text-mist animate-pulse text-lg">Loading skill tree...</p>
    </div>
  ),
});

export default function SkillTreeCanvas() {
  return <SkillTreeFlow />;
}
