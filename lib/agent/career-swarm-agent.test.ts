import { describe, it, expect } from "vitest";
import {
  DEFAULT_SWARM_PREFERENCES,
  MOCK_SWARM_TASKS,
  evaluateJobForSwarm,
  calculateSwarmMetrics
} from "./career-swarm-agent";

describe("Phase 60: Autonomous Career Agent Swarm", () => {
  it("approves high match roles that satisfy salary and company conditions", () => {
    const job = {
      company: "Anthropic",
      role: "AI Alignment Engineer",
      salary: 220000,
      matchScore: 92,
    };

    const evalResult = evaluateJobForSwarm(job, DEFAULT_SWARM_PREFERENCES);
    expect(evalResult.eligible).toBe(true);
    expect(evalResult.reason).toBeUndefined();
  });

  it("rejects jobs below candidate's minimum ATS score threshold", () => {
    const job = {
      company: "RandomTech",
      role: "Fullstack Dev",
      salary: 190000,
      matchScore: 70, // below 82
    };

    const evalResult = evaluateJobForSwarm(job, DEFAULT_SWARM_PREFERENCES);
    expect(evalResult.eligible).toBe(false);
    expect(evalResult.reason).toContain("below minimum threshold");
  });

  it("rejects blacklisted companies immediately", () => {
    const job = {
      company: "SpamAgency LLC",
      role: "Lead Architect",
      salary: 250000,
      matchScore: 99,
    };

    const evalResult = evaluateJobForSwarm(job, DEFAULT_SWARM_PREFERENCES);
    expect(evalResult.eligible).toBe(false);
    expect(evalResult.reason).toContain("blacklist");
  });

  it("calculates real-time swarm operational metrics correctly", () => {
    const metrics = calculateSwarmMetrics(MOCK_SWARM_TASKS);
    expect(metrics.totalScouted).toBe(3);
    expect(metrics.dispatchedToday).toBe(1);
    expect(metrics.pendingApprovalCount).toBe(1);
    expect(metrics.averageMatchScore).toBeGreaterThanOrEqual(90);
  });
});
