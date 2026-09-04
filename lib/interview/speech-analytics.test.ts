import { describe, it, expect } from "vitest";
import {
  countWords,
  calculateWpm,
  classifyPacing,
  detectFillerWords,
  analyzeSpeech,
} from "./speech-analytics";

describe("Speech Analytics Utilities", () => {
  it("counts words correctly", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("Hello world")).toBe(2);
    expect(countWords("I engineered a scalable Next.js and Supabase architecture.")).toBe(8);
  });

  it("calculates WPM accurately", () => {
    // 130 words in 60 seconds = 130 WPM
    expect(calculateWpm(130, 60)).toBe(130);
    // 65 words in 30 seconds = 130 WPM
    expect(calculateWpm(65, 30)).toBe(130);
    // 0 words or 0 duration
    expect(calculateWpm(0, 30)).toBe(0);
    expect(calculateWpm(100, 0)).toBe(0);
  });

  it("classifies pacing according to communication standards", () => {
    expect(classifyPacing(95).rating).toBe("slow");
    expect(classifyPacing(135).rating).toBe("optimal");
    expect(classifyPacing(180).rating).toBe("fast");
  });

  it("detects single and multi-word filler words", () => {
    const text =
      "Um, so basically I was working on the API and, like, you know, we actually hit a bottleneck.";
    const result = detectFillerWords(text);

    expect(result.totalFillers).toBeGreaterThanOrEqual(4);
    const words = result.breakdown.map((b) => b.word);
    expect(words).toContain("um");
    expect(words).toContain("basically");
    expect(words).toContain("like");
    expect(words).toContain("you know");
    expect(words).toContain("actually");
    expect(result.densityPer100Words).toBeGreaterThan(0);
  });

  it("produces a comprehensive SpeechMetrics payload", () => {
    const speech = "I led the migration to a microservices architecture, improving latency by 35 percent.";
    const metrics = analyzeSpeech(speech, 6);

    expect(metrics.wordCount).toBe(13);
    expect(metrics.durationSeconds).toBe(6);
    expect(metrics.wpm).toBe(130);
    expect(metrics.pacingRating).toBe("optimal");
    expect(metrics.fillerCount).toBe(0);
  });
});
