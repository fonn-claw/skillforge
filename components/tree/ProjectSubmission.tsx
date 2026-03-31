"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

type Props = {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    masteryLevel: string;
  };
  onComplete: () => void;
  onClose: () => void;
};

export default function ProjectSubmission({ challenge, onComplete, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = description.trim().length >= 10 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          url: url.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-verdant/10 border border-verdant/30">
          <Check size={32} className="text-verdant" />
        </div>
        <div>
          <h3 className="font-heading text-xl text-moonlight mb-2">
            Submitted for Review
          </h3>
          <p className="text-sm text-mist">
            A mentor will review your submission and provide feedback.
          </p>
        </div>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-arcane-blue text-white rounded-lg font-heading hover:bg-arcane-blue/80 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-moonlight">{challenge.title}</h3>
        <button onClick={onClose} className="text-mist hover:text-moonlight transition-colors">
          <X size={20} />
        </button>
      </div>

      {challenge.description && (
        <p className="text-sm text-moonlight/80">{challenge.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-mist mb-2">
            Description <span className="text-critical-red">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project, approach, and what you learned..."
            rows={5}
            className="w-full bg-anvil-gray border border-steel-edge rounded-lg p-3 text-moonlight text-sm placeholder:text-mist/50 focus:outline-none focus:border-arcane-blue/50 resize-none"
          />
          <p className="text-xs text-mist mt-1">
            {description.trim().length}/10 characters minimum
          </p>
        </div>

        <div>
          <label className="block text-sm text-mist mb-2">
            Project URL <span className="text-mist/50">(optional)</span>
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full bg-anvil-gray border border-steel-edge rounded-lg p-3 text-moonlight text-sm placeholder:text-mist/50 focus:outline-none focus:border-arcane-blue/50"
          />
        </div>

        {error && (
          <p className="text-sm text-critical-red">{error}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 bg-arcane-blue text-white rounded-lg font-heading hover:bg-arcane-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Project"
          )}
        </button>
      </form>
    </div>
  );
}

