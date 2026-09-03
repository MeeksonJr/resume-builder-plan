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

export const ElegantTemplate = ({ data, isRtl, language }: TemplateProps) => {
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

    const accent = visualConfig.accentColor || "#881337";

    const renderSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-serif italic font-bold tracking-wide text-sm whitespace-nowrap"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Experience
                            </h2>
                            <div className="h-px bg-gray-200 grow" />
                        </div>
                        <div className="space-y-4 pl-2 border-l" style={{ borderLeftColor: `${accent}30` }}>
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-serif font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {exp.position}
                                        </h3>
                                        <span className="text-xs text-gray-500 italic whitespace-nowrap">
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-baseline text-xs text-gray-600", isRtl && "flex-row-reverse")}>
                                        <span className="font-semibold">{exp.company}</span>
                                        <span className="text-gray-400">{exp.location}</span>
                                    </div>
                                    <div
                                        className="text-gray-700 prose-sm prose-p:my-0 prose-ul:my-1 prose-li:my-0.5"
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
                    <section key="education" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-serif italic font-bold tracking-wide text-sm whitespace-nowrap"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Education
                            </h2>
                            <div className="h-px bg-gray-200 grow" />
                        </div>
                        <div className="space-y-3 pl-2 border-l" style={{ borderLeftColor: `${accent}30` }}>
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid space-y-0.5">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-serif font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {edu.institution}
                                        </h3>
                                        <span className="text-xs text-gray-500 italic whitespace-nowrap">
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-700">{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="text-gray-500 italic">GPA: {edu.gpa}</span>}
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
            case "skills":
                return skills.length > 0 && (
                    <section key="skills" className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-serif italic font-bold tracking-wide text-sm whitespace-nowrap"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Expertise
                            </h2>
                            <div className="h-px bg-gray-200 grow" />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="px-2.5 py-1 rounded-none border border-gray-200 text-gray-800 bg-gray-50/50"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects" className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-serif italic font-bold tracking-wide text-sm whitespace-nowrap"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Portfolio
                            </h2>
                            <div className="h-px bg-gray-200 grow" />
                        </div>
                        <div className="space-y-3 pl-2 border-l" style={{ borderLeftColor: `${accent}30` }}>
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-serif font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {proj.name}
                                        </h3>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs italic underline" style={{ color: accent }}>
                                                View
                                            </a>
                                        )}
                                    </div>
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
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications" className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-serif italic font-bold tracking-wide text-sm whitespace-nowrap"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Honors & Certifications
                            </h2>
                            <div className="h-px bg-gray-200 grow" />
                        </div>
                        <div className="space-y-1 text-xs" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {certifications.map((cert) => (
                                <div key={cert.id} className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                    <span className="font-semibold text-gray-800">{cert.name}</span>
                                    <span className="text-gray-500 italic">{cert.issuer} {cert.issue_date && `(${cert.issue_date})`}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages" className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-serif italic font-bold tracking-wide text-sm whitespace-nowrap"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Languages
                            </h2>
                            <div className="h-px bg-gray-200 grow" />
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-2">
                                    <span className="font-semibold text-gray-800">{lang.language}:</span>
                                    <span className="text-gray-500 italic">{lang.proficiency}</span>
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
            className="bg-white text-black min-h-[1056px] h-auto transition-all duration-300"
            style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-font-base)",
                lineHeight: "var(--resume-line-height)",
                padding: "var(--resume-padding)",
            }}
        >
            {/* Elegant Serif Header */}
            <header className="text-center pb-6 mb-6 border-b" style={{ borderColor: `${accent}40` }}>
                <h1
                    className="font-serif tracking-tight font-normal"
                    style={{ fontSize: "var(--resume-font-xxxl)", color: accent }}
                >
                    {profile.full_name || "Your Name"}
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mt-1 font-medium">
                    {profile.label || "Professional"}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-3">
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>· {profile.phone}</span>}
                    {profile.location && <span>· {profile.location}</span>}
                    {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: accent }}>
                            · LinkedIn
                        </a>
                    )}
                    {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: accent }}>
                            · Portfolio
                        </a>
                    )}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-6">
                    <div
                        className="text-justify font-serif text-gray-700 prose-sm prose-p:my-0 leading-relaxed"
                        style={{ fontSize: "var(--resume-font-sm)" }}
                        dangerouslySetInnerHTML={{ __html: profile.summary }}
                    />
                </section>
            )}

            <div className="space-y-6">
                {sectionOrder.map(renderSection)}
            </div>
        </div>
    );
};
