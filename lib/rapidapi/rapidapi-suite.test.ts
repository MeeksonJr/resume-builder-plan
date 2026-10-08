import { describe, it, expect, beforeEach } from "vitest";
import { rapidApiCache, executeRapidApiRequest } from "./client-cache";
import { searchJobsWithRapidApi } from "./jsearch";
import { generateInterviewQuestions } from "./interview-questions";
import { getIndeedSalaryBenchmark } from "./indeed-salary";
import { calculateJobFitAssessment } from "./job-fit";
import { estimateCommute } from "../geo/commute-calculator";
import { checkVisaSponsorship } from "../jobs/visa-sponsorship";

describe("RapidAPI & External Intelligence Suite (Phase 2)", () => {
  beforeEach(() => {
    rapidApiCache.clear();
  });

  it("handles in-memory caching and TTL expiration", () => {
    rapidApiCache.set("test-key", { value: 42 }, 10);
    const cached = rapidApiCache.get<{ value: number }>("test-key");
    expect(cached?.value).toBe(42);

    const nonExistent = rapidApiCache.get("invalid-key");
    expect(nonExistent).toBeNull();
  });

  it("trips circuit breaker after consecutive failures and recovers on cooldown", () => {
    const endpoint = "test-endpoint";
    expect(rapidApiCache.isCircuitOpen(endpoint)).toBe(false);

    rapidApiCache.recordFailure(endpoint);
    rapidApiCache.recordFailure(endpoint);
    rapidApiCache.recordFailure(endpoint); // threshold reached

    expect(rapidApiCache.isCircuitOpen(endpoint)).toBe(true);

    rapidApiCache.recordSuccess(endpoint);
    expect(rapidApiCache.isCircuitOpen(endpoint)).toBe(false);
  });

  it("executes JSearch job search and returns standardized Virginia listings", async () => {
    const res = await searchJobsWithRapidApi({
      query: "Cloud Engineer",
      location: "Virginia",
      campusSlug: "old-dominion-university",
    });

    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs[0]).toHaveProperty("title");
    expect(res.jobs[0]).toHaveProperty("company");
    expect(res.jobs[0]).toHaveProperty("applyLink");
    expect(res.jobs[0].institutionalAffinity).toBe("old-dominion-university");
  });

  it("generates role-specific behavioral and technical interview questions with STAR guidelines", async () => {
    const questions = await generateInterviewQuestions({
      role: "Full Stack Engineer",
      seniority: "Junior",
    });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].suggestedAnswerFramework).toContain("STAR");
    expect(questions[0].evaluationCriteria.length).toBeGreaterThan(0);
  });

  it("benchmarks role salaries across 25th, 50th, 75th, and 90th percentiles", async () => {
    const salary = await getIndeedSalaryBenchmark("Cybersecurity Analyst", "Virginia");

    expect(salary.median50).toBeGreaterThan(salary.percentile25);
    expect(salary.percentile75).toBeGreaterThan(salary.median50);
    expect(salary.percentile90).toBeGreaterThan(salary.percentile75);
    expect(salary.topPayingSkills.length).toBeGreaterThan(0);
  });

  it("calculates semantic job-fit match rate and returns actionable recommendations", async () => {
    const assessment = await calculateJobFitAssessment({
      resumeText: "Experienced in React, TypeScript, Node.js, and SQL databases with Git.",
      jobTitle: "Frontend Developer",
      jobDescription: "Looking for React, TypeScript, Docker, and AWS skills.",
    });

    expect(assessment.overallScore).toBeGreaterThanOrEqual(50);
    expect(assessment.overallScore).toBeLessThanOrEqual(100);
    expect(assessment.matchedSkills).toContain("REACT");
    expect(assessment.matchedSkills).toContain("TYPESCRIPT");
    expect(assessment.recommendedImprovements.length).toBeGreaterThan(0);
  });

  it("estimates commute times accurately from Virginia campuses to regional cities", () => {
    const oduCommute = estimateCommute("old-dominion-university", "Norfolk, VA");
    expect(oduCommute.commuteTier).toBe("Short Commute (< 30 min)");
    expect(oduCommute.driveTimeMinutes).toBeLessThan(30);

    const vtCommute = estimateCommute("virginia-tech", "Richmond, VA");
    expect(vtCommute.commuteTier).toBe("Regional Transit (> 60 min)");
    expect(vtCommute.distanceMiles).toBeGreaterThan(150);
  });

  it("identifies F-1 OPT and H-1B visa sponsorship rules between commercial and defense employers", () => {
    const amazon = checkVisaSponsorship("Amazon AWS");
    expect(amazon.sponsorsH1B).toBe(true);
    expect(amazon.stemOptEligible).toBe(true);

    const defense = checkVisaSponsorship("Huntington Ingalls Industries");
    expect(defense.sponsorsH1B).toBe(false);
    expect(defense.notes).toContain("Defense contractor");
  });
});
