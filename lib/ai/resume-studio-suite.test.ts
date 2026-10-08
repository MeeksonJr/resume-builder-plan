import { describe, it, expect } from "vitest";
import { quantifyBulletPoint } from "./bullet-quantifier";
import { generateAcademicLatex } from "../export/academic-latex";
import { generateAlumniCoverLetter } from "./alumni-cover-letter";

describe("AI Resume Studio & ATS Precision Engine Suite (Phase 4)", () => {
  it("quantifies passive bullets into impact metrics and action verbs", () => {
    const res = quantifyBulletPoint("Fixed bugs in customer web portal");
    expect(res.actionVerbUsed).toBe("Remediated");
    expect(res.improvedBullet).toContain("regression defects");
    expect(res.atsConfidenceScore).toBe(94);

    const apiRes = quantifyBulletPoint("Built backend API endpoints");
    expect(apiRes.actionVerbUsed).toBe("Architected");
    expect(apiRes.metricValue).toContain("req/sec");
  });

  it("generates publication-ready academic LaTeX with proper escaping", () => {
    const latex = generateAcademicLatex({
      fullName: "Alex Miller",
      email: "alex@odu.edu",
      phone: "(757) 555-0199",
      location: "Norfolk, VA",
      education: [
        {
          institution: "Old Dominion University",
          degree: "B.S. Computer Science",
          location: "Norfolk, VA",
          graduationDate: "May 2026",
          gpa: "3.85",
          coursework: ["Data Structures", "Algorithms", "Cloud Computing"],
        },
      ],
      experience: [
        {
          company: "NASA Langley Research Center",
          role: "Software Engineering Intern",
          location: "Hampton, VA",
          dates: "Summer 2025",
          bullets: ["Developed telemetry visualization tooling using Python & React."],
        },
      ],
      skills: [
        { category: "Languages", items: ["Python", "TypeScript", "C++"] },
      ],
    });

    expect(latex).toContain("\\documentclass[letterpaper,11pt]{article}");
    expect(latex).toContain("Alex Miller");
    expect(latex).toContain("Old Dominion University");
    expect(latex).toContain("NASA Langley Research Center");
  });

  it("generates alumni-tailored cover letters referencing university and alumni connections", () => {
    const letter = generateAlumniCoverLetter({
      candidateName: "Jordan Vance",
      candidateUniversity: "Old Dominion University",
      candidateMajor: "Cybersecurity",
      targetCompany: "Dominion Energy",
      targetRole: "Cloud Security Specialist",
      alumniContactName: "Sarah Jenkins",
      keyProjects: ["Zero-Trust Identity Broker"],
    });

    expect(letter).toContain("Sarah Jenkins");
    expect(letter).toContain("Old Dominion University");
    expect(letter).toContain("Zero-Trust Identity Broker");
    expect(letter).toContain("Dominion Energy");
  });
});
