import { describe, it, expect } from "vitest";
import { calculateResumeStrength } from "./resume-strength";

describe("calculateResumeStrength", () => {
  it("returns low score and needs_work tier for empty resume", () => {
    const report = calculateResumeStrength({});
    expect(report.overallScore).toBe(0);
    expect(report.tier).toBe("needs_work");
    expect(report.missingCount).toBeGreaterThan(10);
    expect(report.completedCount).toBe(0);
  });

  it("calculates partial score when contact and summary are present", () => {
    const report = calculateResumeStrength({
      profile: {
        full_name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+1 555-123-4567",
        location: "New York, NY",
        linkedin_url: "https://linkedin.com/in/janedoe",
        summary: "Accomplished software engineer with extensive experience architecting scalable distributed systems and leading cross-functional engineering teams.",
      },
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(30);
    expect(report.categoryScores.contact.score).toBe(20);
    expect(report.categoryScores.summary.score).toBe(15);
  });

  it("reaches exceptional tier for comprehensive resume with metrics and action verbs", () => {
    const report = calculateResumeStrength({
      profile: {
        full_name: "Alex Smith",
        email: "alex@techcorp.io",
        phone: "+1 (555) 987-6543",
        location: "San Francisco, CA",
        linkedin_url: "https://linkedin.com/in/alexsmith",
        github_url: "https://github.com/alexsmith",
        summary: "Proven Senior Full Stack Engineer with 8+ years experience building cloud-native SaaS applications. Expert in React, Node, and AWS with a track record of driving revenue growth.",
      },
      workExperiences: [
        {
          company: "CloudScale Inc.",
          position: "Lead Software Engineer",
          description: "Spearheaded migration to microservices architecture, reducing cloud hosting costs by 35% ($120k annually). Automated CI/CD deployment pipelines, boosting developer velocity by 4x across 15 engineering teams.",
          highlights: ["Increased system availability to 99.99% for 500k active users", "Mentored 8 junior developers"],
        },
        {
          company: "DataForge Systems",
          position: "Full Stack Developer",
          description: "Engineered scalable analytics dashboard serving 100k daily queries. Optimized SQL query performance by 60%, delivering real-time metric reporting.",
          highlights: ["Built custom caching layer reducing database CPU load by 45%"],
        },
      ],
      education: [
        {
          institution: "University of Washington",
          degree: "B.S. in Computer Science",
          field_of_study: "Software Engineering",
        },
      ],
      skills: [
        { name: "TypeScript" },
        { name: "React" },
        { name: "Node.js" },
        { name: "Next.js" },
        { name: "PostgreSQL" },
        { name: "AWS" },
        { name: "Docker" },
        { name: "GraphQL" },
      ],
      projects: [
        {
          name: "Open Source Monitoring Suite",
          description: "Real-time metrics aggregator built with Go and React.",
        },
      ],
      certifications: [
        {
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
        },
      ],
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(90);
    expect(report.tier).toBe("exceptional");
    expect(report.missingCount).toBe(0);
    expect(report.completedCount).toBe(report.checklist.length);
  });
});
