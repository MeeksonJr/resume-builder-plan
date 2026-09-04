import { describe, it, expect } from "vitest";
import { computeCareerMilestones } from "./gamification";

describe("computeCareerMilestones", () => {
  it("computes 0% completion for fresh user", () => {
    const result = computeCareerMilestones({
      resumeCount: 0,
      savedAtsCount: 0,
      applicationsCount: 0,
      interviewsCount: 0,
      salaryInsightsCount: 0,
      hasPortfolio: false,
    });

    expect(result.unlockedCount).toBe(0);
    expect(result.completionPercentage).toBe(0);
    expect(result.levelTitle).toBe("Novice Explorer");
    expect(result.isAllCompleted).toBe(false);
  });

  it("unlocks Document Architect when resume is created", () => {
    const result = computeCareerMilestones({
      resumeCount: 1,
      savedAtsCount: 0,
      applicationsCount: 0,
      interviewsCount: 0,
      salaryInsightsCount: 0,
      hasPortfolio: false,
    });

    const docBadge = result.badges.find((b) => b.id === "document_architect");
    expect(docBadge?.isUnlocked).toBe(true);
    expect(result.unlockedCount).toBe(1);
    expect(result.levelTitle).toBe("Emerging Candidate");
  });

  it("unlocks Pipeline Commander only when 3 or more applications are tracked", () => {
    const twoApps = computeCareerMilestones({
      resumeCount: 1,
      savedAtsCount: 0,
      applicationsCount: 2,
      interviewsCount: 0,
      salaryInsightsCount: 0,
      hasPortfolio: false,
    });
    expect(twoApps.badges.find((b) => b.id === "pipeline_commander")?.isUnlocked).toBe(false);

    const threeApps = computeCareerMilestones({
      resumeCount: 1,
      savedAtsCount: 0,
      applicationsCount: 3,
      interviewsCount: 0,
      salaryInsightsCount: 0,
      hasPortfolio: false,
    });
    expect(threeApps.badges.find((b) => b.id === "pipeline_commander")?.isUnlocked).toBe(true);
  });

  it("unlocks all 6 badges and marks 100% completion", () => {
    const result = computeCareerMilestones({
      resumeCount: 2,
      atsScore: 85,
      savedAtsCount: 1,
      applicationsCount: 5,
      interviewsCount: 2,
      salaryInsightsCount: 3,
      hasPortfolio: true,
    });

    expect(result.unlockedCount).toBe(6);
    expect(result.completionPercentage).toBe(100);
    expect(result.levelTitle).toContain("Career Master");
    expect(result.isAllCompleted).toBe(true);
  });
});
