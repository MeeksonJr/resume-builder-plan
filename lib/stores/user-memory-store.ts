import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UserMemory,
  DEFAULT_USER_MEMORY,
  MemoryBasics,
  MemorySocials,
  MemoryExperience,
  MemoryEducation,
  MemorySkill,
  MemoryProject,
  MemoryCertification,
  MemoryPreferences,
  calculateMemoryCompleteness,
} from "@/lib/types/user-memory";

interface UserMemoryStore {
  memory: UserMemory;
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: string | null;

  // Actions
  setMemory: (memory: UserMemory) => void;
  updateBasics: (basics: Partial<MemoryBasics>) => void;
  updateSocials: (socials: Partial<MemorySocials>) => void;
  updatePreferences: (preferences: Partial<MemoryPreferences>) => void;

  // Experience CRUD
  addExperience: (experience: Omit<MemoryExperience, "id">) => void;
  updateExperience: (id: string, experience: Partial<MemoryExperience>) => void;
  deleteExperience: (id: string) => void;

  // Education CRUD
  addEducation: (education: Omit<MemoryEducation, "id">) => void;
  updateEducation: (id: string, education: Partial<MemoryEducation>) => void;
  deleteEducation: (id: string) => void;

  // Skills CRUD
  addSkill: (skill: Omit<MemorySkill, "id">) => void;
  updateSkill: (id: string, skill: Partial<MemorySkill>) => void;
  deleteSkill: (id: string) => void;

  // Projects CRUD
  addProject: (project: Omit<MemoryProject, "id">) => void;
  updateProject: (id: string, project: Partial<MemoryProject>) => void;
  deleteProject: (id: string) => void;

  // Certifications CRUD
  addCertification: (cert: Omit<MemoryCertification, "id">) => void;
  updateCertification: (id: string, cert: Partial<MemoryCertification>) => void;
  deleteCertification: (id: string) => void;

  // Bulk Ingestion & Utilities
  importFromResumeData: (resumeData: any, sourceLabel?: string) => void;
  importFromJson: (jsonData: any) => void;
  loadSampleMemory: () => void;
  clearMemory: () => void;
  fetchFromServer: () => Promise<void>;
  saveToServer: () => Promise<void>;
}

