import { describe, it, expect } from "vitest";
import {
  detectJobPortal,
  generateDispatchSteps,
  generateAutofillBookmarklet,
  executeApplicationDispatch,
  CandidateProfile,
} from "./auto-apply-dispatcher";

describe("Automated Job Application Dispatcher (Phase 54)", () => {
  const mockCandidate: CandidateProfile = {
    fullName: "Jordan Lee",
    email: "jordan@example.com",
    phone: "+1 (555) 234-5678",
    location: "Seattle, WA",
    linkedinUrl: "https://linkedin.com/in/jordanlee",
    portfolioUrl: "https://jordanlee.dev",
    yearsOfExperience: 6,
    workAuthorization: "us_citizen",
  };

  it("detects major ATS and job board platforms from URLs", () => {
    expect(detectJobPortal("https://www.linkedin.com/jobs/view/3920192831")).toBe("linkedin");
    expect(detectJobPortal("https://www.indeed.com/viewjob?jk=abc12345")).toBe("indeed");
    expect(detectJobPortal("https://boards.greenhouse.io/stripe/jobs/482910")).toBe("greenhouse");
    expect(detectJobPortal("https://jobs.lever.co/figma/789012")).toBe("lever");
    expect(detectJobPortal("https://company.myworkdayjobs.com/careers")).toBe("workday");
    expect(detectJobPortal("https://randomstartup.io/careers")).toBe("generic");
    expect(detectJobPortal(undefined)).toBe("generic");
  });

  it("generates structured 5-step dispatch pipeline", () => {
    const steps = generateDispatchSteps("linkedin", mockCandidate, "Staff Architect Resume");
    expect(steps).toHaveLength(5);
    expect(steps[0].name).toContain("Identity");
    expect(steps[1].name).toContain("Resume");
    expect(steps[4].name).toContain("Verification");
  });

  it("generates a valid javascript bookmarklet snippet", () => {
    const bookmarklet = generateAutofillBookmarklet(mockCandidate);
    expect(bookmarklet.startsWith("javascript:")).toBe(true);
    expect(decodeURIComponent(bookmarklet)).toContain("Jordan Lee");
    expect(decodeURIComponent(bookmarklet)).toContain("jordan@example.com");
  });

  it("executes multi-step application dispatch simulation with verification token", async () => {
    const progressUpdates: string[] = [];
    const result = await executeApplicationDispatch(
      "app-123",
      "greenhouse",
      mockCandidate,
      (step) => progressUpdates.push(step.name)
    );

    expect(result.success).toBe(true);
    expect(result.portal).toBe("greenhouse");
    expect(result.stepsCompleted).toBe(5);
    expect(result.verificationId).toMatch(/^DISPATCH-GREENHOUSE-/);
    expect(progressUpdates.length).toBeGreaterThanOrEqual(5);
  });
});
