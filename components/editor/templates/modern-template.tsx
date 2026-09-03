import React from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Github } from "lucide-react";
import { cn } from "@/lib/utils";

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
    isRtl?: boolean;
    language?: string;
}

export const ModernTemplate = ({ data, isRtl, language }: TemplateProps) => {
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
    const visualConfig = data?.resume?.visual_config || store.visualConfig;

    if (!profile) return null;

    const accent = visualConfig.accentColor || "var(--resume-accent, #0070f3)";

    const renderSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience">
                        <h2
                            className="font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={{ color: accent, borderColor: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between items-baseline mb-1", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold" style={{ fontSize: "var(--resume-font-base)" }}>{exp.position}</h3>
                                        <span className="text-gray-600 font-medium whitespace-nowrap" style={{ fontSize: "var(--resume-font-sm)" }}>
                                            {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-baseline mb-2", isRtl && "flex-row-reverse")}>
                                        <span className="font-medium text-gray-800" style={{ fontSize: "var(--resume-font-sm)" }}>{exp.company}</span>
                                        <span className="text-gray-500" style={{ fontSize: "var(--resume-font-sm)" }}>{exp.location}</span>
                                    </div>
                                    <div
                                        className="text-gray-700 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                        style={{ fontSize: "var(--resume-font-sm)" }}
                                        dangerouslySetInnerHTML={{ __html: exp.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "education":
                return education.length > 0 && (
                    <section key="education">
                        <h2
                            className="font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={{ color: accent, borderColor: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Education
                        </h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between items-baseline mb-1", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold" style={{ fontSize: "var(--resume-font-base)" }}>{edu.institution}</h3>
                                        <span className="text-gray-600 font-medium whitespace-nowrap" style={{ fontSize: "var(--resume-font-sm)" }}>
                                            {edu.start_date} - {edu.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-center", isRtl && "flex-row-reverse")}>
                                        <div>
                                            <span className="font-medium text-gray-800" style={{ fontSize: "var(--resume-font-sm)" }}>{edu.degree} in {edu.field_of_study}</span>
                                        </div>
                                        {edu.gpa && <span className="text-gray-500" style={{ fontSize: "var(--resume-font-sm)" }}>GPA: {edu.gpa}</span>}
                                    </div>
                                    {edu.highlights && edu.highlights.length > 0 && edu.highlights.some((h: string) => h.trim()) && (
                                        <div
                                            className="text-gray-700 mt-1 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                            style={{ fontSize: "var(--resume-font-sm)" }}
                                            dangerouslySetInnerHTML={{ __html: edu.highlights.join("\n") }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects">
                        <h2
                            className="font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={{ color: accent, borderColor: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between items-baseline mb-1", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold" style={{ fontSize: "var(--resume-font-base)" }}>{proj.name}</h3>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accent, fontSize: "var(--resume-font-xs)" }}>
                                                View Project
                                            </a>
                                        )}
                                    </div>
                                    {proj.technologies.length > 0 && (
                                        <div className="text-gray-500 mb-1 italic" style={{ fontSize: "var(--resume-font-xs)" }}>
                                            {proj.technologies.join(", ")}
                                        </div>
                                    )}
                                    <div
                                        className="text-gray-700 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                        style={{ fontSize: "var(--resume-font-sm)" }}
                                        dangerouslySetInnerHTML={{ __html: proj.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "skills":
                return skills.length > 0 && (
                    <section key="skills">
                        <h2
                            className="font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={{ color: accent, borderColor: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {Object.entries(
                                skills.reduce((acc: any, s: any) => {
                                    const cat = s.category || "General";
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(s.name);
                                    return acc;
                                }, {})
                            ).map(([category, skillNames]: any) => (
                                <div key={category}>
                                    <span className="font-semibold">{category}: </span>
                                    <span className="text-gray-600">{skillNames.join(", ")}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications">
                        <h2
                            className="font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={{ color: accent, borderColor: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Certifications
                        </h2>
                        <div className="space-y-2" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {certifications.map((cert) => (
                                <div key={cert.id} className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                    <div>
                                        <span className="font-semibold">{cert.name}</span>
                                        {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                                    </div>
                                    {cert.issue_date && <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: "var(--resume-font-xs)" }}>{cert.issue_date}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages">
                        <h2
                            className="font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={{ color: accent, borderColor: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-2">
                                    <span className="font-medium">{lang.language}:</span>
                                    <span className="text-gray-600">{lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="bg-white text-black min-h-[1056px] h-full transition-all duration-300"
            style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-font-base)",
                lineHeight: "var(--resume-line-height)",
                padding: "var(--resume-padding)",
            }}
        >
            {/* Header */}
            <header
                className="border-b-2 pb-6 mb-6"
                style={{ borderBottomColor: accent }}
            >
                <h1
                    className="font-bold uppercase tracking-wide mb-2"
                    style={{ fontSize: "var(--resume-font-xxxl)", color: accent }}
                >
                    {profile.full_name || "Your Name"}
                </h1>
                <div className={cn("flex flex-wrap gap-4 text-gray-600", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-sm)" }}>
                    {profile.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile.linkedin_url && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                        </div>
                    )}
                    {profile.github_url && (
                        <div className="flex items-center gap-1">
                            <Github className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                        </div>
                    )}
                    {profile.website_url && (
                        <div className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="space-y-6">
                {/* Summary */}
                {profile.summary && (
                    <section>
                        <h2
                            className="font-bold uppercase tracking-wider mb-2"
                            style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                        >
                            Professional Summary
                        </h2>
                        <div
                            className="text-justify prose-sm prose-p:my-0"
                            style={{ fontSize: "var(--resume-font-sm)" }}
                            dangerouslySetInnerHTML={{ __html: profile.summary }}
                        />
                    </section>
                )}

                {sectionOrder.map(renderSection)}
            </div>
        </div>
    );
};
