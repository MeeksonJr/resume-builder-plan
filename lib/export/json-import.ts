export interface ParsedResumeData {
  title?: string;
  profile: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url: string;
    github_url: string;
    website_url: string;
    summary: string;
  };
  workExperiences: Array<{
    company: string;
    position: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current: boolean;
    description: string;
    highlights: string[];
    display_order: number;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
    highlights: string[];
    display_order: number;
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency_level: number;
    display_order: number;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    highlights: string[];
    display_order: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issue_date?: string;
    credential_url?: string;
    display_order: number;
  }>;
  languages: Array<{
    name: string;
    proficiency: string;
    display_order: number;
  }>;
}

export function parseJSONResume(input: string | Record<string, any>): {
  success: boolean;
  data?: ParsedResumeData;
  error?: string;
  summary?: {
    hasProfile: boolean;
    workCount: number;
    educationCount: number;
    skillCount: number;
    projectCount: number;
    certificationCount: number;
    languageCount: number;
  };
} {
  try {
    let raw: Record<string, any>;
    if (typeof input === "string") {
      raw = JSON.parse(input);
    } else {
      raw = input;
    }

    if (!raw || typeof raw !== "object") {
      return { success: false, error: "Invalid JSON structure. Expected an object." };
    }

    // Support both standard JSON Resume schema and direct ResumeForge export schema
    const basics = raw.basics || raw.profile || {};
    const workList = Array.isArray(raw.work) ? raw.work : Array.isArray(raw.workExperiences) ? raw.workExperiences : [];
    const eduList = Array.isArray(raw.education) ? raw.education : [];
    const skillList = Array.isArray(raw.skills) ? raw.skills : [];
    const projectList = Array.isArray(raw.projects) ? raw.projects : [];
    const certList = Array.isArray(raw.certificates) ? raw.certificates : Array.isArray(raw.certifications) ? raw.certifications : [];
    const langList = Array.isArray(raw.languages) ? raw.languages : [];

    // Parse Profiles / Links
    let linkedinUrl = basics.linkedin_url || "";
    let githubUrl = basics.github_url || "";
    let websiteUrl = basics.website_url || basics.url || "";

    if (Array.isArray(basics.profiles)) {
      for (const p of basics.profiles) {
        const net = (p.network || "").toLowerCase();
        const url = p.url || "";
        if (net.includes("linkedin") || url.includes("linkedin.com")) {
          linkedinUrl = url;
        } else if (net.includes("github") || url.includes("github.com")) {
          githubUrl = url;
        } else if (!websiteUrl && url) {
          websiteUrl = url;
        }
      }
    }

    // Parse Location
    let locationStr = "";
    if (typeof basics.location === "string") {
      locationStr = basics.location;
    } else if (basics.location && typeof basics.location === "object") {
      const parts = [
        basics.location.address,
        basics.location.city,
        basics.location.region,
        basics.location.countryCode,
      ].filter(Boolean);
      locationStr = parts.join(", ");
    }

    const profile = {
      full_name: basics.name || basics.full_name || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location: locationStr,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      website_url: websiteUrl,
      summary: basics.summary || basics.label || "",
    };

    // Parse Work Experience
    const workExperiences = workList.map((w: any, index: number) => {
      const isCurrent = w.endDate === "Present" || w.is_current === true || !w.endDate;
      return {
        company: w.name || w.company || "",
        position: w.position || "",
        location: w.location || "",
        start_date: w.startDate || w.start_date || "",
        end_date: isCurrent ? "" : (w.endDate || w.end_date || ""),
        is_current: isCurrent,
        description: w.summary || w.description || "",
        highlights: Array.isArray(w.highlights) ? w.highlights : [],
        display_order: index,
      };
    });

    // Parse Education
    const education = eduList.map((e: any, index: number) => ({
      institution: e.institution || "",
      degree: e.studyType || e.degree || "",
      field_of_study: e.area || e.field_of_study || "",
      start_date: e.startDate || e.start_date || "",
      end_date: e.endDate || e.end_date || "",
      gpa: e.score || e.gpa || "",
      highlights: Array.isArray(e.courses) ? e.courses : Array.isArray(e.highlights) ? e.highlights : [],
      display_order: index,
    }));

    // Parse Skills
    const skills = skillList.map((s: any, index: number) => {
      let level = 3;
      if (typeof s.level === "string") {
        const parsed = parseInt(s.level, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
          level = parsed;
        }
      } else if (typeof s.proficiency_level === "number") {
        level = s.proficiency_level;
      }

      return {
        name: s.name || (typeof s === "string" ? s : ""),
        category: s.category || "Technical Skills",
        proficiency_level: level,
        display_order: index,
      };
    }).filter((s) => s.name.trim().length > 0);

    // Parse Projects
    const projects = projectList.map((p: any, index: number) => ({
      name: p.name || "",
      description: p.description || "",
      technologies: Array.isArray(p.keywords) ? p.keywords : Array.isArray(p.technologies) ? p.technologies : [],
      url: p.url || "",
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      display_order: index,
    }));

    // Parse Certifications
    const certifications = certList.map((c: any, index: number) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      issue_date: c.date || c.issue_date || "",
      credential_url: c.url || c.credential_url || "",
      display_order: index,
    }));

    // Parse Languages
    const languages = langList.map((l: any, index: number) => ({
      name: l.language || l.name || "",
      proficiency: l.fluency || l.proficiency || "Professional working",
      display_order: index,
    }));

    const parsedData: ParsedResumeData = {
      title: raw.title || profile.full_name ? `${profile.full_name}'s Resume` : "Imported Resume",
      profile,
      workExperiences,
      education,
      skills,
      projects,
      certifications,
      languages,
    };

    return {
      success: true,
      data: parsedData,
      summary: {
        hasProfile: Boolean(profile.full_name || profile.email),
        workCount: workExperiences.length,
        educationCount: education.length,
        skillCount: skills.length,
        projectCount: projects.length,
        certificationCount: certifications.length,
        languageCount: languages.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to parse JSON Resume: ${err.message || "Invalid JSON"}`,
    };
  }
}
