import { describe, it, expect } from "vitest";
import {
  MOCK_INTERVIEW_QUESTIONS,
  analyzeCandidateSpeech,
} from "./live-mock-sandbox";

describe("Phase 63 — AI Behavioral Mock Interview Sandbox", () => {
  it("provides curated mock interview questions with STAR benchmarks", () => {
    expect(MOCK_INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(3);
    const firstQ = MOCK_INTERVIEW_QUESTIONS[0];
    expect(firstQ.expectedStarPoints.situation).toBeDefined();
    expect(firstQ.expectedStarPoints.task).toBeDefined();
    expect(firstQ.expectedStarPoints.action).toBeDefined();
    expect(firstQ.expectedStarPoints.result).toBeDefined();
  });

  it("calculates speech pacing and identifies filler words correctly", () => {
    const transcript =
      "Um, so basically at my previous company we had an incident where customer traffic crashed. My role was incident commander. I implemented a rollback and profiled the memory leak. This resulted in 99.99% uptime and reduced latency by 45 percent.";
    
    const analysis = analyzeCandidateSpeech(transcript, 15); // 15 seconds for ~36 words -> ~144 WPM
    expect(analysis.wordCount).toBeGreaterThan(25);
    expect(analysis.wordsPerMinute).toBeGreaterThan(120);
    expect(analysis.pacingRating).toBe("Optimal");
    expect(analysis.fillerWordCount).toBeGreaterThanOrEqual(2); // "um", "basically"
    expect(analysis.starScores.situation).toBe(90);
    expect(analysis.starScores.task).toBe(92);
    expect(analysis.starScores.action).toBe(95);
    expect(analysis.starScores.result).toBe(94);
    expect(analysis.starScores.overall).toBeGreaterThan(90);
  });

  it("identifies missing results and flags too slow pacing", () => {
    const slowTranscript = "Uh... I worked on a problem. That was it.";
    const analysis = analyzeCandidateSpeech(slowTranscript, 45); // 8 words in 45s -> ~11 WPM
    expect(analysis.pacingRating).toBe("Too Slow");
    expect(analysis.starScores.result).toBe(45);
    expect(analysis.verbalFeedback.some(f => f.includes("measurable metrics"))).toBe(true);
  });
});
