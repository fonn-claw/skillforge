"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Quiz Questions ─────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    question: "When facing a new challenge, you prefer to...",
    options: [
      { text: "Build a prototype and iterate", archetype: "builder", icon: "\u{1F528}" },
      { text: "Research and analyze the problem first", archetype: "analyst", icon: "\u{1F52C}" },
      { text: "Explore different approaches creatively", archetype: "explorer", icon: "\u{1F9ED}" },
      { text: "Discuss with others and gather perspectives", archetype: "collaborator", icon: "\u{1F91D}" },
    ],
  },
  {
    question: "Your ideal learning experience looks like...",
    options: [
      { text: "A hands-on workshop where you make something real", archetype: "builder", icon: "\u{1F6E0}\u{FE0F}" },
      { text: "A deep-dive lecture with data and case studies", archetype: "analyst", icon: "\u{1F4CA}" },
      { text: "An open-ended project with room to experiment", archetype: "explorer", icon: "\u{1F30D}" },
      { text: "A group session with peer feedback and discussion", archetype: "collaborator", icon: "\u{1F4AC}" },
    ],
  },
  {
    question: "When solving a difficult problem, you tend to...",
    options: [
      { text: "Start coding immediately and figure it out along the way", archetype: "builder", icon: "\u{26A1}" },
      { text: "Break it into smaller pieces and analyze each one", archetype: "analyst", icon: "\u{1F9E9}" },
      { text: "Look for unconventional solutions nobody tried yet", archetype: "explorer", icon: "\u{1F4A1}" },
      { text: "Brainstorm with teammates to find the best approach", archetype: "collaborator", icon: "\u{1F465}" },
    ],
  },
  {
    question: "What motivates you most to keep learning?",
    options: [
      { text: "Shipping something you're proud of", archetype: "builder", icon: "\u{1F680}" },
      { text: "Mastering a concept at a deeper level", archetype: "analyst", icon: "\u{1F3AF}" },
      { text: "Discovering connections between different fields", archetype: "explorer", icon: "\u{2728}" },
      { text: "Teaching others and seeing them succeed", archetype: "collaborator", icon: "\u{1F31F}" },
    ],
  },
  {
    question: "When you celebrate a win, it usually looks like...",
    options: [
      { text: "Showing off what you built to the world", archetype: "builder", icon: "\u{1F389}" },
      { text: "Quietly knowing you understood it completely", archetype: "analyst", icon: "\u{1F9D8}" },
      { text: "Already thinking about what to try next", archetype: "explorer", icon: "\u{1F30C}" },
      { text: "High-fiving your team and sharing the credit", archetype: "collaborator", icon: "\u{1F64C}" },
    ],
  },
  {
    question: "When you hit a wall and feel stuck, you...",
    options: [
      { text: "Scrap your approach and rebuild from scratch", archetype: "builder", icon: "\u{1F525}" },
      { text: "Re-read documentation until you find the gap", archetype: "analyst", icon: "\u{1F4D6}" },
      { text: "Step away and let your subconscious work on it", archetype: "explorer", icon: "\u{1F6B6}" },
      { text: "Ask for help or pair-program with someone", archetype: "collaborator", icon: "\u{1F4DE}" },
    ],
  },
  {
    question: "Your dream project would be...",
    options: [
      { text: "A product people actually use every day", archetype: "builder", icon: "\u{1F3D7}\u{FE0F}" },
      { text: "A system so well-designed it never breaks", archetype: "analyst", icon: "\u{1F48E}" },
      { text: "Something nobody has ever attempted before", archetype: "explorer", icon: "\u{1FA90}" },
      { text: "An open-source project with a thriving community", archetype: "collaborator", icon: "\u{1F30E}" },
    ],
  },
];

// ─── Archetype Data ─────────────────────────────────────────────────────────

const ARCHETYPE_DATA: Record<
  string,
  { color: string; description: string; iconKey: string }
