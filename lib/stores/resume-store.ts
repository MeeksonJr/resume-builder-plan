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

export interface VisualConfig {
  accentColor: string;
  fontFamily: string;
  fontSize: "small" | "standard" | "large";
  lineHeight: "tight" | "standard" | "relaxed";
}

const DEFAULT_VISUAL_CONFIG: VisualConfig = {
  accentColor: "#0070f3",
  fontFamily: "Inter",
  fontSize: "standard",
  lineHeight: "relaxed",
};

export interface ResumeVersion {
  id: string;
  created_at: string;
  version_number: number;
  title: string;
  change_summary?: string;
  content: {
    profile: Profile | null;
    workExperiences: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
    languages: Language[];
    visualConfig?: VisualConfig;

    summary: string | null;
  };
  metrics?: {
    applications_sent: number;
    interviews_received: number;
    offers_received: number;
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
  sectionOrder: string[];
  visualConfig: VisualConfig;
  template: string;
  slug: string | null;
  is_public: boolean;
  language: string;
  is_rtl: boolean;
  hasChanges: boolean;

  // Setters
  setResumeId: (id: string) => void;
  setVisualConfig: (config: VisualConfig) => void;
  updateVisualConfig: (updates: Partial<VisualConfig>) => void;
  setProfile: (profile: Profile) => void;
  setWorkExperiences: (experiences: WorkExperience[]) => void;
  setEducation: (education: Education[]) => void;
  setSkills: (skills: Skill[]) => void;
  setProjects: (projects: Project[]) => void;
  setCertifications: (certifications: Certification[]) => void;
  setLanguages: (languages: Language[]) => void;
  setSectionOrder: (order: string[]) => void;
  setTemplate: (template: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setSlug: (slug: string) => void;
  setLanguage: (language: string) => void;
  setIsRtl: (isRtl: boolean) => void;

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

  // Data fetching
  fetchResume: (id: string) => Promise<void>;

  // Versioning
  versions: ResumeVersion[];
  loadVersions: () => Promise<void>;
  saveVersion: (title: string, summary?: string) => Promise<void>;
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
  language: "en",
  is_rtl: false,
  hasChanges: false,
  sectionOrder: ["experience", "education", "skills", "projects", "certifications", "languages"],
  visualConfig: DEFAULT_VISUAL_CONFIG,
  versions: [],

  setResumeId: (id) => set({ resumeId: id }),
  setVisualConfig: (config) => set({ visualConfig: config }),
  updateVisualConfig: (updates) =>
    set((state) => ({
      visualConfig: { ...state.visualConfig, ...updates },
      hasChanges: true,
    })),
  setProfile: (profile) => set({ profile }),
  setWorkExperiences: (experiences) => set({ workExperiences: experiences }),
  setEducation: (education) => set({ education }),
  setSkills: (skills) => set({ skills }),
  setProjects: (projects) => set({ projects }),
  setCertifications: (certifications) => set({ certifications }),
  setLanguages: (languages) => set({ languages, hasChanges: true }),
  setSectionOrder: (order) => set({ sectionOrder: order, hasChanges: true }),
  setTemplate: (template) => set({ template, hasChanges: true }),
  setIsPublic: (isPublic) => set({ is_public: isPublic, hasChanges: true }),
  setSlug: (slug) => set({ slug, hasChanges: true }),
  setLanguage: (language) => set({ language, hasChanges: true }),
  setIsRtl: (isRtl) => set({ is_rtl: isRtl, hasChanges: true }),

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
        throw new Error(`Failed to save personal info: ${personalInfoError.message}`);
      }
    }

