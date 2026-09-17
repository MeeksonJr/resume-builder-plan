import { describe, it, expect } from "vitest";
import { screenPeerReviewContent } from "./content-moderation";

describe("Content Moderation Engine", () => {
  it("allows constructive professional feedback", () => {
    const feedback = "Great achievement bullet on reducing latency. Consider adding the specific tool (e.g. Redis) used.";
    const result = screenPeerReviewContent(feedback);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("blocks offensive profanity", () => {
    const offensive = "This resume is absolute shit and looks horrible.";
    const result = screenPeerReviewContent(offensive);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Profanity or vulgar language");
  });

  it("blocks harassment and hate speech", () => {
    const toxic = "You are an idiot, delete your resume.";
    const result = screenPeerReviewContent(toxic);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });
});
