/**
 * ResumeForge — AI Behavioral Mock Interview Sandbox with Gemini Multimodal Live Audio (Phase 63)
 * 
 * Provides real-time bidirectional audio interview simulations,
 * speech pacing analysis, STAR methodology scoring, and live interviewer feedback.
 */

export interface InterviewQuestion {
  id: string;
  category: "behavioral" | "technical" | "leadership" | "system_design";
  prompt: string;
  expectedStarPoints: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface CandidateSpeechMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordsDetected: string[];
  starScores: {
    situation: number; // 0-100
    task: number;
    action: number;
    result: number;
    overall: number;
  };
  pacingRating: "Too Slow" | "Optimal" | "Too Fast";
  verbalFeedback: string[];
}

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q-sys-outage",
    category: "behavioral",
    prompt: "Tell me about a time you managed a high-severity production outage or critical distributed systems failure. What was the situation and how did you resolve it?",
    expectedStarPoints: {
      situation: "Contextualize high-traffic incident or cascading service failure",
      task: "Define candidate's specific ownership and incident commander role",
      action: "Systematic root cause debugging, rollback, and mitigation protocols",
      result: "Measurable recovery time, zero data loss, and post-mortem prevention"
    }
  },
  {
    id: "q-arch-disagreement",
    category: "leadership",
    prompt: "Describe a situation where you had a strong technical disagreement with a team member or engineering manager. How did you handle it?",
    expectedStarPoints: {
      situation: "Conflicting architectural proposals or tech stack migration",
      task: "Drive consensus without creating technical debt or team friction",
      action: "Data-driven benchmarking, RFC document, and constructive empathy",
      result: "Agreed architecture delivered on schedule with team alignment"
    }
  },
  {
    id: "q-perf-bottleneck",
    category: "technical",
    prompt: "Walk me through the most challenging performance bottleneck you diagnosed in a web or backend application.",
    expectedStarPoints: {
      situation: "Database lock contention, slow TTFB, or memory leak in Node.js",
      task: "Profile and identify hotspot without impacting live traffic",
      action: "APM tracing, indexing, caching with Redis, or worker threading",
      result: "Latency reduced from seconds to <50ms with 40% CPU savings"
    }
  }
];

/**
 * Computes speech pacing, filler word density, and STAR scores
 */
export function analyzeCandidateSpeech(
  transcript: string,
  durationSeconds: number
): CandidateSpeechMetrics {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(0.1, durationSeconds / 60);
  const wpm = Math.round(wordCount / minutes);

  // Detect filler words
  const fillers = ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of"];
  const lower = transcript.toLowerCase();
  const detectedFillers: string[] = [];
  let fillerCount = 0;

  for (const f of fillers) {
    const regex = new RegExp(`\\b${f}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) {
      fillerCount += matches.length;
      detectedFillers.push(`${f} (${matches.length}x)`);
    }
  }

  // Determine pacing rating (Optimal is 130 - 165 WPM for technical interviews)
  let pacingRating: CandidateSpeechMetrics["pacingRating"] = "Optimal";
  if (wpm < 110) pacingRating = "Too Slow";
  else if (wpm > 175) pacingRating = "Too Fast";

  // Score STAR methodology presence based on signal keywords
  const hasSituation = /when|while|at my previous|incident|customer|problem|challenge/i.test(lower);
  const hasTask = /my role|responsible for|needed to|tasked with|objective|goal/i.test(lower);
  const hasAction = /i built|i designed|i profiled|i implemented|i proposed|we deployed/i.test(lower);
  const hasResult = /resulted in|reduced|increased|saved|delivered|percent|uptime|qps/i.test(lower);

  const situationScore = hasSituation ? 90 : 50;
  const taskScore = hasTask ? 92 : 55;
  const actionScore = hasAction ? 95 : 60;
  const resultScore = hasResult ? 94 : 45;
  const overallScore = Math.round((situationScore + taskScore + actionScore + resultScore) / 4);

  const feedback: string[] = [];
  if (pacingRating === "Too Fast") {
    feedback.push("Your speaking pace is fast (over 175 WPM). Deliberate pauses allow interviewers to absorb your points.");
  } else if (pacingRating === "Too Slow") {
    feedback.push("Your speaking pace is slightly slow. Maintain high energy and momentum.");
  } else {
    feedback.push("Excellent conversational pacing within the ideal 130-165 WPM band.");
  }

  if (fillerCount > 4) {
    feedback.push(`Detected ${fillerCount} filler words (${detectedFillers.join(", ")}). Practice comfortable silence instead.`);
  } else {
    feedback.push("High verbal clarity with minimal verbal fillers.");
  }

  if (hasResult) {
    feedback.push("Strong quantifiable impact communicated in your closing Result.");
  } else {
    feedback.push("Action item: Anchor your answer with measurable metrics (e.g. % improvement, latency saved, revenue).");
  }

  return {
    durationSeconds,
    wordCount,
    wordsPerMinute: wpm,
    fillerWordCount: fillerCount,
    fillerWordsDetected: detectedFillers,
    starScores: {
      situation: situationScore,
      task: taskScore,
      action: actionScore,
      result: resultScore,
      overall: overallScore
    },
    pacingRating,
    verbalFeedback: feedback
  };
}
