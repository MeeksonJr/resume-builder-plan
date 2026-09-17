"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MOCK_INTERVIEW_QUESTIONS,
  InterviewQuestion,
  CandidateSpeechMetrics,
  analyzeCandidateSpeech,
} from "@/lib/interview/live-mock-sandbox";
import { Mic, MicOff, Play, RotateCcw, Volume2, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveMockInterviewRoom() {
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion>(MOCK_INTERVIEW_QUESTIONS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [metrics, setMetrics] = useState<CandidateSpeechMetrics | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(15));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveRef = useRef<NodeJS.Timeout | null>(null);

  // Audio waveform animation simulation when recording
  useEffect(() => {
    if (isRecording) {
      waveRef.current = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 24 }, () => Math.floor(Math.random() * 65) + 15)
        );
      }, 100);
    } else {
      if (waveRef.current) clearInterval(waveRef.current);
      setWaveformBars(Array(24).fill(15));
    }
    return () => {
      if (waveRef.current) clearInterval(waveRef.current);
    };
  }, [isRecording]);

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartSimulatedLive = () => {
    setIsRecording(true);
    setDuration(0);
    setTranscript("");
    setMetrics(null);

    // Progressive simulated candidate response stream
    const chunks = [
      "At my previous tech lead role,",
      " we faced a critical P0 database deadlock spike during our Black Friday surge.",
      " My task was to act as incident commander and prevent data corruption.",
      " I quickly coordinated a traffic shed, analyzed the pg_stat_activity logs,",
      " and deployed a hotfix that restructured the write transaction locks.",
      " As a result, we restored 100% throughput within 18 minutes, avoided $350k in checkout drop-offs,",
      " and maintained 99.99% system availability with zero lost orders."
    ];

    let step = 0;
    const streamInterval = setInterval(() => {
      if (step < chunks.length) {
        setTranscript((prev) => (prev ? prev + chunks[step] : chunks[step]));
        step++;
      } else {
        clearInterval(streamInterval);
      }
    }, 1800);
  };

  const handleStopAndAnalyze = () => {
    setIsRecording(false);
    const result = analyzeCandidateSpeech(
      transcript || "At my previous company I resolved an outage which saved our uptime.",
      Math.max(duration, 25)
    );
    setMetrics(result);
  };

  const handleReset = () => {
    setIsRecording(false);
    setDuration(0);
    setTranscript("");
    setMetrics(null);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Multimodal Live Audio Sandbox (Phase 63)
          </div>
          <h2 className="text-xl font-bold text-foreground">AI Behavioral Mock Interview Room</h2>
          <p className="text-sm text-muted-foreground">
            Simulate real-time voice interviews with live conversational feedback, pacing telemetry, and STAR scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {MOCK_INTERVIEW_QUESTIONS.map((q, idx) => (
            <Button
              key={q.id}
              size="sm"
              variant={selectedQuestion.id === q.id ? "default" : "outline"}
              onClick={() => {
                setSelectedQuestion(q);
                handleReset();
              }}
              className="text-xs"
            >
              Scenario {idx + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-muted/40 rounded-xl p-4 border border-border">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interviewer Prompt</span>
        <p className="text-base font-medium text-foreground mt-1">{selectedQuestion.prompt}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
          <div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Situation:</span>{" "}
            <span className="text-muted-foreground">{selectedQuestion.expectedStarPoints.situation}</span>
          </div>
          <div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Task:</span>{" "}
            <span className="text-muted-foreground">{selectedQuestion.expectedStarPoints.task}</span>
          </div>
          <div>
            <span className="font-semibold text-purple-600 dark:text-purple-400">Action:</span>{" "}
            <span className="text-muted-foreground">{selectedQuestion.expectedStarPoints.action}</span>
          </div>
          <div>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Result:</span>{" "}
            <span className="text-muted-foreground">{selectedQuestion.expectedStarPoints.result}</span>
          </div>
        </div>
      </div>

      {/* Voice Controls & Waveform */}
      <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border border-border text-center space-y-4">
        {/* Animated Waveform */}
        <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-md">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={`w-2 rounded-full transition-all duration-75 ${
                isRecording
                  ? "bg-gradient-to-t from-emerald-500 to-teal-400"
                  : "bg-muted-foreground/20"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <div className="text-sm font-mono text-muted-foreground">
          {isRecording ? (
            <span className="text-red-500 font-bold animate-pulse">● Live Audio Connected ({duration}s)</span>
          ) : duration > 0 ? (
            `Session duration: ${duration}s`
          ) : (
            "Microphone idle — ready for live prompt"
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              onClick={handleStartSimulatedLive}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Mic className="w-4 h-4" /> Start Live Voice Simulation
            </Button>
          ) : (
            <Button
              onClick={handleStopAndAnalyze}
              variant="destructive"
              className="gap-2"
            >
              <MicOff className="w-4 h-4" /> Stop & Analyze Response
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Live Transcript Stream */}
      {transcript && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Live Speech-to-Text Transcript</span>
            {isRecording && <span className="text-xs text-emerald-600 animate-pulse font-medium">Listening...</span>}
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">"{transcript}"</p>
        </div>
      )}

      {/* Metrics & STAR Evaluation */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Pacing Card */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Pacing & Flow</span>
            <div className="text-2xl font-bold text-foreground mt-1">{metrics.wordsPerMinute} WPM</div>
            <div className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600">
              {metrics.pacingRating}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Fillers detected: {metrics.fillerWordCount > 0 ? metrics.fillerWordsDetected.join(", ") : "None (Clean)"}
            </p>
          </div>

          {/* STAR Score Card */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground uppercase font-semibold">STAR Methodology</span>
            <div className="text-2xl font-bold text-foreground mt-1">{metrics.starScores.overall}%</div>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mt-2">
              <div>Situation: <span className="font-semibold text-foreground">{metrics.starScores.situation}%</span></div>
              <div>Task: <span className="font-semibold text-foreground">{metrics.starScores.task}%</span></div>
              <div>Action: <span className="font-semibold text-foreground">{metrics.starScores.action}%</span></div>
              <div>Result: <span className="font-semibold text-foreground">{metrics.starScores.result}%</span></div>
            </div>
          </div>

          {/* AI Coach Feedback Card */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Gemini Coach Advice</span>
            <ul className="text-xs text-foreground/90 space-y-1.5 mt-2">
              {metrics.verbalFeedback.map((fb, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{fb}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
