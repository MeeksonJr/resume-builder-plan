import { saveAs } from "file-saver";

export interface JsonResumeData {
  profile: any;
  workExperiences: any[];
  education: any[];
  skills: any[];
  projects: any[];
  certifications: any[];
  languages: any[];
}

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Builds an official JSON Resume compliant object (v1.0.0)
 * Reference: https://jsonresume.org/schema/
 */
export function generateJSONResume(data: JsonResumeData): Record<string, any> {
  const {
    profile = {},
    workExperiences = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
  } = data;

  const profiles: Array<{ network: string; username?: string; url: string }> = [];
  if (profile.linkedin_url) {
    profiles.push({ network: "LinkedIn", url: profile.linkedin_url });
  }
  if (profile.github_url) {
    profiles.push({ network: "GitHub", url: profile.github_url });
  }

  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: profile.full_name || "Candidate",
      label: profile.target_role || profile.summary?.slice(0, 80) || "Professional",
      email: profile.email || undefined,
      phone: profile.phone || undefined,
      url: profile.website_url || undefined,
      summary: stripHtml(profile.summary) || undefined,
      location: profile.location
        ? {
            address: profile.location,
            city: profile.location.split(",")[0]?.trim(),
          }
        : undefined,
      profiles: profiles.length > 0 ? profiles : undefined,
    },
    work: workExperiences.map((exp) => ({
      name: exp.company || "Company",
      position: exp.position || "Position",
      location: exp.location || undefined,
      startDate: exp.start_date || undefined,
      endDate: exp.is_current ? "Present" : exp.end_date || undefined,
      summary: stripHtml(exp.description) || undefined,
      highlights: Array.isArray(exp.highlights)
        ? exp.highlights.map((h: string) => stripHtml(h)).filter(Boolean)
        : [],
    })),
    education: education.map((edu) => ({
      institution: edu.institution || "Institution",
      area: edu.field_of_study || undefined,
      studyType: edu.degree || undefined,
      startDate: edu.start_date || undefined,
      endDate: edu.end_date || undefined,
      score: edu.gpa || undefined,
      courses: Array.isArray(edu.achievements || edu.highlights)
        ? (edu.achievements || edu.highlights).map((c: string) => stripHtml(c)).filter(Boolean)
        : [],
    })),
    skills: skills.map((skill) => ({
      name: skill.name,
      level: skill.proficiency_level ? `${skill.proficiency_level}/5` : undefined,
      keywords: skill.category ? [skill.category] : [],
    })),
    projects: projects.map((proj) => ({
      name: proj.name || "Project",
      description: stripHtml(proj.description) || undefined,
      url: proj.url || undefined,
      keywords: Array.isArray(proj.technologies) ? proj.technologies : [],
      highlights: Array.isArray(proj.highlights)
        ? proj.highlights.map((h: string) => stripHtml(h)).filter(Boolean)
        : [],
    })),
    certificates: certifications.map((cert) => ({
      name: cert.name,
      date: cert.issue_date || cert.date || undefined,
      issuer: cert.issuer || undefined,
      url: cert.url || undefined,
    })),
    languages: languages.map((lang) => ({
      language: lang.language,
      fluency: lang.proficiency || undefined,
    })),
  };
}

/**
 * Exports and downloads JSON Resume file
 */
export function exportToJSON(data: JsonResumeData) {
  const jsonResume = generateJSONResume(data);
  const blob = new Blob([JSON.stringify(jsonResume, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const fileName = `${data.profile?.full_name?.replace(/\s+/g, "_") || "Resume"}.json`;
  saveAs(blob, fileName);
}
