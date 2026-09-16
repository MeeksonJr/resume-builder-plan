/**
 * ResumeForge Universal Job Application Form-Fill Payload Engine (Phase 49)
 * Maps candidate resume data, work authorization, and custom responses
 * into standardized payloads for Greenhouse, Lever, Workday, Ashby, and browser auto-fillers.
 */

export interface CandidatePreferences {
  workAuthorization?: "citizen" | "permanent_resident" | "work_visa" | "sponsorship_required";
  yearsOfExperience?: number;
  noticePeriodWeeks?: number;
  desiredSalary?: string;
  willingToRelocate?: boolean;
  eeoGender?: string;
  eeoVeteran?: string;
  eeoDisability?: string;
}

export type AtsPlatform = "greenhouse" | "lever" | "workday" | "ashby" | "universal";

export interface GreenhousePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  resume_url: string;
  linkedin_url: string;
  website_url: string;
  github_url: string;
  custom_fields: {
    work_authorization: string;
    salary_expectation: string;
    notice_period: string;
    summary: string;
  };
}

export interface LeverPayload {
  name: string;
  email: string;
  phone: string;
  org: string;
  urls: {
    LinkedIn?: string;
    GitHub?: string;
    Portfolio?: string;
  };
  comments: string;
  cards: Array<{
    title: string;
    fields: Record<string, any>;
  }>;
}

export interface WorkdayPayload {
  personalInfo: {
    legalFirstName: string;
    legalLastName: string;
    preferredName: string;
    email: string;
    phone: string;
    address: {
      cityStateZip: string;
      country: string;
    };
  };
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
  }>;
  complianceAndDisclosures: {
    authorizedInCountry: boolean;
    requiresSponsorship: boolean;
    noticePeriodWeeks: number;
    desiredSalary: string;
  };
}

export interface AshbyPayload {
  name: string;
  email: string;
  phoneNumber: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  applicationAnswers: Record<string, string>;
}

export interface UniversalAtsPayload {
  meta: {
    generatedBy: string;
    version: string;
    exportedAt: string;
    platform: AtsPlatform;
  };
  candidate: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
    urls: {
      portfolio?: string;
      linkedin?: string;
      github?: string;
    };
  };
  workAuthorization: {
    status: string;
    authorizedToWork: boolean;
    requiresSponsorship: boolean;
  };
  experienceHistory: Array<{
    role: string;
    company: string;
    dates: string;
    description: string;
  }>;
  educationHistory: Array<{
    school: string;
    degree: string;
    field: string;
  }>;
  skillsList: string[];
}

/**
 * Splits full name into first and last components.
 */
function splitName(fullName: string): { first: string; last: string } {
  const parts = (fullName || "Candidate").trim().split(/\s+/);
  const first = parts[0] || "Candidate";
  const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return { first, last };
}

/**
 * Transforms ResumeForge profile and store data into the specified ATS payload.
 */
