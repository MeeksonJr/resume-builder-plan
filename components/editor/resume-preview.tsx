"use client";

import { useResumeStore } from "@/lib/stores/resume-store";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Github } from "lucide-react";

export function ResumePreview() {
    const {
        profile,
        workExperiences,
        education,
        skills,
        projects,
        certifications,
        languages,
    } = useResumeStore();

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading preview...
            </div>
        );
    }

    return (
        <div className="bg-white text-black p-8 min-h-[1056px] shadow-lg print:shadow-none">
            {/* Header */}
            <header className="border-b-2 border-gray-900 pb-6 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">
                    {profile.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {profile.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile.linkedin_url && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" />
                            <span>{profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                        </div>
                    )}
                    {profile.github_url && (
                        <div className="flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            <span>{profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                        </div>
                    )}
                    {profile.website_url && (
                        <div className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="space-y-6">
                {/* Summary */}
                {profile.summary && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Professional Summary
                        </h2>
                        <p className="text-sm leading-relaxed">{profile.summary}</p>
                    </section>
                )}

                {/* Experience */}
                {workExperiences.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold">{exp.position}</h3>
                                        <span className="text-sm text-gray-600 font-medium">
                                            {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="font-medium text-gray-800">{exp.company}</span>
                                        <span className="text-sm text-gray-500">{exp.location}</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
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
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold">{edu.institution}</h3>
                                        <span className="text-sm text-gray-600 font-medium">
                                            {edu.start_date} - {edu.end_date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-gray-800">{edu.degree} in {edu.field_of_study}</span>
                                        </div>
                                        {edu.gpa && <span className="text-sm text-gray-500">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold">{proj.name}</h3>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                Link
                                            </a>
                                        )}
                                    </div>
                                    {proj.technologies.length > 0 && (
                                        <div className="text-xs text-gray-500 mb-1">
                                            {proj.technologies.join(", ")}
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
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
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                            {skills.map((skill, index) => (
                                <span key={skill.id} className="text-gray-800">
                                    {skill.name}
                                    {index < skills.length - 1 && <span className="text-gray-400 ml-2">•</span>}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                            Certifications
                        </h2>
                        <div className="space-y-2">
                            {certifications.map((cert) => (
                                <div key={cert.id} className="flex justify-between text-sm">
                                    <span className="font-medium">{cert.name}</span>
                                    <div className="text-gray-600">
                                        <span>{cert.issuer}</span>
                                        {cert.issue_date && <span> • {cert.issue_date}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">
                            Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-2">
                                    <span className="font-medium">{lang.language}:</span>
                                    <span className="text-gray-600">{lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
