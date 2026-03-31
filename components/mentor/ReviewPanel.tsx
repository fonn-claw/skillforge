"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

type Submission = {
  id: string;
  userId: string;
  challengeId: string;
  status: string;
  response: unknown;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  user?: { displayName: string; email: string };
  challenge?: { title: string; type: string; masteryLevel: string };
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReviewPanel({ open, onClose }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/mentor/submissions")
      .then((r) => r.json())
      .then((data: Submission[]) => setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleReview(id: string, approved: boolean) {
    await fetch(`/api/mentor/submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: approved ? "approved" : "rejected",
        score: approved ? 100 : 0,
        feedback: approved ? "Approved by mentor" : "Needs revision",
      }),
    });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 w-[400px] h-full z-50 bg-[#151A28]/95 backdrop-blur-[20px] border-l border-steel-edge overflow-y-auto p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-mist hover:text-moonlight transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="font-heading text-xl text-moonlight mb-4">
            Submission Reviews
          </h2>

          {loading ? (
            <p className="text-mist animate-pulse text-sm">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={32} className="mx-auto text-mist/50 mb-3" />
              <p className="text-mist text-sm">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-anvil-gray rounded-lg p-4 border border-steel-edge"
                >
                  <p className="text-moonlight text-sm font-medium mb-1">
                    {sub.challenge?.title ?? "Challenge"}
                  </p>
                  <p className="text-mist text-xs mb-2">
                    {sub.user?.displayName ?? "Learner"} &middot;{" "}
                    <span className="capitalize">{sub.challenge?.masteryLevel}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(sub.id, true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-verdant/20 text-verdant hover:bg-verdant/30 transition-colors"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(sub.id, false)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-ember/20 text-ember hover:bg-ember/30 transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
