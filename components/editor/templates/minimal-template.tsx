import React from "react";
import { useResumeStore } from "@/lib/stores/resume-store";

interface TemplateProps {
    data?: {
        profile: any;
        workExperiences: any[];
        education: any[];
        skills: any[];
        projects: any[];
        certifications: any[];
        languages: any[];
    };
}

export const MinimalTemplate = ({ data }: TemplateProps) => {
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

    if (!profile) return null;

    return (
        <div className="bg-white text-gray-800 p-10 min-h-[1056px] h-full font-serif">
            {/* Header - Centered */}
            <header className="text-center mb-8">
                <h1 className="text-3xl font-normal uppercase tracking-[0.2em] mb-3 text-black">
                    {profile.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-gray-500">
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.location && <span>{profile.location}</span>}
                    {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:underline">
                            LinkedIn
                        </a>
                    )}
                    {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noreferrer" className="hover:underline">
                            Portfolio
                        </a>
                    )}
                </div>
            </header>

            <div className="space-y-8">
                {/* Summary */}
                {profile.summary && (
                    <section>
                        <p className="text-sm leading-7 text-justify">{profile.summary}</p>
                    </section>
                )}

                {/* Experience */}
                {workExperiences.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 mb-4">
                            Experience
                        </h2>
                        <div className="space-y-5">
                            {workExperiences.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-base">{exp.position}</h3>
                                        <span className="text-xs text-gray-500 italic">
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className="text-sm mb-2">
                                        <span className="font-medium">{exp.company}</span>
                                        {exp.location && <span className="text-gray-500">, {exp.location}</span>}
                                    </div>
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-gray-700">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 mb-4">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-base">{edu.institution}</h3>
                                        <span className="text-xs text-gray-500 italic">
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span>{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="text-gray-500 ml-2">(GPA: {edu.gpa})</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 mb-4">
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-base">{proj.name}</h3>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline italic">
                                                View Project
                                            </a>
                                        )}
                                    </div>
                                    {proj.technologies.length > 0 && (
                                        <div className="text-xs text-gray-500 mb-1 italic">
                                            {proj.technologies.join(", ")}
                                        </div>
                                    )}
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-gray-700">
                                        {proj.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 mb-4">
                            Skills
                        </h2>
                        <p className="text-sm leading-6">
                            {skills.map(s => s.name).join(" • ")}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
};
