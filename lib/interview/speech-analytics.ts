/**
 * Speech & Cadence Analytics Utilities
 * Used for real-time telemetry in the Voice Interview Room and post-interview reports.
 */

export const COMMON_FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "actually",
  "basically",
  "literally",
  "sort of",
  "kind of",
  "so",
  "right",
  "i mean",
  "honestly",
] as const;

export type FillerWord = typeof COMMON_FILLER_WORDS[number];

export interface FillerWordOccurrence {
  word: string;
  count: number;
}

export interface SpeechMetrics {
  durationSeconds: number;
  wordCount: number;
  wpm: number;
  pacingRating: "slow" | "optimal" | "fast";
  pacingLabel: string;
  fillerCount: number;
  fillerDensity: number; // fillers per 100 words
  fillersDetected: FillerWordOccurrence[];
}

/**
 * Counts words in a spoken transcript
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates Words Per Minute (WPM)
 */
export function calculateWpm(wordCount: number, durationSeconds: number): number {
  if (durationSeconds <= 0 || wordCount <= 0) return 0;
  const minutes = durationSeconds / 60;
  return Math.round(wordCount / minutes);
}

/**
 * Classifies speech pacing according to professional speech standards:
 * - < 110 WPM: Too slow / hesitant
 * - 110 - 160 WPM: Optimal conversational interview pace
 * - > 160 WPM: Too fast / rushing
 */
export function classifyPacing(wpm: number): {
  rating: "slow" | "optimal" | "fast";
  label: string;
  advice: string;
} {
  if (wpm < 110) {
    return {
      rating: "slow",
      label: "Deliberate / Slow",
      advice: "Consider picking up your pace slightly to convey more energy and confidence.",
    };
  }
  if (wpm > 160) {
    return {
      rating: "fast",
      label: "Fast / Rushing",
      advice: "Take intentional pauses between points to allow the interviewer to digest your thoughts.",
    };
  }
  return {
    rating: "optimal",
    label: "Optimal Conversational Pace",
    advice: "Great cadence! Your speed allows listeners to follow complex technical explanations clearly.",
  };
}

/**
 * Detects and counts filler words in a spoken transcript
 */
export function detectFillerWords(text: string): {
  totalFillers: number;
  breakdown: FillerWordOccurrence[];
  densityPer100Words: number;
} {
  if (!text || !text.trim()) {
    return { totalFillers: 0, breakdown: [], densityPer100Words: 0 };
  }

  const normalized = text.toLowerCase();
  const wordCount = countWords(text);
  const counts: Record<string, number> = {};
  let totalFillers = 0;

  // Multi-word fillers first (e.g., "you know", "sort of", "kind of", "i mean")
  const multiWordFillers = ["you know", "sort of", "kind of", "i mean"];
  let workingText = normalized;

  for (const phrase of multiWordFillers) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    const matches = workingText.match(regex);
    if (matches && matches.length > 0) {
      counts[phrase] = matches.length;
      totalFillers += matches.length;
      // Remove to prevent double counting single words
      workingText = workingText.replace(regex, " ");
    }
  }

  // Single word fillers
  const singleWordFillers = [
    "um",
    "uh",
    "like",
    "actually",
    "basically",
    "literally",
    "honestly",
  ];

  for (const word of singleWordFillers) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = workingText.match(regex);
    if (matches && matches.length > 0) {
      counts[word] = matches.length;
      totalFillers += matches.length;
    }
  }

  const breakdown: FillerWordOccurrence[] = Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const densityPer100Words = wordCount > 0
    ? Math.round((totalFillers / wordCount) * 100 * 10) / 10
    : 0;

  return {
    totalFillers,
    breakdown,
    densityPer100Words,
  };
}

/**
 * Calculates complete speech metrics for an answer
 */
export function analyzeSpeech(text: string, durationSeconds: number): SpeechMetrics {
  const wordCount = countWords(text);
  const wpm = calculateWpm(wordCount, durationSeconds);
  const pacing = classifyPacing(wpm);
  const fillers = detectFillerWords(text);

  return {
    durationSeconds,
    wordCount,
    wpm,
    pacingRating: pacing.rating,
    pacingLabel: pacing.label,
    fillerCount: fillers.totalFillers,
    fillerDensity: fillers.densityPer100Words,
    fillersDetected: fillers.breakdown,
  };
}