> = {
  builder: {
    color: "#FF6B35",
    description:
      "You learn by creating. Hands-on projects and building real things is how knowledge sticks for you. You thrive when you can see your ideas take shape.",
    iconKey: "builder",
  },
  analyst: {
    color: "#38BDF8",
    description:
      "You learn by understanding deeply. Breaking down complex systems, finding patterns, and rigorous analysis is your natural mode.",
    iconKey: "analyst",
  },
  explorer: {
    color: "#34D399",
    description:
      "You learn by discovering. Curiosity drives you to try new paths, experiment freely, and connect unexpected dots across domains.",
    iconKey: "explorer",
  },
  collaborator: {
    color: "#A78BFA",
    description:
      "You learn by connecting. Teaching others, getting feedback, and building on shared knowledge accelerates your growth.",
    iconKey: "collaborator",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ArchetypeQuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    builder: 0,
    analyst: 0,
    explorer: 0,
    collaborator: 0,
  });
  const [phase, setPhase] = useState<"quiz" | "reveal" | "done">("quiz");
  const [resultArchetype, setResultArchetype] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = useCallback(
    (archetype: string) => {
      const newScores = { ...scores, [archetype]: scores[archetype] + 1 };
      setScores(newScores);

      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Determine winner
        const winner = Object.entries(newScores).reduce((a, b) =>
          b[1] > a[1] ? b : a
        )[0];
        setResultArchetype(winner);
        setPhase("reveal");
      }
    },
    [scores, currentQuestion]
  );

  const handleBeginJourney = useCallback(async () => {
    if (!resultArchetype || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/archetype/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archetype: resultArchetype }),
      });
      if (!res.ok) throw new Error("Failed to save archetype");
      setPhase("done");
      router.push("/");
    } catch (err) {
      console.error("Archetype submit error:", err);
      setSubmitting(false);
    }
  }, [resultArchetype, submitting, router]);

  const archetypeInfo = resultArchetype
    ? ARCHETYPE_DATA[resultArchetype]
    : null;
  const question = QUIZ_QUESTIONS[currentQuestion];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#0A0A0F",
        backgroundImage: "url(/assets/quiz-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay on background */}
      <div className="absolute inset-0 bg-void-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4">
        <AnimatePresence mode="wait">
          {phase === "quiz" && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center w-full"
            >
              {/* Progress dots */}
              <div className="flex gap-2 mb-10">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                      i < currentQuestion
                        ? "bg-arcane-blue"
                        : i === currentQuestion
                          ? "bg-ember-gold"
                          : "bg-steel-edge/40"
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <h2 className="font-heading text-2xl md:text-3xl text-moonlight text-center mb-8 leading-relaxed">
                {question.question}
              </h2>

              {/* Options grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {question.options.map((option, idx) => {
                  const optColor =
                    ARCHETYPE_DATA[option.archetype]?.color ?? "#fff";
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(option.archetype)}
                      className="bg-anvil-gray/80 border border-steel-edge/30 rounded-xl p-6 text-left cursor-pointer transition-colors duration-200 hover:bg-anvil-gray group"
                      style={
                        {
                          "--hover-border": optColor,
                        } as React.CSSProperties
                      }
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = optColor)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "")
                      }
                    >
                      <span className="text-3xl block mb-3">
                        {option.icon}
                      </span>
                      <span className="text-moonlight font-medium text-base leading-snug">
                        {option.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Question counter */}
              <p className="text-mist/50 text-sm mt-6">
                {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
              </p>
            </motion.div>
          )}

          {phase === "reveal" && archetypeInfo && resultArchetype && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full"
            >
              {/* Converging particles (CSS animation) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: archetypeInfo.color }}
                    initial={{
                      x: `${Math.cos((i * Math.PI * 2) / 12) * 400}px`,
                      y: `${Math.sin((i * Math.PI * 2) / 12) * 400}px`,
                      opacity: 0.8,
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeIn",
                    }}
                  />
                ))}
              </div>

              {/* Archetype portrait */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="mb-6"
              >
                <div
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 shadow-lg"
                  style={{
                    borderColor: archetypeInfo.color,
                    boxShadow: `0 0 40px ${archetypeInfo.color}40`,
                  }}
                >
                  <img
                    src={`/assets/archetype-${resultArchetype}.png`}
                    alt={resultArchetype}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Archetype name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="font-heading text-4xl md:text-5xl capitalize mb-4"
                style={{ color: archetypeInfo.color }}
              >
                The {resultArchetype}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="text-moonlight text-lg text-center max-w-md leading-relaxed mb-8"
              >
                {archetypeInfo.description}
              </motion.p>

              {/* Begin Journey button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBeginJourney}
                disabled={submitting}
                className="rounded-lg px-8 py-3 text-white font-semibold text-lg transition-opacity disabled:opacity-50"
                style={{ backgroundColor: archetypeInfo.color }}
              >
                {submitting ? "Saving..." : "Begin Your Journey"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
