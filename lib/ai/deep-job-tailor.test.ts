import { describe, it, expect } from "vitest";
import { 
  generateDeterministicTailoredPackage,
  HarvestedCareerContext,
  JobTargetInput
} from "./deep-job-tailor";

describe("Deep Job Tailoring Engine", () => {
  const mockContext: HarvestedCareerContext = {
    profile: {
      full_name: "Alex Rivera",
      email: "alex@example.com",
      phone: "+1 555-0192",
      location: "San Francisco, CA",
      bio: "Passionate engineer with experience building web apps and scalable microservices.",
      summary: "Full Stack Engineer & Distributed Systems Enthusiast",
      website: "https://alexrivera.dev",
      github: "https://github.com/alexrivera",
      linkedin: "https://linkedin.com/in/alexrivera"
    },
    canvasCourses: [
      {
        id: "c1",
        name: "Distributed Systems & Cloud Computing",
        course_code: "CS455",
        current_grade: "A"
      },
      {
        id: "c2",
        name: "Full Stack Web Architectures",
        course_code: "CS390",
        current_grade: "A+"
      }
    ],
    workExperiences: [
      {
        company: "Vanguard Tech",
        position: "Software Engineer Intern",
        start_date: "2024-05",
        end_date: "2024-08",
        description: "Built high-throughput data processing microservices.",
        highlights: [
          "Engineered low-latency data pipelines processing 1M+ events/day.",
          "Optimized PostgreSQL queries reducing average response time by 40%."
        ]
      }
    ],
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker"],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "B.S. in Computer Science",
        field_of_study: "Computer Science",
        start_date: "2022-09",
        end_date: "2026-05",
        achievements: ["Dean's Honor List 2023-2025"]
      }
    ],
    projects: [
      {
        name: "Realtime Collaboration Whiteboard",
        description: "Engineered a low-latency collaborative whiteboard using WebSockets and CRDTs.",
        url: "https://github.com/alexrivera/whiteboard",
        technologies: ["React", "TypeScript", "WebSockets"]
      }
    ],
    portfolioTagline: "Building scalable distributed web applications.",
    portfolioBio: "Software developer passionate about cloud engineering and seamless UI."
  };

  const jobTarget: JobTargetInput = {
    role: "Senior Fullstack Developer",
    company: "Stripe",
    description: "Looking for a Senior Fullstack Developer proficient in TypeScript, distributed systems, and modern web architectures."
  };

  it("should generate a complete tailored package with zero missing sections", () => {
    const pkg = generateDeterministicTailoredPackage(jobTarget, mockContext);

    // Verify Resume Completeness
    expect(pkg.resume).toBeDefined();
    expect(pkg.resume.title).toContain("Senior Fullstack Developer");
    expect(pkg.resume.title).toContain("Stripe");

    // Personal info
    expect(pkg.resume.personal_info.full_name).toBe("Alex Rivera");
    expect(pkg.resume.personal_info.email).toBe("alex@example.com");
    expect(pkg.resume.personal_info.summary).toContain("Stripe");
    expect(pkg.resume.personal_info.summary).toContain("Senior Fullstack Developer");

    // Work Experiences
    expect(pkg.resume.work_experiences.length).toBeGreaterThan(0);
    expect(pkg.resume.work_experiences[0].highlights.length).toBeGreaterThanOrEqual(2);
    expect(pkg.resume.work_experiences[0].highlights[0]).toContain("Stripe");

    // Education with Canvas Courses
    expect(pkg.resume.education.length).toBeGreaterThan(0);
    expect(pkg.resume.education[0].achievements).toBeDefined();
    expect(pkg.resume.education[0].achievements.some(a => a.includes("CS455") || a.includes("Distributed Systems"))).toBe(true);

    // Skills
    expect(pkg.resume.skills.length).toBeGreaterThanOrEqual(2);
    expect(pkg.resume.skills.some(c => c.skills.includes("TypeScript"))).toBe(true);

    // Projects
    expect(pkg.resume.projects.length).toBeGreaterThan(0);
    expect(pkg.resume.projects[0].name).toBe("Realtime Collaboration Whiteboard");
  });

  it("should generate ATS-optimized cover letter targeted to the company and role", () => {
    const pkg = generateDeterministicTailoredPackage(
      {
        role: "Frontend Engineer",
        company: "Airbnb",
        description: "Join our guest experience team."
      },
      mockContext
    );

    expect(pkg.coverLetter.company_name).toBe("Airbnb");
    expect(pkg.coverLetter.job_title).toBe("Frontend Engineer");
    expect(pkg.coverLetter.content).toContain("Airbnb");
    expect(pkg.coverLetter.content).toContain("Frontend Engineer");
    expect(pkg.coverLetter.content).toContain("Alex Rivera");
    expect(pkg.coverLetter.content).toContain("CS455");
  });

  it("should generate tailored dedicated portfolio microsite data with Canvas proof", () => {
    const pkg = generateDeterministicTailoredPackage(
      {
        role: "Cloud Architect",
        company: "Datadog",
        description: "Scale distributed monitoring telemetry."
      },
      mockContext
    );

    expect(pkg.dedicatedPortfolio.headline).toContain("Datadog");
    expect(pkg.dedicatedPortfolio.greeting).toContain("Datadog");
    expect(pkg.dedicatedPortfolio.custom_pitch).toContain("Datadog");
    expect(pkg.dedicatedPortfolio.key_match_reasons.length).toBeGreaterThanOrEqual(2);
    expect(pkg.dedicatedPortfolio.featured_course_highlights.length).toBe(2);
    expect(pkg.dedicatedPortfolio.featured_course_highlights[0]).toContain("CS455");
  });
});
