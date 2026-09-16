import { describe, it, expect, beforeEach } from "vitest";
import { useResumeStore, Profile, VisualConfig } from "./resume-store";

describe("ResumeStore State Management", () => {
  const initialStoreState = useResumeStore.getState();

  beforeEach(() => {
    // Reset store to known baseline state before each test
    useResumeStore.setState({
      resumeId: null,
      profile: null,
      workExperiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      title: "Untitled Resume",
      template: "modern",
      slug: null,
      is_public: false,
      language: "en",
      is_rtl: false,
      hasChanges: false,
      isSaving: false,
      sectionOrder: ["experience", "education", "skills", "projects", "certifications", "languages"],
      visualConfig: {
        accentColor: "#0070f3",
        fontFamily: "Inter",
        fontSize: "standard",
        lineHeight: "relaxed",
        nav_style: "standard",
        margins: "standard",
      },
      versions: [],
      tailoringResult: null,
      targetJob: null,
    });
  });

  it("should have correct initial state", () => {
    const state = useResumeStore.getState();
    expect(state.title).toBe("Untitled Resume");
    expect(state.template).toBe("modern");
    expect(state.workExperiences).toEqual([]);
    expect(state.education).toEqual([]);
    expect(state.skills).toEqual([]);
    expect(state.hasChanges).toBe(false);
  });

  it("should set and update profile information and mark hasChanges", () => {
    const sampleProfile: Profile = {
      id: "prof-1",
      full_name: "Jane Doe",
      email: "jane@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      linkedin_url: "https://linkedin.com/in/janedoe",
      website_url: "https://janedoe.com",
      github_url: "https://github.com/janedoe",
      summary: "Experienced Full Stack Engineer",
    };

    useResumeStore.getState().setProfile(sampleProfile);
    expect(useResumeStore.getState().profile?.full_name).toBe("Jane Doe");

    useResumeStore.getState().updateProfile({ summary: "Updated Senior Engineer Summary" });
    const updated = useResumeStore.getState();
    expect(updated.profile?.summary).toBe("Updated Senior Engineer Summary");
    expect(updated.profile?.full_name).toBe("Jane Doe");
    expect(updated.hasChanges).toBe(true);
  });

  it("should support adding, updating, and removing work experiences", () => {
    const store = useResumeStore.getState();

    // Add experience
    store.addWorkExperience({
      company: "Acme Corp",
      position: "Senior Developer",
      location: "Remote",
      start_date: "2021-01",
      end_date: null,
      is_current: true,
      description: "Leading core platform team",
      highlights: ["Improved latency by 30%"],
    });

    let state = useResumeStore.getState();
    expect(state.workExperiences.length).toBe(1);
    expect(state.workExperiences[0].company).toBe("Acme Corp");
    expect(state.workExperiences[0].display_order).toBe(0);
    expect(state.hasChanges).toBe(true);

    const expId = state.workExperiences[0].id;

    // Update experience
    store.updateWorkExperience(expId, {
      position: "Staff Developer",
      company: "Acme Technologies",
    });

    state = useResumeStore.getState();
    expect(state.workExperiences[0].position).toBe("Staff Developer");
    expect(state.workExperiences[0].company).toBe("Acme Technologies");

    // Remove experience
    store.removeWorkExperience(expId);
    state = useResumeStore.getState();
    expect(state.workExperiences.length).toBe(0);
  });

  it("should support adding, updating, and removing education entries", () => {
    const store = useResumeStore.getState();

    store.addEducation({
      institution: "MIT",
      degree: "B.S.",
      field_of_study: "Computer Science",
      location: "Cambridge, MA",
      start_date: "2016",
      end_date: "2020",
      gpa: "3.9",
      highlights: ["Dean's List"],
    });

    let state = useResumeStore.getState();
    expect(state.education.length).toBe(1);
    expect(state.education[0].institution).toBe("MIT");

    const eduId = state.education[0].id;
    store.updateEducation(eduId, { gpa: "4.0" });
    expect(useResumeStore.getState().education[0].gpa).toBe("4.0");

    store.removeEducation(eduId);
    expect(useResumeStore.getState().education.length).toBe(0);
  });

  it("should support adding, updating, and removing skills", () => {
    const store = useResumeStore.getState();

    store.addSkill({
      name: "TypeScript",
      category: "Languages",
      proficiency_level: 5,
    });

    let state = useResumeStore.getState();
    expect(state.skills.length).toBe(1);
    expect(state.skills[0].name).toBe("TypeScript");

    const skillId = state.skills[0].id;
    store.updateSkill(skillId, { proficiency_level: 4 });
    expect(useResumeStore.getState().skills[0].proficiency_level).toBe(4);

    store.removeSkill(skillId);
    expect(useResumeStore.getState().skills.length).toBe(0);
  });

  it("should support adding, updating, and removing projects", () => {
    const store = useResumeStore.getState();

    store.addProject({
      name: "ResumeAI",
      description: "AI-powered resume builder",
      technologies: ["Next.js", "TypeScript", "Tailwind"],
      url: "https://example.com/resumeai",
      highlights: ["5000+ stars"],
    });

    let state = useResumeStore.getState();
    expect(state.projects.length).toBe(1);
    expect(state.projects[0].name).toBe("ResumeAI");

    const projId = state.projects[0].id;
    store.updateProject(projId, { name: "ResumeAI Pro" });
    expect(useResumeStore.getState().projects[0].name).toBe("ResumeAI Pro");

    store.removeProject(projId);
    expect(useResumeStore.getState().projects.length).toBe(0);
  });

  it("should support adding, updating, and removing certifications", () => {
    const store = useResumeStore.getState();

    store.addCertification({
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      issue_date: "2023-05",
      expiry_date: "2026-05",
      credential_id: "AWS-123456",
      credential_url: "https://aws.amazon.com/verify",
    });

    let state = useResumeStore.getState();
    expect(state.certifications.length).toBe(1);
    expect(state.certifications[0].name).toBe("AWS Certified Developer");

    const certId = state.certifications[0].id;
    store.updateCertification(certId, { name: "AWS Certified DevOps Engineer" });
    expect(useResumeStore.getState().certifications[0].name).toBe("AWS Certified DevOps Engineer");

    store.removeCertification(certId);
    expect(useResumeStore.getState().certifications.length).toBe(0);
  });

  it("should support adding, updating, and removing languages", () => {
    const store = useResumeStore.getState();

    store.addLanguage({
      language: "Spanish",
      proficiency: "Fluent",
    });

    let state = useResumeStore.getState();
    expect(state.languages.length).toBe(1);
    expect(state.languages[0].language).toBe("Spanish");

    const langId = state.languages[0].id;
    store.updateLanguage(langId, { proficiency: "Native" });
    expect(useResumeStore.getState().languages[0].proficiency).toBe("Native");

    store.removeLanguage(langId);
    expect(useResumeStore.getState().languages.length).toBe(0);
  });

  it("should update visual configuration options", () => {
    const store = useResumeStore.getState();

    store.updateVisualConfig({
      accentColor: "#10b981",
      fontSize: "large",
      lineHeight: "tight",
    });

    const state = useResumeStore.getState();
    expect(state.visualConfig.accentColor).toBe("#10b981");
    expect(state.visualConfig.fontSize).toBe("large");
    expect(state.visualConfig.lineHeight).toBe("tight");
    expect(state.hasChanges).toBe(true);
  });

  it("should set template and section ordering", () => {
    const store = useResumeStore.getState();

    store.setTemplate("executive");
    expect(useResumeStore.getState().template).toBe("executive");

    const newOrder = ["skills", "experience", "projects", "education"];
    store.setSectionOrder(newOrder);
    expect(useResumeStore.getState().sectionOrder).toEqual(newOrder);
    expect(useResumeStore.getState().hasChanges).toBe(true);
  });

  it("should manage tailoring result and target job context", () => {
    const store = useResumeStore.getState();

    const sampleJob = {
      title: "Senior AI Engineer",
      company: "Anthropic",
      description: "Build state of the art LLM agent applications.",
    };

    store.setTargetJob(sampleJob);
    expect(useResumeStore.getState().targetJob).toEqual(sampleJob);

    const sampleResult = {
      matchScore: 92,
      recommendations: ["Highlight agentic workflow experience"],
    };

    store.setTailoringResult(sampleResult);
    expect(useResumeStore.getState().tailoringResult).toEqual(sampleResult);
  });
});
