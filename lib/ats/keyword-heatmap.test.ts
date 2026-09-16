import { describe, it, expect } from "vitest";
import {
  tokenizeText,
  extractResumeText,
  analyzeKeywordDensity,
} from "./keyword-heatmap";

describe("Phase 48: ATS Keyword Density & Match Heatmap Engine", () => {
  it("tokenizes and cleans strings properly", () => {
    const tokens = tokenizeText("Senior Full-Stack Engineer: React, TypeScript & Next.js!");
    expect(tokens).toContain("senior");
    expect(tokens).toContain("full-stack");
    expect(tokens).toContain("react");
    expect(tokens).toContain("typescript");
    expect(tokens).toContain("next");
  });

  it("extracts comprehensive text from structured resume data", () => {
    const mockResume = {
      profile: {
        full_name: "Taylor Vance",
        title: "Staff Cloud Architect",
        summary: "Expert in Kubernetes and distributed AWS systems.",
      },
      workExperiences: [
        {
          company: "CloudScale Inc",
          role: "Principal DevOps Engineer",
          description: "Engineered high-throughput Terraform CI/CD pipelines.",
          highlights: ["Scaled Docker clusters to 10k nodes."],
        },
      ],
      skills: ["Docker", "Kubernetes", "AWS", "Python"],
      education: [
        {
          institution: "MIT",
          degree: "B.S. Computer Science",
        },
      ],
      projects: [
        {
          name: "Microservice Gateway",
          description: "FastAPI and Golang backend.",
        },
      ],
    };

    const text = extractResumeText(mockResume);
    expect(text).toContain("Taylor Vance");
    expect(text).toContain("Staff Cloud Architect");
    expect(text).toContain("Kubernetes");
    expect(text).toContain("Terraform");
    expect(text).toContain("Docker");
    expect(text).toContain("FastAPI");
  });

  it("calculates keyword match score and density against a job description", () => {
    const resumeText = "Experienced engineer skilled in React, TypeScript, and Node.js. Built scalable web applications with Tailwind.";
    const jobDescription = `
      We are looking for a Senior Frontend Engineer proficient in React, TypeScript, and Tailwind.
      Knowledge of Docker, Kubernetes, and AWS is a huge plus.
    `;

    const report = analyzeKeywordDensity(resumeText, jobDescription);

    expect(report.totalWordCount).toBeGreaterThan(0);
    expect(report.matchScore).toBeGreaterThan(0);
    expect(report.matchScore).toBeLessThanOrEqual(100);

    // Matched terms
    const matchedTerms = report.keywords.filter((k) => k.status === "matched").map((k) => k.term);
    expect(matchedTerms).toContain("react");
    expect(matchedTerms).toContain("typescript");
    expect(matchedTerms).toContain("tailwind");

    // Missing terms
    const missingTerms = report.keywords.filter((k) => k.status === "missing").map((k) => k.term);
    expect(missingTerms).toContain("kubernetes");
    expect(missingTerms).toContain("aws");
    expect(missingTerms).toContain("docker");
  });

  it("flags keyword stuffing when density exceeds safe thresholds", () => {
    // Deliberately repeat "react" many times
    const stuffedResume = `
      React React React React React React React React React React
      React React React React React React React React React React
      Software developer who builds websites with React.
    `;

    const report = analyzeKeywordDensity(stuffedResume);
    const reactMatch = report.keywords.find((k) => k.term === "react");

    expect(reactMatch).toBeDefined();
    expect(reactMatch?.status).toBe("overused");
    expect(reactMatch?.densityPercent).toBeGreaterThan(4.0);
    expect(report.stuffingRisk).toBe(true);
  });
});
