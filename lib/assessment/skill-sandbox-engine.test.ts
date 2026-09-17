import { describe, it, expect } from "vitest";
import {
  SANDBOXED_CHALLENGES,
  executeSandboxedChallenge,
  generateCryptographicBadgeSignature,
  verifyCryptographicSkillBadge,
} from "./skill-sandbox-engine";

describe("Skill Verification Coding Challenge Sandbox (Phase 69)", () => {
  it("executes LRU Cache challenge and verifies all tests pass with score 100", async () => {
    const challenge = SANDBOXED_CHALLENGES[0];
    const result = await executeSandboxedChallenge(challenge, challenge.starterCode, "Jane Doe");

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.passedTests).toBe(3);
    expect(result.badge).toBeDefined();
    expect(result.badge?.signatureHash).toMatch(/^0x/);
  });

  it("handles failing code and syntax errors safely without crashing the sandbox", async () => {
    const challenge = SANDBOXED_CHALLENGES[0];
    const badCode = `
      class LRUCache {
        get() { return -999; }
        put() {}
      }
    `;
    const result = await executeSandboxedChallenge(challenge, badCode, "Jane Doe");

    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(100);
    expect(result.badge).toBeUndefined();
  });

  it("generates deterministic cryptographic badge signature and verifies authenticity", () => {
    const badgePayload = {
      candidateName: "Elena Rostova",
      challengeId: "token-bucket-rate-limiter",
      score: 100,
      issuedAt: "2026-09-17T12:00:00Z",
    };

    const { hash, payload } = generateCryptographicBadgeSignature(badgePayload);
    expect(hash.startsWith("0x")).toBe(true);

    const mockBadge = {
      badgeId: "badge-123",
      ...badgePayload,
      challengeTitle: "Token Bucket Rate Limiter",
      difficulty: "Hard" as const,
      executionTimeMs: 14,
      testCasesPassed: 2,
      totalTestCases: 2,
      signatureAlgorithm: "HMAC-SHA256" as const,
      signatureHash: hash,
      verifiablePayload: payload,
      explorerUrl: `https://resumeforge.io/verify/badge/${hash}`,
    };

    const verification = verifyCryptographicSkillBadge(mockBadge);
    expect(verification.valid).toBe(true);

    // Tampering check: altering score must invalidate signature
    const tamperedBadge = { ...mockBadge, score: 90 };
    const tamperedVerification = verifyCryptographicSkillBadge(tamperedBadge);
    expect(tamperedVerification.valid).toBe(false);
  });

  it("executes multi-disciplinary challenges across Data and Product Management", async () => {
    // Data & BI LTV challenge
    const dataChallenge = SANDBOXED_CHALLENGES.find((c) => c.id === "cohort-retention-ltv")!;
    expect(dataChallenge).toBeDefined();
    const dataRes = await executeSandboxedChallenge(dataChallenge, dataChallenge.starterCode, "Data Lead");
    expect(dataRes.passed).toBe(true);
    expect(dataRes.score).toBe(100);

    // Product Management RICE challenge
    const prodChallenge = SANDBOXED_CHALLENGES.find((c) => c.id === "rice-score-prioritization")!;
    expect(prodChallenge).toBeDefined();
    const prodRes = await executeSandboxedChallenge(prodChallenge, prodChallenge.starterCode, "Product Lead");
    expect(prodRes.passed).toBe(true);
    expect(prodRes.score).toBe(100);
  });
});
