import React from "react";
import { useResumeStore } from "@/lib/stores/resume-store";

interface TemplateProps {
    data?: {
        profile: any;
        resume?: any;
        workExperiences: any[];
        education: any[];
        skills: any[];
        projects: any[];
        certifications: any[];
        languages: any[];
    };
}

export const ClassicTemplate = ({ data }: TemplateProps) => {
    const store = useResumeStore();

    const {
        profile,
        workExperiences,
        education,
        skills,
        projects,
        certifications,
        languages,
    } = data || store;

    const sectionOrder = data?.resume?.section_order || store.sectionOrder;

    if (!profile) return null;

    const renderSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience" className="mb-6">
                        <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-3 uppercase">Experience</h2>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between font-bold">
                                        <span>{exp.company}</span>
                                        <span>{exp.location}</span>
                                    </div>
                                    <div className="flex justify-between italic mb-2">
                                        <span>{exp.position}</span>
                                        <span>{exp.start_date} – {exp.is_current ? "Present" : exp.end_date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "education":
                return education.length > 0 && (
                    <section key="education" className="mb-6">
                        <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-3 uppercase">Education</h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between font-bold">
                                        <span>{edu.institution}</span>
                                        <span>{edu.location}</span>
                                    </div>
                                    <div className="flex justify-between italic">
                                        <span>{edu.degree} in {edu.field_of_study}</span>
                                        <span>{edu.start_date} – {edu.end_date}</span>
                                    </div>
                                    {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects" className="mb-6">
                        <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-3 uppercase">Projects</h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between font-bold mb-1">
                                        <span>{proj.name}</span>
                                        {proj.url && <span className="text-xs font-normal underline">{proj.url}</span>}
                                    </div>
                                    {proj.technologies.length > 0 && (
                                        <p className="text-xs italic text-gray-600 mb-1">
                                            Technologies: {proj.technologies.join(", ")}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {proj.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "skills":
                return skills.length > 0 && (
                    <section key="skills" className="mb-6">
                        <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-3 uppercase">Skills</h2>
                        <p className="text-sm leading-relaxed text-gray-700">
                            {skills.map(s => s.name).join(" • ")}
                        </p>
                    </section>
                );
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications" className="mb-6">
                        <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-3 uppercase">Certifications</h2>
                        <div className="space-y-1">
                            {certifications.map((cert) => (
                                <div key={cert.id} className="flex justify-between text-sm">
                                    <span className="font-semibold">{cert.name}</span>
                                    <span>{cert.issuer} ({cert.issue_date})</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages" className="mb-6">
                        <h2 className="text-lg font-bold border-b-2 border-gray-800 mb-3 uppercase">Languages</h2>
                        <div className="flex flex-wrap gap-x-8 gap-y-1">
                            {languages.map((lang) => (
                                <p key={lang.id} className="text-sm">
                                    <span className="font-semibold">{lang.language}:</span> {lang.proficiency}
                                </p>
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white text-black p-12 min-h-[1056px] h-full font-serif">
            {/* Header - Traditional */}
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">
                    {profile.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-700">
                    {profile.location && <span>{profile.location}</span>}
                    {profile.location && (profile.phone || profile.email) && <span>|</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.phone && profile.email && <span>|</span>}
                    {profile.email && <span>{profile.email}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-blue-800 underline">
                    {profile.linkedin_url && <a href={profile.linkedin_url}>LinkedIn</a>}
                    {profile.github_url && <a href={profile.github_url}>GitHub</a>}
                    {profile.website_url && <a href={profile.website_url}>Website</a>}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-6">
                    <p className="text-sm leading-relaxed text-justify italic text-gray-800">
                        {profile.summary}
                    </p>
                </section>
            )}

            {sectionOrder.map(renderSection)}
        </div>
    );
};
