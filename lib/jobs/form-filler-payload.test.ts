import { describe, it, expect } from "vitest";
import {
  generateAtsPayload,
  type CandidatePreferences,
} from "./form-filler-payload";

describe("Phase 49: Universal Job Application Form-Fill Payload Engine", () => {
  const mockResumeData = {
    profile: {
      full_name: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "+1 (555) 987-6543",
      location: "Austin, TX",
      title: "Senior Cloud Engineer",
      summary: "Specialized in AWS, Terraform, and Kubernetes infrastructure.",
      linkedin: "https://linkedin.com/in/marcusvance",
      github: "https://github.com/marcusvance",
      website: "https://marcusvance.cloud",
    },
    workExperiences: [
      {
        company: "Apex Systems",
        role: "Staff DevOps Engineer",
        start_date: "2022-01",
        end_date: "",
        is_current: true,
        description: "Orchestrated multi-region AWS EKS clusters.",
      },
    ],
    education: [
      {
        institution: "UT Austin",
        degree: "B.S.",
        field_of_study: "Computer Engineering",
      },
    ],
    skills: [
      { name: "Kubernetes" },
      { name: "Terraform" },
      { name: "AWS" },
      { name: "Python" },
    ],
  };

  const preferences: CandidatePreferences = {
    workAuthorization: "permanent_resident",
    yearsOfExperience: 6,
    noticePeriodWeeks: 3,
    desiredSalary: "$165,000",
  };

  it("generates greenhouse compliant application payload", () => {
    const payload = generateAtsPayload(mockResumeData, "greenhouse", preferences);
    expect(payload.first_name).toBe("Marcus");
    expect(payload.last_name).toBe("Vance");
    expect(payload.email).toBe("marcus.vance@example.com");
    expect(payload.custom_fields.work_authorization).toBe("permanent_resident");
    expect(payload.custom_fields.salary_expectation).toBe("$165,000");
    expect(payload.custom_fields.notice_period).toBe("3 weeks");
  });

  it("generates lever compliant application payload with cards", () => {
    const payload = generateAtsPayload(mockResumeData, "lever", preferences);
    expect(payload.name).toBe("Marcus Vance");
    expect(payload.email).toBe("marcus.vance@example.com");
    expect(payload.org).toBe("Apex Systems");
    expect(payload.urls.LinkedIn).toBe("https://linkedin.com/in/marcusvance");
    expect(payload.cards.length).toBe(2);
    expect(payload.cards[0].fields.authorized).toBe(true);
  });

  it("generates workday compliant payload with compliance and history arrays", () => {
    const payload = generateAtsPayload(mockResumeData, "workday", preferences);
    expect(payload.personalInfo.legalFirstName).toBe("Marcus");
    expect(payload.personalInfo.legalLastName).toBe("Vance");
    expect(payload.complianceAndDisclosures.authorizedInCountry).toBe(true);
    expect(payload.complianceAndDisclosures.requiresSponsorship).toBe(false);
    expect(payload.experience[0].company).toBe("Apex Systems");
    expect(payload.experience[0].endDate).toBe("Present");
    expect(payload.education[0].institution).toBe("UT Austin");
  });

  it("generates ashby compliant application questionnaire answers", () => {
    const payload = generateAtsPayload(mockResumeData, "ashby", preferences);
    expect(payload.name).toBe("Marcus Vance");
    expect(payload.applicationAnswers["Work Authorization Status"]).toBe("permanent_resident");
    expect(payload.applicationAnswers["Notice Period"]).toBe("3 weeks");
  });

  it("generates universal schema for browser auto-fill extensions", () => {
    const payload = generateAtsPayload(mockResumeData, "universal", preferences);
    expect(payload.meta.platform).toBe("universal");
    expect(payload.candidate.fullName).toBe("Marcus Vance");
    expect(payload.skillsList).toContain("Kubernetes");
    expect(payload.skillsList).toContain("Terraform");
    expect(payload.workAuthorization.authorizedToWork).toBe(true);
  });
});
