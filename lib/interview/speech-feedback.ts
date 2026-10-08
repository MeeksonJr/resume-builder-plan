/**
 * AI Mock Interview Speech & Tone Feedback Engine
 * Analyzes speech cadence, filler words, clarity, and STAR response completeness.
 */

export interface SpeechFeedbackAnalysis {
  wordsPerMinute: number;
  cadenceAssessment: "Optimal (130-160 WPM)" | "Too Fast (>170 WPM)" | "Too Slow (<110 WPM)";
  fillerWordCount: number;
  fillerWordList: Array<{ word: string; count: number }>;
  starComplianceScore: number; // 0 - 100
  confidenceIndex: number; // 0 - 100
  actionableTips: string[];
}

export function analyzeInterviewSpeech(transcriptText: string, durationSeconds: number = 60): SpeechFeedbackAnalysis {
  const words = transcriptText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(0.2, durationSeconds / 60);
  const wpm = Math.round(wordCount / minutes);

  let cadence: SpeechFeedbackAnalysis["cadenceAssessment"] = "Optimal (130-160 WPM)";
  if (wpm > 170) cadence = "Too Fast (>170 WPM)";
  else if (wpm < 110) cadence = "Too Slow (<110 WPM)";

  const targetFillers = ["um", "uh", "like", "basically", "actually", "you know", "sort of", "kind of"];
  const counts = new Map<string, number>();
  let totalFillers = 0;

  const lower = transcriptText.toLowerCase();
  targetFillers.forEach((f) => {
    const regex = new RegExp(`\\b${f}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      counts.set(f, matches.length);
      totalFillers += matches.length;
    }
  });

  const fillerList = Array.from(counts.entries()).map(([word, count]) => ({ word, count }));

  // STAR compliance detection
  let starScore = 50;
  if (lower.includes("situation") || lower.includes("when") || lower.includes("at my previous") || lower.includes("during")) starScore += 12;
  if (lower.includes("task") || lower.includes("goal") || lower.includes("needed to") || lower.includes("responsible for")) starScore += 12;
  if (lower.includes("action") || lower.includes("i implemented") || lower.includes("i engineered") || lower.includes("i created")) starScore += 14;
  if (lower.includes("result") || lower.includes("percent") || lower.includes("%") || lower.includes("outcome") || lower.includes("reduced") || lower.includes("increased")) starScore += 12;
  starScore = Math.min(100, starScore);

  const confidence = Math.max(50, Math.min(98, 100 - (totalFillers * 4) + (cadence.startsWith("Optimal") ? 10 : 0)));

  const tips: string[] = [];
  if (totalFillers > 4) {
    tips.push(`Reduce filler words (${totalFillers} detected). Replace pauses with deliberate 1-second silence.`);
  }
  if (cadence !== "Optimal (130-160 WPM)") {
    tips.push(`Adjust speaking tempo. Your current rate is ${wpm} WPM (target: 130-160 WPM).`);
  }
  if (starScore < 80) {
    tips.push("Anchor the finish with an explicit numerical Result (e.g. 'This saved our team 15 hours per week').");
  }
  if (tips.length === 0) {
    tips.push("Superb articulation, confident pacing, and structured problem-solution narrative.");
  }

  return {
    wordsPerMinute: wpm,
    cadenceAssessment: cadence,
    fillerWordCount: totalFillers,
    fillerWordList: fillerList,
    starComplianceScore: starScore,
    confidenceIndex: confidence,
    actionableTips: tips,
  };
}
