import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  github_url: string | null;
  summary: string | null;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  highlights: string[];
  display_order: number;
}

interface Education {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  highlights: string[];
  display_order: number;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency_level: number | null;
  display_order: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  technologies: string[];
  url: string | null;
  highlights: string[];
  display_order: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  display_order: number;
}

interface Language {
  id: string;
  language: string;
  proficiency: string;
  display_order: number;
}

interface ResumeState {
  resumeId: string | null;
  profile: Profile | null;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  hasChanges: boolean;

  // Setters
  setResumeId: (id: string) => void;
  setProfile: (profile: Profile) => void;
  setWorkExperiences: (experiences: WorkExperience[]) => void;
  setEducation: (education: Education[]) => void;
  setSkills: (skills: Skill[]) => void;
  setProjects: (projects: Project[]) => void;
  setCertifications: (certifications: Certification[]) => void;
  setLanguages: (languages: Language[]) => void;

  // Update functions
  updateProfile: (updates: Partial<Profile>) => void;
  addWorkExperience: (experience: Omit<WorkExperience, "id" | "display_order">) => void;
  updateWorkExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: (edu: Omit<Education, "id" | "display_order">) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<Skill, "id" | "display_order">) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  addProject: (project: Omit<Project, "id" | "display_order">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addCertification: (cert: Omit<Certification, "id" | "display_order">) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  addLanguage: (lang: Omit<Language, "id" | "display_order">) => void;
  updateLanguage: (id: string, updates: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  // Save function
  saveAllChanges: () => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumeId: null,
  profile: null,
  workExperiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  hasChanges: false,

  setResumeId: (id) => set({ resumeId: id }),
  setProfile: (profile) => set({ profile }),
  setWorkExperiences: (experiences) => set({ workExperiences: experiences }),
  setEducation: (education) => set({ education }),
  setSkills: (skills) => set({ skills }),
  setProjects: (projects) => set({ projects }),
  setCertifications: (certifications) => set({ certifications }),
  setLanguages: (languages) => set({ languages }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
      hasChanges: true,
    })),

  addWorkExperience: (experience) =>
    set((state) => ({
      workExperiences: [
        ...state.workExperiences,
        {
          ...experience,
          id: `temp-${Date.now()}`,
          display_order: state.workExperiences.length,
        },
      ],
      hasChanges: true,
    })),

  updateWorkExperience: (id, updates) =>
    set((state) => ({
      workExperiences: state.workExperiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
      hasChanges: true,
    })),

  removeWorkExperience: (id) =>
    set((state) => ({
      workExperiences: state.workExperiences.filter((exp) => exp.id !== id),
      hasChanges: true,
    })),

  addEducation: (edu) =>
    set((state) => ({
      education: [
        ...state.education,
        {
          ...edu,
          id: `temp-${Date.now()}`,
          display_order: state.education.length,
        },
      ],
      hasChanges: true,
    })),

  updateEducation: (id, updates) =>
    set((state) => ({
      education: state.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
      hasChanges: true,
    })),

  removeEducation: (id) =>
    set((state) => ({
      education: state.education.filter((edu) => edu.id !== id),
      hasChanges: true,
    })),

  addSkill: (skill) =>
    set((state) => ({
      skills: [
        ...state.skills,
        {
          ...skill,
          id: `temp-${Date.now()}`,
          display_order: state.skills.length,
        },
      ],
      hasChanges: true,
    })),

  updateSkill: (id, updates) =>
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, ...updates } : skill
      ),
      hasChanges: true,
    })),

  removeSkill: (id) =>
    set((state) => ({
      skills: state.skills.filter((skill) => skill.id !== id),
      hasChanges: true,
    })),

  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: `temp-${Date.now()}`,
          display_order: state.projects.length,
        },
      ],
      hasChanges: true,
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
      hasChanges: true,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((proj) => proj.id !== id),
      hasChanges: true,
    })),

  addCertification: (cert) =>
    set((state) => ({
      certifications: [
        ...state.certifications,
        {
          ...cert,
          id: `temp-${Date.now()}`,
          display_order: state.certifications.length,
        },
      ],
      hasChanges: true,
    })),

  updateCertification: (id, updates) =>
    set((state) => ({
      certifications: state.certifications.map((cert) =>
        cert.id === id ? { ...cert, ...updates } : cert
      ),
      hasChanges: true,
    })),

  removeCertification: (id) =>
    set((state) => ({
      certifications: state.certifications.filter((cert) => cert.id !== id),
      hasChanges: true,
    })),

  addLanguage: (lang) =>
    set((state) => ({
      languages: [
        ...state.languages,
        {
          ...lang,
          id: `temp-${Date.now()}`,
          display_order: state.languages.length,
        },
      ],
      hasChanges: true,
    })),

  updateLanguage: (id, updates) =>
    set((state) => ({
      languages: state.languages.map((lang) =>
        lang.id === id ? { ...lang, ...updates } : lang
      ),
      hasChanges: true,
    })),

  removeLanguage: (id) =>
    set((state) => ({
      languages: state.languages.filter((lang) => lang.id !== id),
      hasChanges: true,
    })),

  saveAllChanges: async () => {
    const state = get();
    if (!state.resumeId) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Update profile
    if (state.profile) {
      await supabase
        .from("profiles")
        .update({
          full_name: state.profile.full_name,
          email: state.profile.email,
          phone: state.profile.phone,
          location: state.profile.location,
          linkedin_url: state.profile.linkedin_url,
          website_url: state.profile.website_url,
          github_url: state.profile.github_url,
          summary: state.profile.summary,
        })
        .eq("id", user.id);
    }

    // Handle work experiences
    for (const exp of state.workExperiences) {
      if (exp.id.startsWith("temp-")) {
        // Insert new
        await supabase.from("work_experiences").insert({
          user_id: user.id,
          resume_id: state.resumeId,
          company: exp.company,
          position: exp.position,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          description: exp.description,
          highlights: exp.highlights,
          display_order: exp.display_order,
        });
      } else {
        // Update existing
        await supabase
          .from("work_experiences")
          .update({
            company: exp.company,
            position: exp.position,
            location: exp.location,
            start_date: exp.start_date,
            end_date: exp.end_date,
            is_current: exp.is_current,
            description: exp.description,
            highlights: exp.highlights,
            display_order: exp.display_order,
          })
          .eq("id", exp.id);
      }
    }

    // Handle education
    for (const edu of state.education) {
      if (edu.id.startsWith("temp-")) {
        await supabase.from("education").insert({
          user_id: user.id,
          resume_id: state.resumeId,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.field_of_study,
          location: edu.location,
          start_date: edu.start_date,
          end_date: edu.end_date,
          gpa: edu.gpa,
          highlights: edu.highlights,
          display_order: edu.display_order,
        });
      } else {
        await supabase
          .from("education")
          .update({
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.field_of_study,
            location: edu.location,
            start_date: edu.start_date,
            end_date: edu.end_date,
            gpa: edu.gpa,
            highlights: edu.highlights,
            display_order: edu.display_order,
          })
          .eq("id", edu.id);
      }
    }

    // Handle skills
    for (const skill of state.skills) {
      if (skill.id.startsWith("temp-")) {
        await supabase.from("skills").insert({
          user_id: user.id,
          resume_id: state.resumeId,
          name: skill.name,
          category: skill.category,
          proficiency_level: skill.proficiency_level,
          display_order: skill.display_order,
        });
      } else {
        await supabase
          .from("skills")
          .update({
            name: skill.name,
            category: skill.category,
            proficiency_level: skill.proficiency_level,
            display_order: skill.display_order,
          })
          .eq("id", skill.id);
      }
    }

    // Handle projects
    for (const proj of state.projects) {
      if (proj.id.startsWith("temp-")) {
        await supabase.from("projects").insert({
          user_id: user.id,
          resume_id: state.resumeId,
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
          url: proj.url,
          highlights: proj.highlights,
          display_order: proj.display_order,
        });
      } else {
        await supabase
          .from("projects")
          .update({
            name: proj.name,
            description: proj.description,
            technologies: proj.technologies,
            url: proj.url,
            highlights: proj.highlights,
            display_order: proj.display_order,
          })
          .eq("id", proj.id);
      }
    }

    // Handle certifications
    for (const cert of state.certifications) {
      if (cert.id.startsWith("temp-")) {
        await supabase.from("certifications").insert({
          user_id: user.id,
          resume_id: state.resumeId,
          name: cert.name,
          issuer: cert.issuer,
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date,
          credential_id: cert.credential_id,
          credential_url: cert.credential_url,
          display_order: cert.display_order,
        });
      } else {
        await supabase
          .from("certifications")
          .update({
            name: cert.name,
            issuer: cert.issuer,
            issue_date: cert.issue_date,
            expiry_date: cert.expiry_date,
            credential_id: cert.credential_id,
            credential_url: cert.credential_url,
            display_order: cert.display_order,
          })
          .eq("id", cert.id);
      }
    }

    // Handle languages
    for (const lang of state.languages) {
      if (lang.id.startsWith("temp-")) {
        await supabase.from("languages").insert({
          user_id: user.id,
          resume_id: state.resumeId,
          language: lang.language,
          proficiency: lang.proficiency,
          display_order: lang.display_order,
        });
      } else {
        await supabase
          .from("languages")
          .update({
            language: lang.language,
            proficiency: lang.proficiency,
            display_order: lang.display_order,
          })
          .eq("id", lang.id);
      }
    }

    // Update resume timestamp
    await supabase
      .from("resumes")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", state.resumeId);

    set({ hasChanges: false });
  },
}));
