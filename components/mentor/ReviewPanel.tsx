"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Check,
  XCircle,
  ExternalLink,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Review = {
  id: string;
  learnerName: string;
  learnerEmail: string;
  challengeTitle: string;
  challengeType: string;
  masteryLevel: string;
  nodeId: string | null;
  response: { description?: string; url?: string } | null;
  submittedAt: string;
};

const MASTERY_BADGE_COLORS: Record<string, string> = {
  novice: "#4A7CFF",
  apprentice: "#4A7CFF",
  journeyman: "#14B8A6",
  expert: "#F0A830",
  master: "#FFF7DB",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReviewPanel({ open, onClose }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/mentor/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Review[]) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessing(id);
    try {
      const res = await fetch(`/api/mentor/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback: feedback[id] || undefined }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setProcessing(null);
    }
  }

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-0 left-0 w-[400px] h-full z-50 bg-[#151A28]/95 backdrop-blur-[20px] border-r border-steel-edge overflow-y-auto p-6"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-mist hover:text-moonlight transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pr-8">
        <ClipboardCheck size={20} className="text-arcane-blue shrink-0" />
        <h2 className="font-heading text-xl text-moonlight">
          Pending Reviews
        </h2>
        <span className="ml-auto text-sm text-mist">
          {reviews.length}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-mist animate-pulse">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck size={40} className="text-steel-edge mx-auto mb-3" />
          <p className="text-mist text-sm">No pending reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const isExpanded = expandedId === r.id;
            const isProcessing = processing === r.id;
            const badgeColor =
              MASTERY_BADGE_COLORS[r.masteryLevel] ?? "#4A7CFF";
            const resp = r.response as { description?: string; url?: string } | null;

            return (
              <div
                key={r.id}
                className="bg-anvil-gray rounded-lg border border-steel-edge overflow-hidden"
              >
                {/* Card header */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : r.id)
                  }
                  className="w-full p-4 text-left flex items-start gap-3 hover:bg-forge-gray/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-moonlight text-sm font-medium truncate">
                      {r.challengeTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-mist">
                        {r.learnerName}
                      </span>
                      <span
                        className="text-xs capitalize px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${badgeColor}20`,
                          color: badgeColor,
                        }}
                      >
                        {r.masteryLevel}
                      </span>
                      <span className="text-xs text-mist/60 ml-auto shrink-0">
                        {timeAgo(r.submittedAt)}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-mist shrink-0 mt-1" />
                  ) : (
                    <ChevronDown size={16} className="text-mist shrink-0 mt-1" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-steel-edge/50 pt-3">
                    {/* Submission content */}
                    {resp?.description && (
                      <p className="text-sm text-moonlight/80 mb-2 whitespace-pre-wrap">
                        {resp.description}
                      </p>
                    )}
                    {resp?.url && (
                      <a
                        href={resp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-arcane-blue hover:underline mb-3"
                      >
                        <ExternalLink size={12} />
                        View submission
                      </a>
                    )}

                    {/* Feedback */}
                    <textarea
                      placeholder="Feedback (optional)..."
                      value={feedback[r.id] ?? ""}
                      onChange={(e) =>
                        setFeedback((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      className="w-full bg-forge-gray border border-steel-edge rounded p-2 text-sm text-moonlight placeholder:text-mist/50 resize-none mb-3"
                      rows={2}
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(r.id, "approve")}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-verdant text-white hover:bg-verdant/80 transition-colors disabled:opacity-50"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "reject")}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-blood-ruby/70 text-moonlight hover:bg-blood-ruby/50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
