import { describe, it, expect } from "vitest";
import { parseJSONResume } from "./json-import";

describe("parseJSONResume", () => {
  it("returns error on invalid json string", () => {
    const res = parseJSONResume("not valid json");
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("parses standard JSON Resume schema properly", () => {
    const standardJSON = {
      basics: {
        name: "John Doe",
        label: "Software Engineer",
        email: "john@example.com",
        phone: "(555) 123-4567",
        url: "https://johndoe.com",
        summary: "Passionate engineer building web products.",
        location: {
          city: "San Francisco",
          region: "CA",
        },
        profiles: [
          { network: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
          { network: "GitHub", url: "https://github.com/johndoe" },
        ],
      },
      work: [
        {
          name: "Acme Corp",
          position: "Frontend Architect",
          startDate: "2022-01-01",
          endDate: "Present",
          summary: "Led frontend development.",
          highlights: ["Increased speed by 40%"],
        },
      ],
      education: [
        {
          institution: "Stanford University",
          area: "Computer Science",
          studyType: "B.S.",
          startDate: "2018-09-01",
          endDate: "2022-06-01",
        },
      ],
      skills: [
        { name: "TypeScript", level: "5", category: "Languages" },
        { name: "React", level: "4", category: "Frameworks" },
      ],
      projects: [
        {
          name: "Project Alpha",
          description: "A full-stack React application",
          keywords: ["Next.js", "PostgreSQL"],
          url: "https://alpha.example.com",
        },
      ],
      certificates: [
        {
          name: "AWS Certified Developer",
          issuer: "Amazon",
          date: "2023-05-15",
        },
      ],
      languages: [
        { language: "English", fluency: "Native speaker" },
      ],
    };

    const res = parseJSONResume(standardJSON);
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.profile.full_name).toBe("John Doe");
    expect(res.data?.profile.email).toBe("john@example.com");
    expect(res.data?.profile.linkedin_url).toBe("https://linkedin.com/in/johndoe");
    expect(res.data?.profile.github_url).toBe("https://github.com/johndoe");
    expect(res.data?.workExperiences.length).toBe(1);
    expect(res.data?.workExperiences[0].company).toBe("Acme Corp");
    expect(res.data?.workExperiences[0].is_current).toBe(true);
    expect(res.data?.education.length).toBe(1);
    expect(res.data?.skills.length).toBe(2);
    expect(res.data?.skills[0].proficiency_level).toBe(5);
    expect(res.data?.projects.length).toBe(1);
    expect(res.data?.certifications.length).toBe(1);
    expect(res.data?.languages.length).toBe(1);
  });
});
