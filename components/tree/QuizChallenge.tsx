"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import MasterySteps from "./MasterySteps";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type QuizResult = {
  score: number;
  earnedXP: number;
  newMastery: { currentLevel: string; xpCurrent: number; xpRequired: number };
  leveledUp: boolean;
};

type Props = {
  challenge: {
    id: string;
    title: string;
    content: { questions: Question[] };
    masteryLevel: string;
  };
  onComplete: (result: QuizResult) => void;
  onClose: () => void;
};

export default function QuizChallenge({ challenge, onComplete, onClose }: Props) {
  const questions = challenge.content.questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion?.correctIndex;

  const handleOptionClick = useCallback(
    (optionIndex: number) => {
      if (showFeedback || completed) return;
      setSelectedOption(optionIndex);
      setShowFeedback(true);
      setAnswers((prev) => [...prev, optionIndex]);
    },
    [showFeedback, completed]
  );

  // Auto-advance after feedback
  useEffect(() => {
    if (!showFeedback) return;
    const timer = setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // All questions answered -- submit
        setCompleted(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [showFeedback, currentIndex, questions.length]);

  // Submit when completed
  useEffect(() => {
    if (!completed || result || submitting) return;
    setSubmitting(true);
    const finalAnswers = answers;
    fetch(`/api/challenges/${challenge.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    })
      .then((r) => r.json())
      .then((data: QuizResult) => setResult(data))
      .catch(() => setResult({ score: 0, earnedXP: 0, newMastery: { currentLevel: "novice", xpCurrent: 0, xpRequired: 100 }, leveledUp: false }))
      .finally(() => setSubmitting(false));
  }, [completed, result, submitting, answers, challenge.id]);

  // Results screen
  if (completed && result) {
    const correctCount = Math.round((result.score / 100) * questions.length);
    return (
      <div className="space-y-6">
        <h3 className="font-heading text-xl text-moonlight text-center">
          Quiz Complete
        </h3>

        <div className="text-center space-y-2">
          <p className="text-4xl font-heading text-moonlight">
            {correctCount}/{questions.length}
          </p>
          <p className="text-mist text-sm">{result.score}% correct</p>
        </div>

        <div className="bg-anvil-gray rounded-lg p-4 text-center">
          <p className="text-sm text-mist mb-1">XP Earned</p>
          <p className="text-2xl font-heading text-arcane-blue">
            +{result.earnedXP}
          </p>
        </div>

        {result.leveledUp && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-3 bg-ember-gold/10 border border-ember-gold/30 rounded-lg"
          >
            <p className="font-heading text-lg text-ember-gold">Level Up!</p>
            <p className="text-sm text-moonlight/80 capitalize">
              {result.newMastery.currentLevel}
            </p>
          </motion.div>
        )}

        <div className="flex justify-center">
          <MasterySteps currentLevel={result.newMastery.currentLevel} />
        </div>

        <button
          onClick={() => onComplete(result)}
          className="w-full py-3 bg-arcane-blue text-white rounded-lg font-heading hover:bg-arcane-blue/80 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  // Loading / submitting
  if (completed && !result) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-mist animate-pulse">Calculating results...</p>
      </div>
    );
  }

  // Question screen
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-moonlight">{challenge.title}</h3>
        <button onClick={onClose} className="text-mist hover:text-moonlight transition-colors">
          <X size={20} />
        </button>
      </div>

      <p className="text-sm text-mist">
        Question {currentIndex + 1} of {questions.length}
      </p>

      {/* Progress bar */}
      <div className="h-1 bg-anvil-gray rounded-full overflow-hidden">
        <div
          className="h-full bg-arcane-blue transition-all duration-300"
          style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-heading text-lg text-moonlight mb-4">
            {currentQuestion.question}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, i) => {
              let borderColor = "border-steel-edge";
              let bg = "bg-anvil-gray";

              if (showFeedback) {
                if (i === currentQuestion.correctIndex) {
                  borderColor = "border-verdant";
                  bg = "bg-verdant/10";
                } else if (i === selectedOption && !isCorrect) {
                  borderColor = "border-critical-red";
                  bg = "bg-critical-red/10";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  disabled={showFeedback}
                  className={`w-full text-left ${bg} border ${borderColor} rounded-lg p-4 text-moonlight transition-colors ${
                    !showFeedback ? "hover:border-arcane-blue/50 cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-mist shrink-0 w-6">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-sm">{option}</span>
                    {showFeedback && i === currentQuestion.correctIndex && (
                      <Check size={16} className="text-verdant ml-auto shrink-0" />
                    )}
                    {showFeedback && i === selectedOption && !isCorrect && (
                      <X size={16} className="text-critical-red ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

