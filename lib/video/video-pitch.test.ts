import { describe, it, expect } from "vitest";
import {
  calculatePitchMetrics,
  formatPitchDuration,
  DEMO_PITCHES,
} from "./video-pitch";

describe("Video Elevator Pitch & Cover Letter Engine (Phase 53)", () => {
  it("formats seconds into MM:SS format accurately", () => {
    expect(formatPitchDuration(58)).toBe("0:58");
    expect(formatPitchDuration(65)).toBe("1:05");
    expect(formatPitchDuration(0)).toBe("0:00");
  });

  it("calculates speech pacing and clarity metrics accurately", () => {
    const text =
      "Hello team! I am excited to apply for this engineering leadership role. I have architected cloud systems and optimized distributed systems for high scale.";
    const scorecard = calculatePitchMetrics(text, 10); // 10 seconds

    expect(scorecard.pacingWpm).toBeGreaterThan(100);
    expect(scorecard.clarityScore).toBeGreaterThanOrEqual(65);
    expect(scorecard.clarityScore).toBeLessThanOrEqual(99);
    expect(scorecard.keyThemes).toContain("architecture");
    expect(scorecard.keyThemes).toContain("distributed systems");
  });

  it("penalizes filler words in speech clarity calculation", () => {
    const cleanSpeech = "I led the engineering team to deploy our new product.";
    const fillerSpeech = "Um like I basically you know led the engineering team to deploy.";

    const cleanMetrics = calculatePitchMetrics(cleanSpeech, 15);
    const fillerMetrics = calculatePitchMetrics(fillerSpeech, 15);

    expect(fillerMetrics.fillerWordCount).toBeGreaterThanOrEqual(3);
    expect(fillerMetrics.clarityScore).toBeLessThan(cleanMetrics.clarityScore);
  });

  it("loads default demo pitch fixture with high quality metrics", () => {
    const pitch = DEMO_PITCHES.default;
    expect(pitch.candidateName).toBe("Alex Morgan");
    expect(pitch.durationSeconds).toBe(58);
    expect(pitch.scorecard.clarityScore).toBe(96);
  });
});
