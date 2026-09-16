import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withFallback, resumeDataSchema } from "./index";

describe("AI Fallback Engine & Schema Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should throw NO_API_KEYS when no AI provider keys exist in environment", async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(withFallback(async () => "success")).rejects.toThrow("NO_API_KEYS");
  });

  it("should successfully return result on primary provider success", async () => {
    process.env.GEMINI_API_KEY = "mock-gemini-key";

    const operation = vi.fn().mockResolvedValue("Primary Output");
    const result = await withFallback(operation);

    expect(result).toBe("Primary Output");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should seamlessly fall back to secondary model if primary fails", async () => {
    process.env.GEMINI_API_KEY = "mock-gemini-key";
    process.env.GROQ_API_KEY = "mock-groq-key";

    let attempts = 0;
    const operation = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error("Gemini rate limited (429)");
      }
      return "Groq Fallback Output";
    });

    const result = await withFallback(operation);
    expect(result).toBe("Groq Fallback Output");
    expect(attempts).toBe(2);
  });

  it("should throw the last error when all providers fail", async () => {
    process.env.GEMINI_API_KEY = "mock-key";

    const operation = vi.fn().mockRejectedValue(new Error("Provider down"));

    await expect(withFallback(operation)).rejects.toThrow("Provider down");
  });

  it("should successfully parse and validate valid resume data using resumeDataSchema", () => {
    const validResume = {
      personalInfo: {
        fullName: "Jordan Lee",
        email: "jordan@example.com",
        phone: "+1-555-0199",
        location: "Seattle, WA",
        summary: "Staff Site Reliability Engineer",
      },
      workExperience: [
        {
          company: "CloudTech Inc.",
          position: "Principal SRE",
          startDate: "2020-01",
          endDate: "Present",
          current: true,
          description: "Maintained 99.999% uptime across multi-region Kubernetes clusters.",
          highlights: ["Automated failover workflows"],
        },
      ],
      education: [
        {
          institution: "University of Washington",
          degree: "B.S. in Computer Engineering",
          startDate: "2015",
          endDate: "2019",
        },
      ],
      skills: [
        {
          category: "DevOps & Infrastructure",
          items: ["Kubernetes", "Terraform", "Prometheus", "Golang"],
        },
      ],
      projects: [
        {
          name: "OmniCluster",
          technologies: ["Go", "Kubernetes"],
        },
      ],
      certifications: [
        {
          name: "CKA: Certified Kubernetes Administrator",
        },
      ],
      languages: [
        {
          language: "English",
          proficiency: "Native",
        },
      ],
    };

    const parsed = resumeDataSchema.safeParse(validResume);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.personalInfo.fullName).toBe("Jordan Lee");
      expect(parsed.data.workExperience[0].company).toBe("CloudTech Inc.");
      expect(parsed.data.skills[0].items).toContain("Kubernetes");
      expect(parsed.data.projects[0].name).toBe("OmniCluster");
    }
  });

  it("should gracefully allow sparse resume data with empty arrays in resumeDataSchema", () => {
    const minimalResume = {
      personalInfo: {
        fullName: "Taylor Smith",
      },
      workExperience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    };

    const parsed = resumeDataSchema.safeParse(minimalResume);
    expect(parsed.success).toBe(true);
  });
});
