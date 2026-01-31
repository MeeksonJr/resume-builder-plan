import { saveAs } from "file-saver";

interface ResumeData {
    profile: any;
    workExperiences: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
    sectionOrder: string[];
}

export function exportToTxt(data: ResumeData) {
    const { profile, workExperiences, education, skills, projects, certifications, languages, sectionOrder } = data;

    const stripHtml = (html: string) => {
        if (!html) return "";
        return html
            .replace(/<p>/g, "")
            .replace(/<\/p>/g, "\n")
            .replace(/<li>/g, "• ")
            .replace(/<\/li>/g, "\n")
            .replace(/<br\s*\/?>/g, "\n")
            .replace(/<[^>]*>?/gm, "")
            .trim();
    };

    let txt = "";

    // Header
    txt += `${(profile.full_name || "Untitled Resume").toUpperCase()}\n`;
    txt += `${profile.location || ""} | ${profile.phone || ""} | ${profile.email || ""}\n`;

    const links = [];
    if (profile.linkedin_url) links.push(`LinkedIn: ${profile.linkedin_url}`);
    if (profile.github_url) links.push(`GitHub: ${profile.github_url}`);
    if (profile.website_url) links.push(`Portfolio: ${profile.website_url}`);
    if (links.length > 0) txt += `${links.join(" | ")}\n`;

    txt += "\n" + "=".repeat(40) + "\n\n";

    // Summary
    if (profile.summary) {
        txt += "PROFESSIONAL SUMMARY\n";
        txt += "-".repeat(20) + "\n";
        txt += stripHtml(profile.summary) + "\n\n";
    }

    // Dynamic Sections
    for (const sectionId of sectionOrder) {
        switch (sectionId) {
            case "experience":
                if (workExperiences.length > 0) {
                    txt += "EXPERIENCE\n";
                    txt += "-".repeat(10) + "\n";
                    workExperiences.forEach(exp => {
                        txt += `${exp.position.toUpperCase()} | ${exp.company}\n`;
                        txt += `${exp.start_date} - ${exp.is_current ? "Present" : exp.end_date} | ${exp.location || ""}\n`;
                        if (exp.description) {
                            txt += stripHtml(exp.description) + "\n";
                        }
                        if (exp.highlights && exp.highlights.length > 0) {
                            exp.highlights.forEach((h: string) => txt += `• ${h}\n`);
                        }
                        txt += "\n";
                    });
                }
                break;

            case "education":
                if (education.length > 0) {
                    txt += "EDUCATION\n";
                    txt += "-".repeat(10) + "\n";
                    education.forEach(edu => {
                        txt += `${edu.institution.toUpperCase()}\n`;
                        txt += `${edu.degree} in ${edu.field_of_study}\n`;
                        txt += `${edu.start_date} - ${edu.end_date} | ${edu.location || ""}\n`;
                        if (edu.gpa) txt += `GPA: ${edu.gpa}\n`;
                        if (edu.highlights && edu.highlights.length > 0) {
                            edu.highlights.forEach((h: string) => txt += `• ${stripHtml(h)}\n`);
                        }
                        txt += "\n";
                    });
                }
                break;

            case "skills":
                if (skills.length > 0) {
                    txt += "SKILLS\n";
                    txt += "-".repeat(6) + "\n";
                    const categorized = skills.reduce((acc: any, skill) => {
                        const cat = skill.category || "General";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(skill.name);
                        return acc;
                    }, {});

                    Object.entries(categorized).forEach(([cat, names]: [string, any]) => {
                        txt += `${cat}: ${names.join(", ")}\n`;
                    });
                    txt += "\n";
                }
                break;

            case "projects":
                if (projects.length > 0) {
                    txt += "PROJECTS\n";
                    txt += "-".repeat(8) + "\n";
                    projects.forEach(proj => {
                        txt += `${proj.name.toUpperCase()}\n`;
                        if (proj.url) txt += `${proj.url}\n`;
                        if (proj.technologies && proj.technologies.length > 0) {
                            txt += `Technologies: ${proj.technologies.join(", ")}\n`;
                        }
                        if (proj.description) {
                            txt += stripHtml(proj.description) + "\n";
                        }
                        if (proj.highlights && proj.highlights.length > 0) {
                            proj.highlights.forEach((h: string) => txt += `• ${h}\n`);
                        }
                        txt += "\n";
                    });
                }
                break;

            case "certifications":
                if (certifications.length > 0) {
                    txt += "CERTIFICATIONS\n";
                    txt += "-".repeat(14) + "\n";
                    certifications.forEach(cert => {
                        txt += `${cert.name} | ${cert.issuer || ""}\n`;
                        txt += `${cert.issue_date || ""}\n\n`;
                    });
                }
                break;

            case "languages":
                if (languages.length > 0) {
                    txt += "LANGUAGES\n";
                    txt += "-".repeat(9) + "\n";
                    txt += languages.map(l => `${l.language} (${l.proficiency})`).join(" • ") + "\n\n";
                }
                break;
        }
    }

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const fileName = `${profile.full_name?.replace(/\s+/g, "_") || "Resume"}.txt`;
    saveAs(blob, fileName);
}