    // Helper to handle collection updates
    const handleCollectionSave = async (
      collection: any[],
      tableName: string,
      mapToDb: (item: any) => any,
      updateLocalState: (id: string, newId: string) => void
    ) => {
      const errors: any[] = [];
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
            errors.push(error);
          }
        } else {
          // Update existing
          const { error } = await supabase
            .from(tableName)
            .update(dbItem)
            .eq("id", item.id);

          if (error) {
            console.error(`Error updating ${tableName}:`, error);
            errors.push(error);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Failed to save ${tableName}. See console for details.`);
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

    // Update resume timestamp, template, and section order
    await supabase
      .from("resumes")
      .update({
        updated_at: new Date().toISOString(),
        template_id: state.template,
        slug: state.slug,
        is_public: state.is_public,
        section_order: state.sectionOrder,
        visual_config: state.visualConfig,
        language: state.language,
        is_rtl: state.is_rtl,
      })
      .eq("id", state.resumeId);

    set({ hasChanges: false });
  },

  fetchResume: async (id: string) => {
    const supabase = createClient();

    const [
      { data: profile },
      { data: workExperiences },
      { data: education },
      { data: skills },
      { data: projects },
      { data: certifications },
      { data: languages },
      { data: resume },
    ] = await Promise.all([
      supabase.from("personal_info").select("id, full_name, email, phone, location, linkedin, website, github, summary").eq("resume_id", id).maybeSingle(),
      supabase.from("work_experiences").select("*").eq("resume_id", id).order("sort_order"),
      supabase.from("education").select("*").eq("resume_id", id).order("sort_order"),
      supabase.from("skills").select("*").eq("resume_id", id).order("sort_order"),
      supabase.from("projects").select("*").eq("resume_id", id).order("sort_order"),
      supabase.from("certifications").select("*").eq("resume_id", id).order("sort_order"),
      supabase.from("languages").select("id, language, proficiency, sort_order").eq("resume_id", id).order("sort_order"),
      supabase.from("resumes").select("id, title, template_id, is_public, slug, section_order, visual_config, language, is_rtl").eq("id", id).maybeSingle(),
    ]);

    if (resume) {
      set({
        resumeId: id,
        profile: profile ? {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedin_url: profile.linkedin,
          website_url: profile.website,
          github_url: profile.github,
          summary: profile.summary,
        } : null,
        workExperiences: (workExperiences || []).map((e: any) => ({
          id: e.id,
          company: e.company,
          position: e.position,
          location: e.location,
          start_date: e.start_date,
          end_date: e.end_date,
          is_current: e.is_current,
          description: e.description,
          highlights: e.highlights || [],
          display_order: e.sort_order
        })),
        education: (education || []).map((e: any) => ({
          id: e.id,
          institution: e.institution,
          degree: e.degree,
          field_of_study: e.field_of_study,
          location: e.location,
          start_date: e.start_date,
          end_date: e.end_date,
          gpa: e.gpa,
          highlights: e.achievements || [],
          display_order: e.sort_order
        })),
        skills: (skills || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          display_order: e.sort_order,
          proficiency_level: e.proficiency_level
        })),
        projects: (projects || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          technologies: e.technologies || [],
          url: e.url,
          highlights: e.highlights || [],
          display_order: e.sort_order
        })),
        certifications: (certifications || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          issuer: e.issuer,
          issue_date: e.issue_date,
          expiry_date: e.expiry_date,
          credential_id: e.credential_id,
          credential_url: e.credential_url,
          display_order: e.display_order
        })),
        languages: (languages || []).map((e: any) => ({
          id: e.id,
          language: e.language,
          proficiency: e.proficiency,
          display_order: e.sort_order
        })),

        slug: resume.slug,
        is_public: resume.is_public,
        hasChanges: false
      });
    }
  },

  loadVersions: async () => {
    const state = get();
    if (!state.resumeId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*, version_metrics(applications_sent, interviews_received, offers_received)")
      .eq("resume_id", state.resumeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading versions:", error);
      return;
    }

    set({
      versions: (data || []).map((v: any) => ({
        id: v.id,
        created_at: v.created_at,
        version_number: v.version_number,
        title: v.title,
        change_summary: v.change_summary,
        content: v.snapshot_data,
        metrics: Array.isArray(v.version_metrics) ? v.version_metrics[0] : v.version_metrics
      }))
    });
  },

  saveVersion: async (title: string, summary?: string) => {
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
      visualConfig: state.visualConfig,
    };

    const supabase = createClient();

    // Get next version number
    const { data: nextVersion, error: versionError } = await supabase
      .rpc('get_next_version_number', { p_resume_id: state.resumeId });

    if (versionError) {
      console.error("Error getting next version number:", versionError);
      throw versionError;
    }

    const { error } = await supabase
      .from("resume_versions")
      .insert({
        resume_id: state.resumeId,
        version_number: nextVersion,
        title,
        change_summary: summary,
        snapshot_data: content,
        created_by: (await supabase.auth.getUser()).data.user?.id
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
      visualConfig: content.visualConfig || DEFAULT_VISUAL_CONFIG,
      hasChanges: true
    });
  },
}));
