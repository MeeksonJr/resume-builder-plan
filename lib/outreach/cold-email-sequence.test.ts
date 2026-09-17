import { describe, it, expect } from "vitest";
import {
  generateOutreachSequence,
  formatLinkedInOutreachNote,
  SequenceInput
} from "./cold-email-sequence";

describe("Phase 61: Automated Cold Email & Executive Referral Sequence Builder", () => {
  const baseInput: SequenceInput = {
    candidateName: "Mohamed Lamine Datt",
    candidateTitle: "Staff Software Engineer",
    targetCompany: "Stripe",
    targetRole: "Staff Systems Engineer",
    recipientName: "Patrick Collison",
    persona: "hiring_manager",
    topAchievement: "scaling edge database transactions to 50k QPS",
    portfolioUrl: "https://resumeforge.pro/p/d.mohamed1504",
  };

  it("generates a high-converting 3-touch sequence with appropriate delay timing", () => {
    const campaign = generateOutreachSequence(baseInput);

    expect(campaign.steps.length).toBe(3);
    expect(campaign.steps[0].delayDays).toBe(0);
    expect(campaign.steps[1].delayDays).toBe(3);
    expect(campaign.steps[2].delayDays).toBe(7);

    expect(campaign.steps[0].body).toContain("Patrick Collison");
    expect(campaign.steps[0].body).toContain("scaling edge database transactions to 50k QPS");
    expect(campaign.steps[0].body).toContain("https://resumeforge.pro/p/d.mohamed1504");
  });

  it("adjusts tone and copy when targeting alumni peers", () => {
    const alumniInput: SequenceInput = {
      ...baseInput,
      persona: "alumni_peer",
      recipientName: "Alex Rivera",
      mutualConnection: "Stanford Alumni Network",
    };

    const campaign = generateOutreachSequence(alumniInput);
    expect(campaign.steps[0].subject).toContain("alumni");
    expect(campaign.steps[0].body).toContain("Stanford Alumni Network");
    expect(campaign.steps[0].body).toContain("virtual coffee");
  });

  it("formats compliant LinkedIn connection notes under 300 characters", () => {
    const note = formatLinkedInOutreachNote(
      baseInput.candidateName,
      baseInput.targetCompany,
      baseInput.targetRole,
      baseInput.portfolioUrl
    );

    expect(note.length).toBeLessThanOrEqual(300);
    expect(note).toContain("Stripe");
    expect(note).toContain("Staff Systems Engineer");
  });
});
