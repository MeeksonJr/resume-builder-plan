"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Zap,
  Target,
  Award,
  ChevronRight,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface DrillQuestion {
  id?: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  rationale?: string;
  competency?: string;
}

interface DrillResult {
  questionIndex: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  rationale?: string;
}

interface QuickPracticeDrillProps {
  careerField: string;
  topic?: string;
  difficulty?: "junior" | "mid" | "senior" | "executive";
  numQuestions?: number;
  onComplete?: (score: number, total: number) => void;
  compact?: boolean;
}

type DrillState = "loading" | "ready" | "active" | "reviewing" | "complete";

export function QuickPracticeDrill({
  careerField,
  topic,
  difficulty = "mid",
  numQuestions = 5,
  onComplete,
  compact = false,
}: QuickPracticeDrillProps) {
  const [state, setState] = useState<DrillState>("loading");
  const [questions, setQuestions] = useState<DrillQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [source, setSource] = useState<string>("");

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const fetchQuestions = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/assessment/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerField,
          topic: topic || careerField,
          difficulty,
          numQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions) throw new Error(data.error || "Failed to load questions");

      setQuestions(data.questions);
      setSource(data.source);
      setState("ready");
    } catch (err: any) {
      toast.error(err.message || "Failed to load drill questions");
      setState("ready"); // Show empty state
    }
  }, [careerField, topic, difficulty, numQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const startDrill = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setResults([]);
    setTimeElapsed(0);
    setTimerActive(true);
    setState("active");
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(answer);
  };

  const handleRevealAnswer = () => {
    if (!selectedAnswer) {
      toast.warning("Please select an answer first.");
      return;
    }
    const current = questions[currentIndex];
    const isCorrect = selectedAnswer === current.correctAnswer;

    setIsAnswerRevealed(true);
    setResults((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        question: current.question,
        selectedAnswer,
        correctAnswer: current.correctAnswer,
        isCorrect,
        rationale: current.rationale,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      // Done
      setTimerActive(false);
      setState("complete");
      const correctCount = results.filter((r) => r.isCorrect).length + (isAnswerRevealed && selectedAnswer === questions[currentIndex].correctAnswer ? 1 : 0);
      onComplete?.(correctCount, questions.length);
      saveDrillResult(correctCount);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    }
  };

  const saveDrillResult = async (correctCount: number) => {
    setIsSaving(true);
    try {
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      await fetch("/api/assessment/drills/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerField,
          topic: topic || careerField,
          totalQuestions: questions.length,
          correctCount,
          scorePercentage,
          timeSpentSeconds: timeElapsed,
          answersReview: results,
        }),
      });
    } catch (_) {}
    setIsSaving(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const correctCount = results.filter((r) => r.isCorrect).length;
  const finalScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className={`rounded-2xl border border-border/80 bg-card p-6 flex items-center gap-3 ${compact ? "p-4" : "p-6"}`}>
        <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Loading practice questions…</p>
          <p className="text-xs text-muted-foreground">Checking question bank for {careerField}</p>
        </div>
      </div>
    );
  }

  // ── READY (Start Screen) ─────────────────────────────────────────────────────
  if (state === "ready") {
    return (
      <div className={`rounded-2xl border border-border/80 bg-card space-y-4 ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Quick Practice Drill</h3>
              <p className="text-[11px] text-muted-foreground">{careerField} · {difficulty} level</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
            {questions.length} Questions
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-center">
            <span className="text-[10px] text-muted-foreground block">Questions</span>
            <span className="text-base font-black text-foreground">{questions.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-center">
            <span className="text-[10px] text-muted-foreground block">Format</span>
            <span className="text-xs font-bold text-foreground">MCQ</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-center">
            <span className="text-[10px] text-muted-foreground block">Source</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {source === "cache" ? "✓ Cached" : source === "rapidapi" ? "RapidAPI" : "AI-Gen"}
            </span>
          </div>
        </div>

        <Button onClick={startDrill} disabled={questions.length === 0} className="w-full font-bold rounded-xl gap-2">
          <Zap className="w-4 h-4" /> Start Quick Drill
        </Button>
      </div>
    );
  }

  // ── ACTIVE (Quiz Mode) ───────────────────────────────────────────────────────
  if (state === "active") {
    const current = questions[currentIndex];
    return (
      <div className={`rounded-2xl border border-border/80 bg-card space-y-4 ${compact ? "p-4" : "p-6"}`}>
        {/* Progress + Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 w-32 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatTime(timeElapsed)}
          </span>
        </div>

        {/* Competency Tag */}
        {current.competency && (
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary w-fit">
            <Target className="w-3 h-3 mr-1" /> {current.competency}
          </Badge>
        )}

        {/* Question */}
        <p className="text-sm font-semibold text-foreground leading-relaxed">{current.question}</p>

        {/* Answer Choices */}
        <div className="space-y-2">
          {current.choices.map((choice) => {
            const isSelected = selectedAnswer === choice;
            const isCorrect = current.correctAnswer === choice;

            let className = "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs ";
            if (!isAnswerRevealed) {
              className += isSelected
                ? "bg-primary/10 border-primary ring-1 ring-primary/30 text-foreground"
                : "bg-card border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground";
            } else {
              if (isCorrect) {
                className += "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300";
              } else if (isSelected && !isCorrect) {
                className += "bg-red-500/10 border-red-500 text-red-800 dark:text-red-300";
              } else {
                className += "bg-muted/30 border-border/50 text-muted-foreground opacity-70";
              }
            }

            return (
              <div key={choice} className={className} onClick={() => handleSelectAnswer(choice)}>
                <div className={`h-4 w-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                  isAnswerRevealed
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-500"
                      : isSelected
                        ? "border-red-500 bg-red-500"
                        : "border-muted-foreground/40"
                    : isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                }`}>
                  {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-3 h-3 text-white" />}
                  {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-3 h-3 text-white" />}
                  {!isAnswerRevealed && isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
                <span className="leading-relaxed">{choice}</span>
              </div>
            );
          })}
        </div>

        {/* Rationale (shown after reveal) */}
        {isAnswerRevealed && current.rationale && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{current.rationale}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-2 pt-1">
          {!isAnswerRevealed ? (
            <Button onClick={handleRevealAnswer} disabled={!selectedAnswer} className="flex-1 font-bold rounded-xl text-xs" size="sm">
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="flex-1 font-bold rounded-xl text-xs gap-1.5" size="sm">
              {currentIndex + 1 >= questions.length ? "Finish Drill" : "Next Question"}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── COMPLETE (Results) ───────────────────────────────────────────────────────
  if (state === "complete") {
    return (
      <div className={`rounded-2xl border border-border/80 bg-card space-y-4 ${compact ? "p-4" : "p-6"}`}>
        {/* Score Header */}
        <div className="text-center space-y-2">
          <div className={`h-16 w-16 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl ${
            finalScore >= 80 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            : finalScore >= 60 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
          }`}>
            {finalScore}%
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              {finalScore >= 80 ? "Excellent!" : finalScore >= 60 ? "Good effort" : "Keep practicing"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {correctCount}/{questions.length} correct · {formatTime(timeElapsed)}
            </p>
          </div>
        </div>

        {/* Per-question review */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
              r.isCorrect ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"
            }`}>
              {r.isCorrect
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
              <span className="text-muted-foreground truncate">{r.question.slice(0, 60)}…</span>
            </div>
          ))}
        </div>

        {/* Retry */}
        <Button variant="outline" onClick={startDrill} className="w-full text-xs font-semibold rounded-xl gap-2" size="sm">
          <RotateCcw className="w-3.5 h-3.5" /> Retry Drill
        </Button>
        {isSaving && <p className="text-[10px] text-center text-muted-foreground">Saving result…</p>}
      </div>
    );
  }

  return null;
}
