import { describe, it, expect } from "vitest";
import { generateResumePlainText, stripHtmlForATS } from "./txt-export";
import { generateJSONResume } from "./json-export";

describe("Multi-Format Export Engine", () => {
  const sampleData = {
    profile: {
      full_name: "Alex Morgan",
      email: "alex@example.com",
      phone: "+1 555 987 6543",
      location: "New York, NY",
      linkedin_url: "https://linkedin.com/in/alexmorgan",
      github_url: "https://github.com/alexmorgan",
      website_url: "https://alexmorgan.dev",
      summary: "<p>Senior Software Engineer specializing in <strong>distributed systems</strong> and microservices.</p>",
      target_role: "Lead Full Stack Engineer",
    },
    workExperiences: [
      {
        company: "Stripe",
        position: "Senior Backend Engineer",
        start_date: "2022-03",
        end_date: "Present",
        is_current: true,
        location: "Remote",
        description: "<p>Architected payment reconciliation service reducing error rates by 42%.</p>",
        highlights: ["Scaled infrastructure to handle 50k requests/sec."],
      },
    ],
    education: [
      {
        institution: "Cornell University",
        degree: "B.S.",
        field_of_study: "Computer Science",
        start_date: "2018",
        end_date: "2022",
        gpa: "3.92",
        achievements: ["Dean's Honor List", "Distributed Systems Teaching Assistant"],
      },
    ],
    skills: [
      { name: "Go", category: "Languages", proficiency_level: 5 },
      { name: "TypeScript", category: "Languages", proficiency_level: 5 },
      { name: "Kubernetes", category: "DevOps", proficiency_level: 4 },
    ],
    projects: [
      {
        name: "OmniCache",
        description: "In-memory distributed key-value store built in Go.",
        technologies: ["Go", "Raft", "Docker"],
        url: "https://github.com/alexmorgan/omnicache",
        highlights: ["Benchmarked latency under 2ms."],
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issue_date: "2023",
      },
    ],
    languages: [
      { language: "English", proficiency: "Native" },
      { language: "Spanish", proficiency: "Conversational" },
    ],
  };

  describe("Plain Text ATS Engine", () => {
    it("strips HTML tags and entities cleanly", () => {
      const dirty = "<p>Engineered &amp; deployed microservices with &gt; 99.9% uptime.</p>";
      const clean = stripHtmlForATS(dirty);
      expect(clean).toBe("Engineered & deployed microservices with > 99.9% uptime.");
      expect(clean).not.toContain("<p>");
    });

    it("generates structured plain text with standard ASCII dividers and bullet points", () => {
      const text = generateResumePlainText(sampleData);

      expect(text).toContain("ALEX MORGAN");
      expect(text).toContain("alex@example.com");
      expect(text).toContain("WORK EXPERIENCE");
      expect(text).toContain("SENIOR BACKEND ENGINEER | Stripe");
      expect(text).toContain("* Architected payment reconciliation service reducing error rates by 42%.");
      expect(text).toContain("CORNELL UNIVERSITY");
      expect(text).toContain("B.S. in Computer Science");
      expect(text).toContain("Languages: Go, TypeScript");
      expect(text).toContain("OMNICACHE");
      expect(text).toContain("AWS Certified Solutions Architect");
    });
  });

  describe("JSON Resume v1.0 Engine", () => {
    it("generates schema-compliant JSON Resume structure", () => {
      const jsonResume = generateJSONResume(sampleData);

      expect(jsonResume.$schema).toBe(
        "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json"
      );
      expect(jsonResume.basics.name).toBe("Alex Morgan");
      expect(jsonResume.basics.email).toBe("alex@example.com");
      expect(jsonResume.basics.summary).toBe(
        "Senior Software Engineer specializing in distributed systems and microservices."
      );
      expect(jsonResume.work).toHaveLength(1);
      expect(jsonResume.work[0].name).toBe("Stripe");
      expect(jsonResume.work[0].endDate).toBe("Present");
      expect(jsonResume.education[0].institution).toBe("Cornell University");
      expect(jsonResume.skills).toHaveLength(3);
      expect(jsonResume.projects[0].name).toBe("OmniCache");
      expect(jsonResume.certificates[0].name).toBe("AWS Certified Solutions Architect");
      expect(jsonResume.languages[0].language).toBe("English");
    });
  });
});
