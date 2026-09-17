import { describe, it, expect } from "vitest";
import {
  segmentPitchScript,
  calculateTeleprompterPacing,
  evaluateEyeContact,
  TELEPROMPTER_PRESETS,
} from "./ai-teleprompter";

describe("Phase 70: AI Teleprompter & Eye Contact Engine", () => {
  it("segments scripts into 3 standardized pitch sections", () => {
    const rawScript =
      "Hello, I am a lead engineer specializing in full-stack web applications. Recently, I redesigned our database caching tier and sped up read queries by 4x across 10 million daily active requests. This decreased server expenditures by $50,000 each quarter. I would love to bring this execution rigor to your engineering team. Thank you!";
    
    const sections = segmentPitchScript(rawScript);
    expect(sections.length).toBe(3);
    expect(sections[0].targetSecondsStart).toBe(0);
    expect(sections[0].targetSecondsEnd).toBe(15);
    expect(sections[1].targetSecondsStart).toBe(15);
    expect(sections[1].targetSecondsEnd).toBe(45);
    expect(sections[2].targetSecondsStart).toBe(45);
    expect(sections[2].targetSecondsEnd).toBe(60);
  });

  it("handles fallback segmentation for empty script", () => {
    const sections = segmentPitchScript("");
    expect(sections.length).toBe(3);
    expect(sections[0].text).toContain("software engineer");
  });

  it("calculates accurate teleprompter pacing and scroll physics", () => {
    const script =
      "One two three four five six seven eight nine ten " +
      "eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty";
    const pacing = calculateTeleprompterPacing(script, 60, 140, 30, 7);

    expect(pacing.totalWords).toBe(20);
    expect(pacing.actualWpm).toBe(20); // 20 words in 60 seconds is 20 WPM
    expect(pacing.cadenceStatus).toBe("Too Slow");
    expect(pacing.scrollSpeedPxPerSec).toBeGreaterThan(0);
  });

  it("evaluates eye contact gaze metrics with lens alignment detection", () => {
    // Optimal center gaze
    const centerGaze = evaluateEyeContact(0.5, 0.45, 90);
    expect(centerGaze.isOptimalGaze).toBe(true);
    expect(centerGaze.gazeState).toBe("direct-eye-contact");
    expect(centerGaze.scorePercentage).toBe(91);

    // Looking down at script / keyboard
    const lookingDown = evaluateEyeContact(0.5, 0.75, 90);
    expect(lookingDown.isOptimalGaze).toBe(false);
    expect(lookingDown.gazeState).toBe("looking-down");
    expect(lookingDown.feedbackMessage).toContain("Looking down");
    expect(lookingDown.scorePercentage).toBeLessThan(90);

    // Gaze drifting left
    const driftingLeft = evaluateEyeContact(0.2, 0.45, 90);
    expect(driftingLeft.gazeState).toBe("drifting-left");
  });

  it("provides rich curated industry presets", () => {
    expect(TELEPROMPTER_PRESETS.length).toBeGreaterThanOrEqual(2);
    const fs = TELEPROMPTER_PRESETS[0];
    expect(fs.sections.length).toBe(3);
    expect(fs.defaultWpm).toBe(145);
  });
});
