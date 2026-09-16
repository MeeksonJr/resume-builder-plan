import { describe, it, expect } from "vitest";
import {
  getResumeLabel,
  isRtlLanguage,
  localizeDateRange,
  LANGUAGE_OPTIONS,
  RESUME_DICTIONARIES,
} from "./resume-translations";

describe("Resume Multi-Language & RTL Engine (Phase 46)", () => {
  describe("getResumeLabel", () => {
    it("returns standard English section headings by default", () => {
      expect(getResumeLabel("experience", "en")).toBe("Experience");
      expect(getResumeLabel("education", "en")).toBe("Education");
      expect(getResumeLabel("skills", "en")).toBe("Skills");
      expect(getResumeLabel("present", "en")).toBe("Present");
    });

    it("returns Spanish section headings accurately", () => {
      expect(getResumeLabel("experience", "es")).toBe("Experiencia Profesional");
      expect(getResumeLabel("education", "es")).toBe("Educación y Formación");
      expect(getResumeLabel("summary", "es")).toBe("Perfil Profesional");
      expect(getResumeLabel("present", "es")).toBe("Presente");
    });

    it("returns French section headings accurately", () => {
      expect(getResumeLabel("experience", "fr")).toBe("Expérience Professionnelle");
      expect(getResumeLabel("skills", "fr")).toBe("Compétences");
      expect(getResumeLabel("present", "fr")).toBe("Présent");
    });

    it("returns Arabic section headings for RTL locales", () => {
      expect(getResumeLabel("experience", "ar")).toBe("الخبرات المهنية");
      expect(getResumeLabel("education", "ar")).toBe("المؤهلات التعليمية");
      expect(getResumeLabel("present", "ar")).toBe("حتى الآن");
    });

    it("falls back to English when language is unsupported or null", () => {
      expect(getResumeLabel("experience", "xx" as any)).toBe("Experience");
      expect(getResumeLabel("experience", null)).toBe("Experience");
      expect(getResumeLabel("experience", undefined)).toBe("Experience");
    });
  });

  describe("isRtlLanguage", () => {
    it("correctly flags Arabic and Hebrew as RTL", () => {
      expect(isRtlLanguage("ar")).toBe(true);
      expect(isRtlLanguage("AR")).toBe(true);
      expect(isRtlLanguage("he")).toBe(true);
      expect(isRtlLanguage("HE")).toBe(true);
    });

    it("returns false for Left-to-Right languages", () => {
      expect(isRtlLanguage("en")).toBe(false);
      expect(isRtlLanguage("es")).toBe(false);
      expect(isRtlLanguage("fr")).toBe(false);
      expect(isRtlLanguage("de")).toBe(false);
      expect(isRtlLanguage("zh")).toBe(false);
      expect(isRtlLanguage(null)).toBe(false);
    });
  });

  describe("localizeDateRange", () => {
    it("localizes 'Present' in date strings for Spanish", () => {
      expect(localizeDateRange("Jan 2022 - Present", "es")).toBe("Jan 2022 - Presente");
      expect(localizeDateRange("2020 - present", "es")).toBe("2020 - Presente");
    });

    it("localizes 'Present' in date strings for French", () => {
      expect(localizeDateRange("2021 - Present", "fr")).toBe("2021 - Présent");
    });

    it("localizes 'Present' in date strings for Arabic", () => {
      expect(localizeDateRange("2022 - Present", "ar")).toBe("2022 - حتى الآن");
    });

    it("handles empty or null date gracefully", () => {
      expect(localizeDateRange(null, "es")).toBe("");
      expect(localizeDateRange(undefined, "fr")).toBe("");
    });
  });

  describe("Language catalog consistency", () => {
    it("provides valid language options metadata for all dictionaries", () => {
      expect(LANGUAGE_OPTIONS.length).toBe(8);
      for (const opt of LANGUAGE_OPTIONS) {
        expect(RESUME_DICTIONARIES[opt.code]).toBeDefined();
        expect(opt.nativeName.length).toBeGreaterThan(0);
      }
    });
  });
});
