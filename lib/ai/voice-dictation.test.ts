import { describe, it, expect } from "vitest";
import {
  cleanSpokenTranscript,
  extractMetrics,
  formatSpokenBulletPoint,
} from "./voice-dictation";

describe("Voice-Driven AI Resume Editor (Phase 52)", () => {
  it("strips conversational filler words and disfluencies", () => {
    const raw = "Um basically I was like managing uh the migration you know to Kubernetes";
    const cleaned = cleanSpokenTranscript(raw);
    expect(cleaned).not.toContain("basically");
    expect(cleaned).not.toContain("like");
    expect(cleaned).not.toContain("you know");
    expect(cleaned).not.toContain("um");
    expect(cleaned).not.toContain("uh");
    expect(cleaned).toContain("Kubernetes");
  });

  it("extracts quantifiable metrics from spoken text", () => {
    const text = "Reduced latency by 45% and saved $50,000 across 12 microservices with 500k users";
    const metrics = extractMetrics(text);
    expect(metrics).toContain("45%");
    expect(metrics).toContain("$50,000");
    expect(metrics).toContain("12 microservices");
    expect(metrics).toContain("500k");
  });

  it("formats spoken conversational statements into STAR bullet points", () => {
    const spoken = "I led the migration to AWS and reduced deployment times by 60%";
    const result = formatSpokenBulletPoint(spoken, "executive");

    expect(result.bulletPoint).toMatch(/\.$/); // ends with period
    expect(result.bulletPoint.length).toBeGreaterThan(20);
    expect(result.metricsDetected).toContain("60%");
    expect(result.tone).toBe("executive");
  });

  it("handles empty or whitespace inputs gracefully", () => {
    const result = formatSpokenBulletPoint("   ", "concise");
    expect(result.bulletPoint).toBe("");
    expect(result.metricsDetected).toEqual([]);
  });
});
