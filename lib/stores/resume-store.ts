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

export interface ResumeVersion {
  id: string;
  created_at: string;
  content: {
    profile: Profile | null;
    workExperiences: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
    languages: Language[];
    summary: string | null;
  };
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
  template: string;
  slug: string | null;
  is_public: boolean;
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
  setTemplate: (template: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setSlug: (slug: string) => void;

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

  // Versioning
  versions: ResumeVersion[];
  loadVersions: () => Promise<void>;
  saveVersion: () => Promise<void>;
  restoreVersion: (version: ResumeVersion) => void;
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
  template: "modern",
  slug: null,
  is_public: false,
  hasChanges: false,
  versions: [],

  setResumeId: (id) => set({ resumeId: id }),
  setProfile: (profile) => set({ profile }),
  setWorkExperiences: (experiences) => set({ workExperiences: experiences }),
  setEducation: (education) => set({ education }),
  setSkills: (skills) => set({ skills }),
  setProjects: (projects) => set({ projects }),
  setCertifications: (certifications) => set({ certifications }),
  setLanguages: (languages) => set({ languages }),
  setTemplate: (template) => set({ template, hasChanges: true }),
  setIsPublic: (isPublic) => set({ is_public: isPublic, hasChanges: true }),
  setSlug: (slug) => set({ slug, hasChanges: true }),

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

    // Update profile (auth.users extension)
    if (state.profile) {
      const { ...profileData } = state.profile;

      // Update basic profile info
      if (profileData.full_name || profileData.email) {
        await supabase
          .from("profiles")
          .update({
            full_name: profileData.full_name,
            email: profileData.email,
          })
          .eq("id", user.id);
      }

      // Update/Insert personal_info linked to resume
      const personalInfoData = {
        resume_id: state.resumeId,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        linkedin: profileData.linkedin_url,
        website: profileData.website_url,
        github: profileData.github_url,
        summary: profileData.summary,
      };

      const { error: personalInfoError } = await supabase
        .from("personal_info")
        .upsert(personalInfoData, { onConflict: "resume_id" });

      if (personalInfoError) {
        console.error("Error saving personal info:", personalInfoError);
      }
    }

    // Helper to handle collection updates
    const handleCollectionSave = async (
      collection: any[],
      tableName: string,
      mapToDb: (item: any) => any,
      updateLocalState: (id: string, newId: string) => void
    ) => {
      for (const item of collection) {
        const dbItem = mapToDb(item);

        if (item.id.startsWith("temp-")) {
          // Insert new
          const { data, error } = await supabase
            .from(tableName)
            .insert({ ...dbItem, resume_id: state.resumeId })
            .select("id")
            .single();

          if (!error && data) {
            updateLocalState(item.id, data.id);
          } else if (error) {
            console.error(`Error saving to ${tableName}:`, error);
          }
        } else {
          // Update existing
          const { error } = await supabase
            .from(tableName)
            .update(dbItem)
            .eq("id", item.id);

          if (error) {
            console.error(`Error updating ${tableName}:`, error);
          }
        }
      }
    };

    // Handle work experiences
    await handleCollectionSave(
      state.workExperiences,
      "work_experiences",
      (exp) => ({
        company: exp.company,
        position: exp.position,
        location: exp.location,
        start_date: exp.start_date === "" ? null : exp.start_date,
        end_date: exp.end_date === "" ? null : exp.end_date,
        is_current: exp.is_current,
        description: exp.description,
        highlights: exp.highlights,
        sort_order: exp.display_order,
      }),
      (oldId, newId) => {
        set((s) => ({
          workExperiences: s.workExperiences.map((i) =>
            i.id === oldId ? { ...i, id: newId } : i
          )
        }));
      }
    );

    // Handle education
    await handleCollectionSave(
      state.education,
      "education",
      (edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        location: edu.location,
        start_date: edu.start_date === "" ? null : edu.start_date,
        end_date: edu.end_date === "" ? null : edu.end_date,
        gpa: edu.gpa,
        achievements: edu.highlights,
        sort_order: edu.display_order,
      }),
      (oldId, newId) => {
        set((s) => ({
          education: s.education.map((i) =>
            i.id === oldId ? { ...i, id: newId } : i
          )
        }));
      }
    );

    // Handle skills
    await handleCollectionSave(
      state.skills,
      "skills",
      (skill) => ({
        name: skill.name,
        category: skill.category,
        proficiency_level: skill.proficiency_level,
        sort_order: skill.display_order,
      }),
      (oldId, newId) => {
        set((s) => ({
          skills: s.skills.map((i) =>
            i.id === oldId ? { ...i, id: newId } : i
          )
        }));
      }
    );

    // Handle projects
    await handleCollectionSave(
      state.projects,
      "projects",
      (proj) => ({
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies,
        url: proj.url,
        highlights: proj.highlights,
        sort_order: proj.display_order,
      }),
      (oldId, newId) => {
        set((s) => ({
          projects: s.projects.map((i) =>
            i.id === oldId ? { ...i, id: newId } : i
          )
        }));
      }
    );

    // Handle certifications
    await handleCollectionSave(
      state.certifications,
      "certifications",
      (cert) => ({
        name: cert.name,
        issuer: cert.issuer,
        issue_date: cert.issue_date === "" ? null : cert.issue_date,
        expiry_date: cert.expiry_date === "" ? null : cert.expiry_date,
        credential_id: cert.credential_id,
        credential_url: cert.credential_url,
        sort_order: cert.display_order,
      }),
      (oldId, newId) => {
        set((s) => ({
          certifications: s.certifications.map((i) =>
            i.id === oldId ? { ...i, id: newId } : i
          )
        }));
      }
    );

    // Handle languages
    await handleCollectionSave(
      state.languages,
      "languages",
      (lang) => ({
        name: lang.language,
        proficiency: lang.proficiency,
        sort_order: lang.display_order,
      }),
      (oldId, newId) => {
        set((s) => ({
          languages: s.languages.map((i) =>
            i.id === oldId ? { ...i, id: newId } : i
          )
        }));
      }
    );

    // Update resume timestamp and template
    await supabase
      .from("resumes")
      .update({
        updated_at: new Date().toISOString(),
        template: state.template,
        slug: state.slug,
        is_public: state.is_public
      })
      .eq("id", state.resumeId);

    set({ hasChanges: false });
  },

  loadVersions: async () => {
    const state = get();
    if (!state.resumeId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*")
      .eq("resume_id", state.resumeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading versions:", error);
      return;
    }

    set({ versions: data || [] });
  },

  saveVersion: async () => {
    const state = get();
    if (!state.resumeId) return;

    const content = {
      profile: state.profile,
      workExperiences: state.workExperiences,
      education: state.education,
      skills: state.skills,
      projects: state.projects,
      certifications: state.certifications,
      languages: state.languages,
    };

    const supabase = createClient();
    const { error } = await supabase
      .from("resume_versions")
      .insert({
        resume_id: state.resumeId,
        content,
      });

    if (error) {
      console.error("Error saving version:", error);
      throw error;
    }

    // Reload versions
    get().loadVersions();
  },

  restoreVersion: (version) => {
    const content = version.content;

    // Helper to generate new IDs for restored content to avoid conflicts
    const regenIds = (items: any[]) => items.map(item => ({
      ...item,
      id: `temp-restored-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    set({
      profile: content.profile,
      workExperiences: regenIds(content.workExperiences),
      education: regenIds(content.education),
      skills: regenIds(content.skills),
      projects: regenIds(content.projects),
      certifications: regenIds(content.certifications),
      languages: regenIds(content.languages),
      hasChanges: true
    });
  },
}));
