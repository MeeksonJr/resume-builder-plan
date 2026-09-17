/**
 * ResumeForge Video Elevator Pitch & Cover Letter Engine (Phase 53)
 * Records and plays 60-second video elevator pitches with AI transcript & delivery scorecard.
 */

export interface VideoPitchScorecard {
  clarityScore: number; // 0 to 100
  pacingWpm: number; // Words per minute (ideal 130-160)
  energyLevel: "High" | "Engaging" | "Composed";
  keyThemes: string[];
  fillerWordCount: number;
}

export interface VideoPitchData {
  id: string;
  resumeId: string;
  candidateName: string;
  roleTitle: string;
  videoUrl: string;
  durationSeconds: number;
  transcript: string;
  scorecard: VideoPitchScorecard;
  recordedAt: string;
}

/**
 * Calculates delivery statistics from a candidate's transcript and recording duration.
 */
export function calculatePitchMetrics(
  transcript: string,
  durationSeconds: number
): VideoPitchScorecard {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(durationSeconds / 60, 0.1);
  const pacingWpm = Math.round(wordCount / minutes);

  // Detect filler words
  const fillerRegex = /\b(um|uh|like|you know|basically|actually)\b/gi;
  const fillerMatches = transcript.match(fillerRegex);
  const fillerWordCount = fillerMatches ? fillerMatches.length : 0;

  // Clarity score: base 90 minus penalty for filler words or extreme pacing
  let clarity = 92;
  clarity -= Math.min(fillerWordCount * 3, 20);
  if (pacingWpm < 110 || pacingWpm > 180) clarity -= 10;
  clarity = Math.max(65, Math.min(99, clarity));

  // Key themes / buzzwords
  const commonKeywords = [
    { name: "architecture", regex: /\barchitect(?:ed|ure|s|ing)?\b/i },
    { name: "leadership", regex: /\bleader(?:ship)?\b/i },
    { name: "distributed systems", regex: /\bdistributed systems\b/i },
    { name: "cloud", regex: /\bcloud\b/i },
    { name: "scaled", regex: /\bscal(?:e|ed|ing)\b/i },
    { name: "optimized", regex: /\boptimiz(?:e|ed|ation)\b/i },
    { name: "ai", regex: /\bai\b/i },
    { name: "latency", regex: /\blatency\b/i },
    { name: "security", regex: /\bsecurity\b/i },
    { name: "collaboration", regex: /\bcollab(?:oration)?\b/i },
  ];
  const detectedThemes = commonKeywords
    .filter((kw) => kw.regex.test(transcript))
    .map((kw) => kw.name);

  let energyLevel: "High" | "Engaging" | "Composed" = "Engaging";
  if (pacingWpm > 155) energyLevel = "High";
  if (pacingWpm < 125) energyLevel = "Composed";

  return {
    clarityScore: clarity,
    pacingWpm,
    energyLevel,
    keyThemes: detectedThemes.length > 0 ? detectedThemes : ["execution", "delivery"],
    fillerWordCount,
  };
}

/**
 * Formats seconds into MM:SS string.
 */
export function formatPitchDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Curated high-fidelity demo elevator pitches for instant showcase.
 */
export const DEMO_PITCHES: Record<string, VideoPitchData> = {
  default: {
    id: "pitch-default",
    resumeId: "resume-default",
    candidateName: "Alex Morgan",
    roleTitle: "Staff Software Architect",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    durationSeconds: 58,
    transcript:
      "Hi, I'm Alex Morgan. Over the past 7 years, I've specialized in distributed systems architecture and cloud platforms. At CloudScale, I led the migration of 40+ microservices to Kubernetes, driving down p99 latency by 35% and saving over $180,000 annually. I'm passionate about engineering velocity, robust developer tooling, and mentorship. If you're building mission-critical platforms, I'd love to connect!",
    scorecard: {
      clarityScore: 96,
      pacingWpm: 142,
      energyLevel: "Engaging",
      keyThemes: ["distributed systems", "kubernetes", "cloud", "latency"],
      fillerWordCount: 0,
    },
    recordedAt: "2026-09-15T14:30:00Z",
  },
};
