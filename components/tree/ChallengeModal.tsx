"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizChallenge from "./QuizChallenge";
import ProjectSubmission from "./ProjectSubmission";

type ChallengeData = {
  id: string;
  title: string;
  description: string | null;
  type: "quiz" | "project_submission";
  masteryLevel: string;
  content: unknown;
  nodeId: string;
};

type Props = {
  challengeId: string | null;
  onClose: () => void;
  onComplete: () => void;
};

export default function ChallengeModal({ challengeId, onClose, onComplete }: Props) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) {
      setChallenge(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/challenges/${challengeId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load challenge");
        return r.json();
      })
      .then((data: ChallengeData) => setChallenge(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, [challengeId]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!challengeId) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [challengeId, onClose]);

  return (
    <AnimatePresence>
      {challengeId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-void-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl w-full mx-4 bg-forge-gray border border-steel-edge rounded-xl p-6 max-h-[80vh] overflow-y-auto"
          >
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-mist animate-pulse">Loading challenge...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-critical-red mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="text-mist hover:text-moonlight transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            )}

            {!loading && !error && challenge?.type === "quiz" && (
              <QuizChallenge
                challenge={{
                  id: challenge.id,
                  title: challenge.title,
                  content: challenge.content as { questions: { question: string; options: string[]; correctIndex: number }[] },
                  masteryLevel: challenge.masteryLevel,
                }}
                onComplete={() => onComplete()}
                onClose={onClose}
              />
            )}

            {!loading && !error && challenge?.type === "project_submission" && (
              <ProjectSubmission
                challenge={{
                  id: challenge.id,
                  title: challenge.title,
                  description: challenge.description,
                  masteryLevel: challenge.masteryLevel,
                }}
                onComplete={onComplete}
                onClose={onClose}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
