"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type MentorContextValue = {
  heatmapMode: boolean;
  setHeatmapMode: (v: boolean) => void;
  reviewPanelOpen: boolean;
  setReviewPanelOpen: (v: boolean) => void;
};

const MentorContext = createContext<MentorContextValue>({
  heatmapMode: false,
  setHeatmapMode: () => {},
  reviewPanelOpen: false,
  setReviewPanelOpen: () => {},
});

export function MentorProvider({ children }: { children: ReactNode }) {
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);

  return (
    <MentorContext.Provider
      value={{ heatmapMode, setHeatmapMode, reviewPanelOpen, setReviewPanelOpen }}
    >
      {children}
    </MentorContext.Provider>
  );
}

export function useMentorContext() {
  return useContext(MentorContext);
}
