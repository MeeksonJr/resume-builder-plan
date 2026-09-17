import { describe, it, expect } from "vitest";
import {
  ASSESSMENT_CHALLENGES,
  evaluateAssessmentSubmission
} from "./skill-sandbox";

describe("Phase 59: Candidate Skill Assessment Sandbox", () => {
  it("provides rich curated challenges covering frontend, database, and systems", () => {
    expect(ASSESSMENT_CHALLENGES.length).toBeGreaterThanOrEqual(3);
    const categories = ASSESSMENT_CHALLENGES.map(c => c.category);
    expect(categories).toContain("frontend");
    expect(categories).toContain("database");
    expect(categories).toContain("systems");
  });

  it("evaluates a valid complete submission and issues a verifiable skill badge", () => {
    const challenge = ASSESSMENT_CHALLENGES[0];
    const result = evaluateAssessmentSubmission(challenge.id, challenge.starterCode);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.badge).toBeDefined();
    expect(result.badge?.tier).toBe("Elite Top 5%");
    expect(result.badge?.verificationHash).toMatch(/^0x[a-f0-9]{40}$/);
  });

  it("fails incomplete submission with appropriate error diagnostic", () => {
    const challenge = ASSESSMENT_CHALLENGES[0];
    const result = evaluateAssessmentSubmission(challenge.id, "throw new Error('Not implemented');");

    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.badge).toBeUndefined();
    expect(result.testOutputs[0].passed).toBe(false);
  });
});