export function generateAtsPayload(
  resumeData: any,
  platform: AtsPlatform = "universal",
  preferences: CandidatePreferences = {}
): any {
  const profile = resumeData?.profile || resumeData?.contact || {};
  const fullName = profile.full_name || profile.name || "Candidate";
  const { first, last } = splitName(fullName);
  const email = profile.email || "";
  const phone = profile.phone || "";
  const location = profile.location || profile.city || "";
  const headline = profile.title || profile.headline || "";
  const summary = profile.summary || profile.bio || "";
  const linkedinUrl = profile.linkedin || "";
  const githubUrl = profile.github || "";
  const websiteUrl = profile.website || profile.portfolio || "";

  const workExp = resumeData?.workExperiences || resumeData?.work_experience || [];
  const education = resumeData?.education || [];
  const skills = resumeData?.skills || [];

  const rawSkillsList: string[] = Array.isArray(skills)
    ? skills.map((s) => (typeof s === "string" ? s : s.name || "")).filter(Boolean)
    : [];

  const requiresSponsorship = preferences.workAuthorization === "sponsorship_required";
  const authorizedToWork = preferences.workAuthorization !== "sponsorship_required";

  if (platform === "greenhouse") {
    const greenhouse: GreenhousePayload = {
      first_name: first,
      last_name: last,
      email,
      phone,
      location,
      resume_url: websiteUrl,
      linkedin_url: linkedinUrl,
      website_url: websiteUrl,
      github_url: githubUrl,
      custom_fields: {
        work_authorization: preferences.workAuthorization || "citizen",
        salary_expectation: preferences.desiredSalary || "Open to market rate",
        notice_period: `${preferences.noticePeriodWeeks || 2} weeks`,
        summary,
      },
    };
    return greenhouse;
  }

  if (platform === "lever") {
    const urls: Record<string, string> = {};
    if (linkedinUrl) urls.LinkedIn = linkedinUrl;
    if (githubUrl) urls.GitHub = githubUrl;
    if (websiteUrl) urls.Portfolio = websiteUrl;

    const lever: LeverPayload = {
      name: fullName,
      email,
      phone,
      org: workExp[0]?.company || "",
      urls,
      comments: summary,
      cards: [
        {
          title: "Work Authorization",
          fields: {
            authorized: authorizedToWork,
            sponsorship: requiresSponsorship,
            status: preferences.workAuthorization || "citizen",
          },
        },
        {
          title: "Skills & Qualifications",
          fields: {
            top_skills: rawSkillsList.slice(0, 10).join(", "),
            years_experience: preferences.yearsOfExperience || 5,
          },
        },
      ],
    };
    return lever;
  }

  if (platform === "workday") {
    const workday: WorkdayPayload = {
      personalInfo: {
        legalFirstName: first,
        legalLastName: last || first,
        preferredName: first,
        email,
        phone,
        address: {
          cityStateZip: location,
          country: "United States",
        },
      },
      experience: workExp.map((exp: any) => ({
        title: exp.role || exp.title || "Software Engineer",
        company: exp.company || "",
        startDate: exp.start_date || "",
        endDate: exp.is_current ? "Present" : exp.end_date || "",
        responsibilities: exp.description || (Array.isArray(exp.highlights) ? exp.highlights.join("; ") : ""),
      })),
      education: education.map((edu: any) => ({
        institution: edu.institution || edu.school || "",
        degree: edu.degree || "",
        fieldOfStudy: edu.field_of_study || edu.field || "",
      })),
      complianceAndDisclosures: {
        authorizedInCountry: authorizedToWork,
        requiresSponsorship,
        noticePeriodWeeks: preferences.noticePeriodWeeks || 2,
        desiredSalary: preferences.desiredSalary || "Market",
      },
    };
    return workday;
  }

  if (platform === "ashby") {
    const ashby: AshbyPayload = {
      name: fullName,
      email,
      phoneNumber: phone,
      linkedInUrl: linkedinUrl,
      githubUrl,
      portfolioUrl: websiteUrl,
      applicationAnswers: {
        "Why are you interested in this role?": summary || "Excited to bring my engineering background to this team.",
        "Work Authorization Status": preferences.workAuthorization || "citizen",
        "Notice Period": `${preferences.noticePeriodWeeks || 2} weeks`,
        "Desired Compensation": preferences.desiredSalary || "Market competitive",
      },
    };
    return ashby;
  }

  // Default Universal Schema
  const universal: UniversalAtsPayload = {
    meta: {
      generatedBy: "ResumeForge AI Autopilot",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      platform: "universal",
    },
    candidate: {
      firstName: first,
      lastName: last,
      fullName,
      email,
      phone,
      location,
      headline,
      summary,
      urls: {
        portfolio: websiteUrl || undefined,
        linkedin: linkedinUrl || undefined,
        github: githubUrl || undefined,
      },
    },
    workAuthorization: {
      status: preferences.workAuthorization || "citizen",
      authorizedToWork,
      requiresSponsorship,
    },
    experienceHistory: workExp.map((exp: any) => ({
      role: exp.role || exp.title || "",
      company: exp.company || "",
      dates: `${exp.start_date || ""} - ${exp.is_current ? "Present" : exp.end_date || ""}`,
      description: exp.description || (Array.isArray(exp.highlights) ? exp.highlights.join(". ") : ""),
    })),
    educationHistory: education.map((edu: any) => ({
      school: edu.institution || edu.school || "",
      degree: edu.degree || "",
      field: edu.field_of_study || edu.field || "",
    })),
    skillsList: rawSkillsList,
  };

  return universal;
}

/**
 * Downloads payload as formatted JSON in browser.
 */
export function downloadJsonPayload(payload: any, filename = "job_application_payload.json"): boolean {
  if (typeof window === "undefined") return false;
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to download JSON payload:", err);
    return false;
  }
}
