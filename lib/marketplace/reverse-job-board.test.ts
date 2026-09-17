import { describe, it, expect } from "vitest";
import {
  SAMPLE_MARKETPLACE_CANDIDATES,
  getMaskedCandidateView,
  createIntroRequest,
  respondToIntroRequest,
} from "./reverse-job-board";

describe("Phase 64 — Talent Marketplace & Reverse Job Board", () => {
  const candidate = SAMPLE_MARKETPLACE_CANDIDATES[0]; // Elena Rostova, Stripe, hideCurrentCompany = true

  it("masks real name, contact info, and employer when viewed anonymously", () => {
    const maskedView = getMaskedCandidateView(candidate, [], "recruiter-anonymous-123");

    expect(maskedView.isUnlocked).toBe(false);
    expect(maskedView.maskedHeadline).toBe(candidate.maskedHeadline);
    expect(maskedView.displayCompany).toBe("Confidential / Stealth Employer");
    expect(maskedView.revealedInfo).toBeUndefined();
    expect(maskedView.atsScore).toBe(98);
    expect(maskedView.salaryRange).toBe("$240k - $310k");
  });

  it("unmasks candidate identity once an introduction request is approved", () => {
    const recruiterId = "recruiter-venture-capital";
    const introReq = createIntroRequest(candidate.id, {
      id: recruiterId,
      name: "Sarah Jenkins",
      company: "Apex Autonomous Systems",
      email: "sarah@apex.tech",
      jobRole: "Staff Distributed Systems Engineer",
      salaryOffered: "$285k base + equity",
      customPitch: "We are scaling high-throughput consensus protocols for autonomous swarms."
    });

    expect(introReq.status).toBe("pending_review");

    // Before approval -> still masked
    const viewBefore = getMaskedCandidateView(candidate, [introReq], recruiterId);
    expect(viewBefore.isUnlocked).toBe(false);

    // Candidate approves intro
    const approvedReq = respondToIntroRequest(introReq, "approved");
    expect(approvedReq.status).toBe("approved");

    // After approval -> unmasked
    const viewAfter = getMaskedCandidateView(candidate, [approvedReq], recruiterId);
    expect(viewAfter.isUnlocked).toBe(true);
    expect(viewAfter.revealedInfo?.realName).toBe("Elena Rostova");
    expect(viewAfter.revealedInfo?.email).toBe("elena.rostova@engineer.dev");
    expect(viewAfter.revealedInfo?.currentCompany).toBe("Stripe");
  });

  it("candidate owner always sees their own profile unmasked", () => {
    const ownerView = getMaskedCandidateView(candidate, [], candidate.userId);
    expect(ownerView.isUnlocked).toBe(true);
    expect(ownerView.revealedInfo?.realName).toBe(candidate.realName);
  });
});
