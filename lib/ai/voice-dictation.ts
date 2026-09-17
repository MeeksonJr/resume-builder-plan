/**
 * ResumeForge Voice-Driven AI Resume Editor (Phase 52)
 * Converts casual spoken dictation into high-impact STAR formatted ATS bullet points.
 */

export type VoiceTone = "executive" | "technical" | "concise";

export interface CleanedBulletResult {
  rawTranscript: string;
  cleanedText: string;
  bulletPoint: string;
  metricsDetected: string[];
  tone: VoiceTone;
}

const FILLER_WORDS = [
  /\bum+\b/gi,
  /\buh+\b/gi,
  /\blike\b/gi,
  /\byou know\b/gi,
  /\bbasically\b/gi,
  /\bactually\b/gi,
  /\bso yeah\b/gi,
  /\bI guess\b/gi,
  /\bsort of\b/gi,
  /\bkind of\b/gi,
];

const STRONG_VERBS: Record<VoiceTone, string[]> = {
  executive: [
    "Spearheaded",
    "Orchestrated",
    "Championed",
    "Pioneered",
    "Directed",
    "Transformed",
    "Steered",
  ],
  technical: [
    "Architected",
    "Engineered",
    "Implemented",
    "Automated",
    "Optimized",
    "Refactored",
    "Deployed",
  ],
  concise: [
    "Built",
    "Led",
    "Designed",
    "Delivered",
    "Resolved",
    "Scaled",
    "Generated",
  ],
};

/**
 * Strips verbal conversational disfluencies and cleans punctuation.
 */
export function cleanSpokenTranscript(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let cleaned = raw.trim();
  for (const pattern of FILLER_WORDS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  // Normalize excessive spaces and clean double punctuation
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.,!?;:]){2,}/g, "$1")
    .trim();

  return cleaned;
}

/**
 * Detects numbers, percentages, currency, and quantifiable metrics in spoken text.
 */
export function extractMetrics(text: string): string[] {
  const metricRegex = /(\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?(?:k|m|b)?|\b\d+(?:x|k|m)\b|\b\d+\s+(?:users|clients|engineers|microservices|servers|requests|nodes|teams|projects)\b)/gi;
  const matches = text.match(metricRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Formats a spoken conversational statement into an ATS-optimized STAR bullet point.
 */
export function formatSpokenBulletPoint(
  spokenText: string,
  tone: VoiceTone = "technical"
): CleanedBulletResult {
  const cleaned = cleanSpokenTranscript(spokenText);
  if (!cleaned) {
    return {
      rawTranscript: spokenText,
      cleanedText: "",
      bulletPoint: "",
      metricsDetected: [],
      tone,
    };
  }

  const metrics = extractMetrics(cleaned);
  const verbs = STRONG_VERBS[tone];
  const chosenVerb = verbs[Math.floor(Math.random() * verbs.length)];

  // Remove leading personal pronouns ("I did", "I worked on", "I was responsible for", "We built")
  let body = cleaned.replace(/^(?:i\s+(?:was\s+responsible\s+for|managed\s+to|worked\s+on|helped\s+to|did|built|made|created|handled|spearheaded|led|designed)?|we\s+(?:built|worked\s+on|did|made|handled))\s*/i, "");

  // If first character isn't capital, lowercase the transition
  if (body.length > 0) {
    body = body.charAt(0).toLowerCase() + body.slice(1);
  }

  // If the body already starts with an action verb, preserve or adapt
  let bulletPoint = `${chosenVerb} ${body}`;

  // Ensure ends with a period
  if (!bulletPoint.endsWith(".")) {
    bulletPoint += ".";
  }

  // Capitalize the first letter
  bulletPoint = bulletPoint.charAt(0).toUpperCase() + bulletPoint.slice(1);

  return {
    rawTranscript: spokenText,
    cleanedText: cleaned,
    bulletPoint,
    metricsDetected: metrics,
    tone,
  };
}

/**
 * Browser Web Speech API type detection and instantiation.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}
