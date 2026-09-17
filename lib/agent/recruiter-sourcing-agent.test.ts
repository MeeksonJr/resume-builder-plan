import { describe, it, expect } from "vitest";
import {
  extractSalaryOfferAmount,
  evaluateRecruiterRequest,
  runSourcingAgentBatch,
  DEFAULT_AGENT_CONFIG,
} from "./recruiter-sourcing-agent";
import { RecruiterIntroRequest, CandidateMarketplaceProfile } from "@/lib/marketplace/reverse-job-board";

const mockCandidate: CandidateMarketplaceProfile = {
  id: "cand-101",
  userId: "user-101",
  realName: "Sarah Connor",
  email: "sarah@resumeforge.io",
  headline: "Staff Cloud Engineer",
  maskedHeadline: "Staff Cloud Engineer (Ex-Faang)",
  currentCompany: "Acme Cloud",
  hideCurrentCompany: false,
  yearsExperience: 8,
  primarySkills: ["Go", "Kubernetes", "AWS"],
  desiredRole: "Staff Software Engineer",
  desiredSalaryMin: 190000,
  desiredSalaryMax: 260000,
  remotePreference: "Remote Only",
  availability: "actively_looking",
  isAnonymous: true,
  atsScore: 94,
  bioSnippet: "Distributed systems specialist",
  createdAt: new Date().toISOString(),
};

const sampleRequests: RecruiterIntroRequest[] = [
  {
    id: "req-stripe",
    candidateId: "cand-101",
    recruiterId: "rec-1",
    recruiterName: "Alex Vance",
    recruiterCompany: "Stripe",
    recruiterEmail: "alex@stripe.com",
    jobRole: "Staff Infrastructure Engineer",
    salaryOffered: "$220,000 - $260,000 + Equity",
    customPitch: "We love your background in high-concurrency microservices and want to invite you to lead our real-time payments pipeline.",
    status: "pending_review",
    requestedAt: new Date().toISOString(),
  },
  {
    id: "req-spam",
    candidateId: "cand-101",
    recruiterId: "rec-2",
    recruiterName: "Max Payne",
    recruiterCompany: "CryptoCasino Ltd",
    recruiterEmail: "max@cryptocasino.biz",
    jobRole: "Lead Solidity Hacker",
    salaryOffered: "$300k",
    customPitch: "Instant hire offshore crypto project!",
    status: "pending_review",
    requestedAt: new Date().toISOString(),
  },
  {
    id: "req-vague",
    candidateId: "cand-101",
    recruiterId: "rec-3",
    recruiterName: "Jordan Smith",
    recruiterCompany: "Stealth AI Seed",
    recruiterEmail: "jordan@stealth.ai",
    jobRole: "Senior Backend Engineer",
    salaryOffered: "Competitive",
    customPitch: "Early stage AI seed round startup looking for core team members.",
    status: "pending_review",
    requestedAt: new Date().toISOString(),
  },
];

describe("Autonomous Recruiter Sourcing Agent (Phase 67)", () => {
  it("parses numeric salary bands correctly from diverse strings", () => {
    expect(extractSalaryOfferAmount("$220,000 - $260,000")).toBe(220000);
    expect(extractSalaryOfferAmount("$195k")).toBe(195000);
    expect(extractSalaryOfferAmount("210k - 250k")).toBe(210000);
    expect(extractSalaryOfferAmount("Competitive")).toBe(0);
  });

  it("qualifies high-match inbound requests and synthesizes calendar scheduling links", () => {
    const evalResult = evaluateRecruiterRequest(sampleRequests[0], mockCandidate, DEFAULT_AGENT_CONFIG);
    expect(evalResult.status).toBe("qualified_scheduled");
    expect(evalResult.matchScore).toBeGreaterThanOrEqual(80);
    expect(evalResult.generatedReplyMessage).toContain("https://cal.com/candidate/intro-chat");
    expect(evalResult.generatedReplyMessage).toContain("Alex Vance");
  });

  it("declines blacklisted companies automatically", () => {
    const evalResult = evaluateRecruiterRequest(sampleRequests[1], mockCandidate, DEFAULT_AGENT_CONFIG);
    expect(evalResult.status).toBe("politely_declined");
    expect(evalResult.evaluationReasons[0]).toContain("blacklist");
  });

  it("requests compensation clarity for vague offers before booking calendar time", () => {
    const evalResult = evaluateRecruiterRequest(sampleRequests[2], mockCandidate, DEFAULT_AGENT_CONFIG);
    expect(evalResult.status).toBe("needs_clarification");
    expect(evalResult.generatedReplyMessage).toContain("total compensation band");
  });

  it("executes batch scans across inbound recruiter queue", () => {
    const { evaluations, stats } = runSourcingAgentBatch(sampleRequests, mockCandidate, DEFAULT_AGENT_CONFIG);
    expect(evaluations.length).toBe(3);
    expect(stats.totalScanned).toBe(3);
    expect(stats.qualifiedAndScheduled).toBe(1);
    expect(stats.declinedUnmatched).toBe(1);
    expect(stats.pendingClarification).toBe(1);
  });
});
