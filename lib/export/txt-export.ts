import { saveAs } from "file-saver";

export interface ResumeExportData {
  profile: any;
  workExperiences: any[];
  education: any[];
  skills: any[];
  projects: any[];
  certifications: any[];
  languages: any[];
  sectionOrder?: string[];
}

/**
 * Strips HTML formatting and normalizes spacing and line breaks
 */
export function stripHtmlForATS(html: string): string {
  if (!html) return "";
  return html
    .replace(/<p\s*[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li\s*[^>]*>/gi, "* ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Generates an ATS-optimized, plain-text resume string with standard ASCII dividers
 */
export function generateResumePlainText(data: ResumeExportData): string {
  const {
    profile = {},
    workExperiences = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    sectionOrder = ["experience", "education", "skills", "projects", "certifications", "languages"],
  } = data;

  let txt = "";

  // 1. Header & Contact Information
  const fullName = (profile.full_name || "RESUME").toUpperCase();
  txt += `${fullName}\n`;
  txt += "=".repeat(Math.max(fullName.length, 48)) + "\n";

  const contactPieces = [];
  if (profile.location) contactPieces.push(profile.location);
  if (profile.phone) contactPieces.push(profile.phone);
  if (profile.email) contactPieces.push(profile.email);
  if (contactPieces.length > 0) txt += `${contactPieces.join(" | ")}\n`;

  const webLinks = [];
  if (profile.linkedin_url) webLinks.push(`LinkedIn: ${profile.linkedin_url}`);
  if (profile.github_url) webLinks.push(`GitHub: ${profile.github_url}`);
  if (profile.website_url) webLinks.push(`Portfolio: ${profile.website_url}`);
  if (webLinks.length > 0) txt += `${webLinks.join(" | ")}\n`;

  txt += "\n";

  // 2. Professional Summary
  if (profile.summary) {
    txt += "PROFESSIONAL SUMMARY\n";
    txt += "-".repeat(32) + "\n";
    txt += `${stripHtmlForATS(profile.summary)}\n\n`;
  }

  // 3. Dynamic Sections
  for (const sectionId of sectionOrder) {
    switch (sectionId) {
      case "experience":
        if (workExperiences.length > 0) {
          txt += "WORK EXPERIENCE\n";
          txt += "-".repeat(32) + "\n";
          workExperiences.forEach((exp) => {
            const pos = (exp.position || "Position").toUpperCase();
            const comp = exp.company || "Company";
            const dateRange = `${exp.start_date || ""} - ${exp.is_current ? "Present" : exp.end_date || ""}`;
            const loc = exp.location ? ` | ${exp.location}` : "";

            txt += `${pos} | ${comp}\n`;
            txt += `${dateRange}${loc}\n`;

            if (exp.description) {
              const cleanDesc = stripHtmlForATS(exp.description);
              // Ensure bullet prefix if lines don't already have one
              const bulleted = cleanDesc
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (line.startsWith("*") || line.startsWith("-") || line.startsWith("•") ? `* ${line.replace(/^[*•\-]\s*/, "")}` : `* ${line}`))
                .join("\n");
              txt += `${bulleted}\n`;
            }

            if (Array.isArray(exp.highlights) && exp.highlights.length > 0) {
              exp.highlights.forEach((h: string) => {
                txt += `* ${stripHtmlForATS(h)}\n`;
              });
            }
            txt += "\n";
          });
        }
        break;

      case "education":
        if (education.length > 0) {
          txt += "EDUCATION\n";
          txt += "-".repeat(32) + "\n";
          education.forEach((edu) => {
            txt += `${(edu.institution || "Institution").toUpperCase()}\n`;
            const degreeLine = [edu.degree, edu.field_of_study ? `in ${edu.field_of_study}` : ""].filter(Boolean).join(" ");
            if (degreeLine) txt += `${degreeLine}\n`;

            const eduDateRange = `${edu.start_date || ""} - ${edu.end_date || ""}`;
            const eduLoc = edu.location ? ` | ${edu.location}` : "";
            txt += `${eduDateRange}${eduLoc}\n`;

            if (edu.gpa) txt += `GPA: ${edu.gpa}\n`;

            const achievements = edu.achievements || edu.highlights || [];
            if (Array.isArray(achievements) && achievements.length > 0) {
              achievements.forEach((ach: string) => {
                txt += `* ${stripHtmlForATS(ach)}\n`;
              });
            }
            txt += "\n";
          });
        }
        break;

      case "skills":
        if (skills.length > 0) {
          txt += "TECHNICAL & PROFESSIONAL SKILLS\n";
          txt += "-".repeat(32) + "\n";
          const categorized = skills.reduce((acc: Record<string, string[]>, skill) => {
            const cat = skill.category || "General";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(skill.name);
            return acc;
          }, {});

          Object.entries(categorized).forEach(([cat, names]) => {
            txt += `${cat}: ${names.join(", ")}\n`;
          });
          txt += "\n";
        }
        break;

      case "projects":
        if (projects.length > 0) {
          txt += "PROJECTS & CAPSTONES\n";
          txt += "-".repeat(32) + "\n";
          projects.forEach((proj) => {
            txt += `${(proj.name || "Project").toUpperCase()}\n`;
            if (proj.url) txt += `Link: ${proj.url}\n`;
            if (proj.technologies && proj.technologies.length > 0) {
              const techList = Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies;
              txt += `Technologies: ${techList}\n`;
            }
            if (proj.description) {
              const cleanDesc = stripHtmlForATS(proj.description);
              const bulleted = cleanDesc
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
                .map((l) => (l.startsWith("*") || l.startsWith("-") || l.startsWith("•") ? `* ${l.replace(/^[*•\-]\s*/, "")}` : `* ${l}`))
                .join("\n");
              txt += `${bulleted}\n`;
            }
            if (Array.isArray(proj.highlights) && proj.highlights.length > 0) {
              proj.highlights.forEach((h: string) => {
                txt += `* ${stripHtmlForATS(h)}\n`;
              });
            }
            txt += "\n";
          });
        }
        break;

      case "certifications":
        if (certifications.length > 0) {
          txt += "CERTIFICATIONS & CREDENTIALS\n";
          txt += "-".repeat(32) + "\n";
          certifications.forEach((cert) => {
            const issuer = cert.issuer ? ` | ${cert.issuer}` : "";
            const date = cert.issue_date || cert.date ? ` (${cert.issue_date || cert.date})` : "";
            txt += `* ${cert.name}${issuer}${date}\n`;
          });
          txt += "\n";
        }
        break;

      case "languages":
        if (languages.length > 0) {
          txt += "LANGUAGES\n";
          txt += "-".repeat(32) + "\n";
          txt += languages.map((l) => `${l.language} (${l.proficiency || "Proficient"})`).join(" • ") + "\n\n";
        }
        break;
    }
  }

  return txt.trim() + "\n";
}

/**
 * Downloads plain text file
 */
export function exportToTxt(data: ResumeExportData) {
  const txt = generateResumePlainText(data);
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const fileName = `${data.profile?.full_name?.replace(/\s+/g, "_") || "Resume"}_ATS.txt`;
  saveAs(blob, fileName);
}
