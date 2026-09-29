import { describe, it, expect } from "vitest";
import {
  DEFAULT_USER_MEMORY,
  calculateMemoryCompleteness,
  UserMemory,
} from "./user-memory";

describe("User Memory Architecture", () => {
  it("provides valid default user memory structure", () => {
    expect(DEFAULT_USER_MEMORY).toBeDefined();
    expect(DEFAULT_USER_MEMORY.basics.full_name).toBeTruthy();
    expect(DEFAULT_USER_MEMORY.basics.headline).toBeTruthy();
    expect(DEFAULT_USER_MEMORY.experiences.length).toBeGreaterThan(0);
    expect(DEFAULT_USER_MEMORY.skills.length).toBeGreaterThan(0);
    expect(DEFAULT_USER_MEMORY.education.length).toBeGreaterThan(0);
    expect(DEFAULT_USER_MEMORY.projects.length).toBeGreaterThan(0);
  });

  it("calculates memory completeness score accurately", () => {
    const completeness = calculateMemoryCompleteness(DEFAULT_USER_MEMORY);
    expect(completeness.score).toBeGreaterThan(70);
    expect(completeness.breakdown).toBeInstanceOf(Array);
    expect(completeness.breakdown.length).toBe(10);

    // Verify all breakdown items have label, passed, and weight
    completeness.breakdown.forEach((item) => {
      expect(item.label).toBeDefined();
      expect(typeof item.passed).toBe("boolean");
      expect(typeof item.weight).toBe("number");
    });
  });

  it("returns low score for empty memory", () => {
    const emptyMemory: UserMemory = {
      version: 1,
      last_updated: new Date().toISOString(),
      sources: [],
      basics: {
        full_name: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
      },
      socials: {},
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      preferences: {
        target_roles: [],
        work_style: "remote",
        authorized_work_locations: [],
      },
    };

    const completeness = calculateMemoryCompleteness(emptyMemory);
    expect(completeness.score).toBe(0);
    expect(completeness.breakdown.every((b) => !b.passed)).toBe(true);
  });

  it("increases score as sections are populated", () => {
    const partialMemory: UserMemory = {
      version: 1,
      last_updated: new Date().toISOString(),
      sources: ["Manual Entry"],
      basics: {
        full_name: "Alex Morgan",
        headline: "Principal Engineer",
        email: "alex@example.com",
        phone: "+1 555 123 4567",
        location: "Seattle, WA",
        bio: "Senior engineer with 10 years experience delivering software",
      },
      socials: {
        linkedin: "https://linkedin.com/in/alexmorgan",
        github: "https://github.com/alexmorgan",
      },
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      preferences: {
        target_roles: ["Staff Engineer"],
        work_style: "remote",
        authorized_work_locations: ["United States"],
      },
    };

    const completeness = calculateMemoryCompleteness(partialMemory);
    // Headline (15) + Contact (10) + Bio (10) + Socials (10) + Preferences (5) = 50
    expect(completeness.score).toBe(50);
  });
});
