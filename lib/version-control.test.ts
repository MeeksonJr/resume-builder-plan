import { describe, it, expect } from "vitest";
import { shouldCreateVersion, getVersionDiff, ResumeSnapshot } from "./version-control";

describe("Version Control Diff Engine", () => {
  const baseSnapshot: ResumeSnapshot = {
    personalInfo: {
      full_name: "Morgan Taylor",
      email: "morgan@example.com",
      phone: "+1 555 123 4567",
      summary: "Senior Backend Engineer with Go & Rust experience.",
    },
    workExperiences: [
      { id: "1", company: "Meta", position: "Software Engineer", sort_order: 0 },
      { id: "2", company: "Uber", position: "Senior Engineer", sort_order: 1 },
    ],
    education: [
      { id: "1", institution: "Berkeley", degree: "B.S. EECS", sort_order: 0 },
    ],
    skills: [
      { id: "1", name: "Golang", sort_order: 0 },
      { id: "2", name: "Kubernetes", sort_order: 1 },
      { id: "3", name: "PostgreSQL", sort_order: 2 },
    ],
    projects: [
      { id: "1", name: "Distributed KV Store", sort_order: 0 },
    ],
    certifications: [
      { id: "1", name: "AWS SAA", sort_order: 0 },
    ],
    languages: [
      { id: "1", language: "English", sort_order: 0 },
    ],
  };

  describe("shouldCreateVersion", () => {
    it("should return false when snapshots are identical", () => {
      const cloned = JSON.parse(JSON.stringify(baseSnapshot));
      expect(shouldCreateVersion(baseSnapshot, cloned)).toBe(false);
    });

    it("should return true when summary changes in personal info", () => {
      const updated: ResumeSnapshot = {
        ...baseSnapshot,
        personalInfo: {
          ...baseSnapshot.personalInfo,
          summary: "Principal Distributed Systems Architect.",
        },
      };
      expect(shouldCreateVersion(baseSnapshot, updated)).toBe(true);
    });

    it("should return true when work experience count changes", () => {
      const updated: ResumeSnapshot = {
        ...baseSnapshot,
        workExperiences: baseSnapshot.workExperiences.slice(0, 1),
      };
      expect(shouldCreateVersion(baseSnapshot, updated)).toBe(true);
    });

    it("should return true when skills count changes", () => {
      const updated: ResumeSnapshot = {
        ...baseSnapshot,
        skills: [...baseSnapshot.skills, { id: "4", name: "TypeScript", sort_order: 3 }],
      };
      expect(shouldCreateVersion(baseSnapshot, updated)).toBe(true);
    });
  });

  describe("getVersionDiff", () => {
    it("should return empty diffs for identical snapshots", () => {
      const diffs = getVersionDiff(baseSnapshot, baseSnapshot);
      expect(diffs).toEqual([]);
    });

    it("should detect modified personal info fields", () => {
      const modified: ResumeSnapshot = {
        ...baseSnapshot,
        personalInfo: {
          ...baseSnapshot.personalInfo,
          full_name: "Morgan Taylor, PhD",
          summary: "Updated executive summary.",
        },
      };

      const diffs = getVersionDiff(baseSnapshot, modified);
      const personalDiff = diffs.find((d) => d.section === "Personal Info");

      expect(personalDiff).toBeDefined();
      expect(personalDiff?.changes.some((c) => c.field === "full_name" && c.type === "modified")).toBe(true);
      expect(personalDiff?.changes.some((c) => c.field === "summary" && c.type === "modified")).toBe(true);
    });

    it("should detect added and removed skills", () => {
      const modifiedSkills: ResumeSnapshot = {
        ...baseSnapshot,
        skills: [
          { id: "1", name: "Golang", sort_order: 0 },
          // Removed Kubernetes, PostgreSQL
          { id: "4", name: "Rust", sort_order: 1 }, // Added Rust
        ],
      };

      const diffs = getVersionDiff(baseSnapshot, modifiedSkills);
      const skillDiff = diffs.find((d) => d.section === "Skills");

      expect(skillDiff).toBeDefined();
      const added = skillDiff?.changes.filter((c) => c.type === "added");
      const removed = skillDiff?.changes.filter((c) => c.type === "removed");

      expect(added?.map((c) => c.newValue)).toContain("Rust");
      expect(removed?.map((c) => c.oldValue)).toContain("Kubernetes");
      expect(removed?.map((c) => c.oldValue)).toContain("PostgreSQL");
    });

    it("should detect work experience count differences", () => {
      const updated: ResumeSnapshot = {
        ...baseSnapshot,
        workExperiences: [
          ...baseSnapshot.workExperiences,
          { id: "3", company: "Apple", position: "Staff Engineer", sort_order: 2 },
        ],
      };

      const diffs = getVersionDiff(baseSnapshot, updated);
      const workDiff = diffs.find((d) => d.section === "Work Experience");

      expect(workDiff).toBeDefined();
      expect(workDiff?.changes[0].type).toBe("added");
      expect(workDiff?.changes[0].newValue).toBe("3 positions");
    });
  });
});
