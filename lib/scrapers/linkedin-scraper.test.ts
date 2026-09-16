import { describe, it, expect } from "vitest";
import {
  validateLinkedInUrl,
  scrapeLinkedInProfile,
  scrapedToResumeData,
  DEMO_LINKEDIN_PROFILES,
} from "./linkedin-scraper";

describe("LinkedIn Scraper & Ingestion Engine (Phase 41)", () => {
  describe("validateLinkedInUrl", () => {
    it("validates full HTTPS LinkedIn profile URLs", () => {
      const result = validateLinkedInUrl("https://www.linkedin.com/in/alex-morgan-tech/");
      expect(result.isValid).toBe(true);
      expect(result.username).toBe("alex-morgan-tech");
      expect(result.cleanUrl).toBe("https://www.linkedin.com/in/alex-morgan-tech");
    });

    it("validates URLs without protocol or www", () => {
      const result = validateLinkedInUrl("linkedin.com/in/sarah-chen-dev");
      expect(result.isValid).toBe(true);
      expect(result.username).toBe("sarah-chen-dev");
      expect(result.cleanUrl).toBe("https://www.linkedin.com/in/sarah-chen-dev");
    });

    it("accepts bare handle slugs without dots", () => {
      const result = validateLinkedInUrl("jordan-taylor-product");
      expect(result.isValid).toBe(true);
      expect(result.username).toBe("jordan-taylor-product");
      expect(result.cleanUrl).toBe("https://www.linkedin.com/in/jordan-taylor-product");
    });

    it("strips trailing query parameters and tracking fragments", () => {
      const result = validateLinkedInUrl("https://linkedin.com/in/alex-morgan-tech?utm_source=share&trk=profile");
      expect(result.isValid).toBe(true);
      expect(result.username).toBe("alex-morgan-tech");
      expect(result.cleanUrl).toBe("https://www.linkedin.com/in/alex-morgan-tech");
    });

    it("rejects invalid URLs and non-profile links", () => {
      expect(validateLinkedInUrl("https://google.com").isValid).toBe(false);
      expect(validateLinkedInUrl("https://linkedin.com/company/google").isValid).toBe(false);
      expect(validateLinkedInUrl("").isValid).toBe(false);
    });
  });

  describe("scrapeLinkedInProfile with demo profiles", () => {
    it("retrieves Alex Morgan tech demo profile with high fidelity", async () => {
      const profile = await scrapeLinkedInProfile("https://www.linkedin.com/in/alex-morgan-tech");
      expect(profile.fullName).toBe("Alex Morgan");
      expect(profile.headline).toContain("Full Stack Engineer");
      expect(profile.confidenceScore).toBe(98);
      expect(profile.source).toBe("demo_profile");
      expect(profile.experience.length).toBeGreaterThanOrEqual(3);
      expect(profile.skills).toContain("TypeScript");
      expect(profile.skills).toContain("Next.js");
      expect(profile.education[0].institution).toContain("Berkeley");
    });

    it("retrieves Sarah Chen AI demo profile", async () => {
      const profile = await scrapeLinkedInProfile("sarah-chen-dev");
      expect(profile.fullName).toBe("Sarah Chen");
      expect(profile.headline).toContain("AI Engineer");
      expect(profile.skills).toContain("Python");
      expect(profile.skills).toContain("PyTorch");
    });

    it("falls back gracefully to heuristic synthesizer for arbitrary custom handles", async () => {
      const profile = await scrapeLinkedInProfile("https://www.linkedin.com/in/david-miller-engineer");
      expect(profile.fullName).toContain("David Miller");
      expect(profile.confidenceScore).toBeGreaterThanOrEqual(70);
      expect(profile.experience.length).toBeGreaterThanOrEqual(1);
      expect(profile.skills.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("scrapedToResumeData", () => {
    it("accurately converts ScrapedLinkedInProfile into ResumeData schema", () => {
      const demoProfile = DEMO_LINKEDIN_PROFILES["alex-morgan-tech"];
      const resumeData = scrapedToResumeData(demoProfile);

      expect(resumeData.personalInfo.fullName).toBe("Alex Morgan");
      expect(resumeData.personalInfo.linkedin).toBe("https://www.linkedin.com/in/alex-morgan-tech");
      expect(resumeData.workExperience.length).toBe(demoProfile.experience.length);
      expect(resumeData.workExperience[0].company).toBe("Apex Cloud Systems");
      expect(resumeData.education[0].institution).toContain("Berkeley");
      expect(resumeData.skills[0].items).toEqual(expect.arrayContaining(["TypeScript", "React"]));
      expect(resumeData.certifications?.length).toBe(2);
      expect(resumeData.languages?.length).toBe(2);
    });
  });
});