export const useUserMemoryStore = create<UserMemoryStore>()(
  persist(
    (set, get) => ({
      memory: DEFAULT_USER_MEMORY,
      isLoading: false,
      isSaving: false,
      lastSyncedAt: null,

      setMemory: (memory) => {
        set({
          memory: {
            ...memory,
            last_updated: new Date().toISOString(),
          },
        });
        get().saveToServer();
      },

      updateBasics: (basics) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            basics: {
              ...state.memory.basics,
              ...basics,
            },
          },
        }));
        get().saveToServer();
      },

      updateSocials: (socials) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            socials: {
              ...state.memory.socials,
              ...socials,
            },
          },
        }));
        get().saveToServer();
      },

      updatePreferences: (preferences) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            preferences: {
              ...state.memory.preferences,
              ...preferences,
            },
          },
        }));
        get().saveToServer();
      },

      addExperience: (exp) => {
        const newExp: MemoryExperience = {
          ...exp,
          id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            experiences: [newExp, ...state.memory.experiences],
          },
        }));
        get().saveToServer();
      },

      updateExperience: (id, exp) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            experiences: state.memory.experiences.map((item) =>
              item.id === id ? { ...item, ...exp } : item
            ),
          },
        }));
        get().saveToServer();
      },

      deleteExperience: (id) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            experiences: state.memory.experiences.filter((item) => item.id !== id),
          },
        }));
        get().saveToServer();
      },

      addEducation: (edu) => {
        const newEdu: MemoryEducation = {
          ...edu,
          id: `edu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            education: [newEdu, ...state.memory.education],
          },
        }));
        get().saveToServer();
      },

      updateEducation: (id, edu) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            education: state.memory.education.map((item) =>
              item.id === id ? { ...item, ...edu } : item
            ),
          },
        }));
        get().saveToServer();
      },

      deleteEducation: (id) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            education: state.memory.education.filter((item) => item.id !== id),
          },
        }));
        get().saveToServer();
      },

      addSkill: (skill) => {
        const newSkill: MemorySkill = {
          ...skill,
          id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            skills: [...state.memory.skills, newSkill],
          },
        }));
        get().saveToServer();
      },

      updateSkill: (id, skill) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            skills: state.memory.skills.map((item) =>
              item.id === id ? { ...item, ...skill } : item
            ),
          },
        }));
        get().saveToServer();
      },

      deleteSkill: (id) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            skills: state.memory.skills.filter((item) => item.id !== id),
          },
        }));
        get().saveToServer();
      },

      addProject: (proj) => {
        const newProj: MemoryProject = {
          ...proj,
          id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            projects: [newProj, ...state.memory.projects],
          },
        }));
        get().saveToServer();
      },

      updateProject: (id, proj) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            projects: state.memory.projects.map((item) =>
              item.id === id ? { ...item, ...proj } : item
            ),
          },
        }));
        get().saveToServer();
      },

      deleteProject: (id) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            projects: state.memory.projects.filter((item) => item.id !== id),
          },
        }));
        get().saveToServer();
      },

      addCertification: (cert) => {
        const newCert: MemoryCertification = {
          ...cert,
          id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            certifications: [newCert, ...state.memory.certifications],
          },
        }));
        get().saveToServer();
      },

      updateCertification: (id, cert) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            certifications: state.memory.certifications.map((item) =>
              item.id === id ? { ...item, ...cert } : item
            ),
          },
        }));
        get().saveToServer();
      },

      deleteCertification: (id) => {
        set((state) => ({
          memory: {
            ...state.memory,
            last_updated: new Date().toISOString(),
            certifications: state.memory.certifications.filter((item) => item.id !== id),
          },
        }));
        get().saveToServer();
      },

      importFromResumeData: (data: any, sourceLabel = "Resume Import") => {
        if (!data) return;
        set((state) => {
          const current = state.memory;
          const contact = data.contact || data.profile || data.personalInfo || {};
          const workList = data.work_experiences || data.workExperiences || data.experience || [];
          const eduList = data.education || data.educations || [];
          const skillList = data.skills || [];
          const projectList = data.projects || [];
          const certList = data.certifications || [];

          // Clean HTML from text if any
          const clean = (str?: string) =>
            str ? str.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() : "";

          // Parse new experiences
          const mappedExperiences: MemoryExperience[] = workList.map((w: any, idx: number) => ({
            id: `exp_${Date.now()}_${idx}`,
            company: clean(w.company || w.organization || "Company"),
            position: clean(w.position || w.role || w.title || "Role"),
            location: clean(w.location || ""),
            start_date: w.start_date || w.startDate || "",
            end_date: w.end_date || w.endDate || (w.is_current ? "Present" : ""),
            is_current: !!w.is_current,
            description: clean(w.description || ""),
            highlights: Array.isArray(w.highlights)
              ? w.highlights.map(clean)
              : typeof w.description === "string" && w.description.includes("\n")
              ? w.description.split("\n").map(clean).filter(Boolean)
              : [],
          }));

          // Parse new education
          const mappedEducation: MemoryEducation[] = eduList.map((e: any, idx: number) => ({
            id: `edu_${Date.now()}_${idx}`,
            institution: clean(e.institution || e.school || "University"),
            degree: clean(e.degree || "Degree"),
            field_of_study: clean(e.field_of_study || e.fieldOfStudy || e.major || ""),
            location: clean(e.location || ""),
            start_date: e.start_date || e.startDate || "",
            end_date: e.end_date || e.endDate || "",
            gpa: e.gpa || "",
            honors: clean(e.honors || ""),
            highlights: Array.isArray(e.highlights) ? e.highlights.map(clean) : [],
          }));

          // Parse skills (handles both flat array and grouped skill objects)
          const mappedSkills: MemorySkill[] = skillList.flatMap((s: any, idx: number) => {
            if (Array.isArray(s.skills)) {
              return s.skills.map((subSkill: string, subIdx: number) => ({
                id: `sk_${Date.now()}_${idx}_${subIdx}`,
                name: clean(subSkill),
                category: s.category || "Languages",
                proficiency: 4,
              })).filter((sk: any) => Boolean(sk.name));
            }
            const skillName = typeof s === "string" ? clean(s) : clean(s.name);
            if (!skillName) return [];
            const category = typeof s === "object" && s.category ? s.category : "Languages";
            return [{
              id: `sk_${Date.now()}_${idx}`,
              name: skillName,
              category: (category as any) || "Languages",
              proficiency: typeof s === "object" && s.proficiency_level ? s.proficiency_level : 4,
            }];
          });

          // Parse projects
          const mappedProjects: MemoryProject[] = projectList.map((p: any, idx: number) => ({
            id: `proj_${Date.now()}_${idx}`,
            name: clean(p.name || p.title || "Project"),
            description: clean(p.description || ""),
            technologies: Array.isArray(p.technologies)
              ? p.technologies
              : Array.isArray(p.tags)
              ? p.tags
              : [],
            url: p.url || p.link || "",
            github_url: p.github_url || p.github || "",
            highlights: Array.isArray(p.highlights) ? p.highlights.map(clean) : [],
          }));

          // Parse certifications
          const mappedCerts: MemoryCertification[] = certList.map((c: any, idx: number) => ({
            id: `cert_${Date.now()}_${idx}`,
            name: clean(c.name || "Certification"),
            issuer: clean(c.issuer || ""),
            issue_date: c.issue_date || c.issueDate || "",
            expiry_date: c.expiry_date || c.expiryDate || "",
            credential_id: c.credential_id || c.credentialId || "",
            credential_url: c.credential_url || c.credentialUrl || "",
          }));

          const updatedSources = Array.from(
            new Set([...(current.sources || []), sourceLabel])
          );

          return {
            memory: {
              ...current,
              last_updated: new Date().toISOString(),
              sources: updatedSources,
              basics: {
                full_name: clean(contact.full_name || contact.name || current.basics.full_name),
                headline: clean(contact.headline || contact.title || contact.label || contact.position || current.basics.headline),
                email: clean(contact.email || current.basics.email),
                phone: clean(contact.phone || current.basics.phone),
                location: clean(contact.location || current.basics.location),
                bio: clean(contact.bio || contact.summary || current.basics.bio),
                avatar_url: contact.avatar_url || current.basics.avatar_url,
              },
              socials: {
                ...current.socials,
                linkedin: contact.linkedin_url || contact.linkedin || current.socials.linkedin,
                github: contact.github_url || contact.github || current.socials.github,
                portfolio: contact.website_url || contact.website || contact.url || current.socials.portfolio,
              },
              experiences: mappedExperiences.length > 0 ? mappedExperiences : current.experiences,
              education: mappedEducation.length > 0 ? mappedEducation : current.education,
              skills: mappedSkills.length > 0 ? mappedSkills : current.skills,
              projects: mappedProjects.length > 0 ? mappedProjects : current.projects,
              certifications: mappedCerts.length > 0 ? mappedCerts : current.certifications,
            },
          };
        });
        get().saveToServer();
      },

      importFromJson: (jsonData: any) => {
        if (!jsonData) return;
        set({
          memory: {
            ...jsonData,
            version: jsonData.version || 1,
            last_updated: new Date().toISOString(),
            sources: Array.from(new Set([...(jsonData.sources || []), "JSON Import"])),
          },
        });
        get().saveToServer();
      },

      loadSampleMemory: () => {
        set({
          memory: {
            ...DEFAULT_USER_MEMORY,
            last_updated: new Date().toISOString(),
            sources: ["Demo Sample Profile"],
          },
        });
        get().saveToServer();
      },

      clearMemory: () => {
        const emptyMemory: UserMemory = {
          version: 1,
          last_updated: new Date().toISOString(),
          sources: ["Cleared"],
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
        set({ memory: emptyMemory });
        get().saveToServer();
      },

      fetchFromServer: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/user-memory");
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.memory) {
            set({
              memory: data.memory,
              lastSyncedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn("[UserMemoryStore] Failed to fetch memory from server:", e);
        } finally {
          set({ isLoading: false });
        }
      },

      saveToServer: async () => {
        set({ isSaving: true });
        try {
          const memory = get().memory;
          await fetch("/api/user-memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memory }),
          });
          set({ lastSyncedAt: new Date().toISOString() });
        } catch (e) {
          console.warn("[UserMemoryStore] Failed to save memory to server:", e);
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: "resumeforge_user_memory_v1",
      partialize: (state) => ({ memory: state.memory, lastSyncedAt: state.lastSyncedAt }),
    }
  )
);
