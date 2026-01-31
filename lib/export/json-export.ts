import { saveAs } from "file-saver";

interface ResumeData {
    profile: any;
    workExperiences: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
}

export function exportToJSON(data: ResumeData) {
    const { profile, workExperiences, education, skills, projects, certifications, languages } = data;

    // Map to a structure inspired by JSON Resume (https://jsonresume.org/schema/)
    const jsonResume = {
        basics: {
            name: profile.full_name,
            label: profile.summary?.substring(0, 100).replace(/<[^>]*>?/gm, ''), // Simple text summary
            email: profile.email,
            phone: profile.phone,
            url: profile.website_url,
            summary: profile.summary?.replace(/<[^>]*>?/gm, ''), // Stripped HTML
            location: {
                address: profile.location,
            },
            profiles: [
                {
                    network: "LinkedIn",
                    url: profile.linkedin_url,
                },
                {
                    network: "GitHub",
                    url: profile.github_url,
                },
            ].filter(p => p.url),
        },
        work: workExperiences.map(exp => ({
            name: exp.company,
            position: exp.position,
            location: exp.location,
            startDate: exp.start_date,
            endDate: exp.is_current ? "Present" : exp.end_date,
            summary: exp.description?.replace(/<[^>]*>?/gm, ''),
            highlights: exp.highlights || [],
        })),
        education: education.map(edu => ({
            institution: edu.institution,
            area: edu.field_of_study,
            studyType: edu.degree,
            startDate: edu.start_date,
            endDate: edu.end_date,
            score: edu.gpa,
            courses: edu.highlights || [],
        })),
        skills: skills.map(skill => ({
            name: skill.name,
            level: skill.proficiency_level ? `${skill.proficiency_level}/5` : undefined,
            category: skill.category,
        })),
        projects: projects.map(proj => ({
            name: proj.name,
            description: proj.description?.replace(/<[^>]*>?/gm, ''),
            url: proj.url,
            keywords: proj.technologies || [],
            highlights: proj.highlights || [],
        })),
        languages: languages.map(lang => ({
            language: lang.language,
            fluency: lang.proficiency,
        })),
        certifications: certifications.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.issue_date,
        })),
    };

    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: "application/json" });
    const fileName = `${profile.full_name?.replace(/\s+/g, "_") || "Resume"}.json`;
    saveAs(blob, fileName);
}
