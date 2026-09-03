import React from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Code2, Terminal, Cpu, Database, Award } from "lucide-react";
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

export const TechnicalTemplate = ({ data, isRtl, language }: TemplateProps) => {
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

    const accent = visualConfig.accentColor || "#166534";

    const renderSection = (id: string) => {
        switch (id) {
            case "skills":
                return skills.length > 0 && (
                    <section key="skills" className="space-y-2">
                        <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: accent }}>
                            <Cpu className="h-3.5 w-3.5" style={{ color: accent }} />
                            <h2 className="font-mono font-bold uppercase tracking-wider text-xs" style={{ color: accent }}>
                                Technical Skills Matrix
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5" style={{ fontSize: "var(--resume-font-xs)" }}>
                            {Object.entries(
                                skills.reduce((acc: any, s: any) => {
                                    const cat = s.category || "Core";
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(s.name);
                                    return acc;
                                }, {})
                            ).map(([category, skillNames]: any) => (
                                <div key={category} className="flex gap-2 font-mono">
                                    <span className="font-bold text-gray-900 shrink-0" style={{ color: accent }}>[{category}]:</span>
                                    <span className="text-gray-700">{skillNames.join(", ")}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience" className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: accent }}>
                            <Terminal className="h-3.5 w-3.5" style={{ color: accent }} />
                            <h2 className="font-mono font-bold uppercase tracking-wider text-xs" style={{ color: accent }}>
                                Work Experience
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                                {exp.position}
                                            </h3>
                                            <span className="text-xs text-gray-600">@ <strong style={{ color: accent }}>{exp.company}</strong></span>
                                        </div>
                                        <span className="font-mono text-xs text-gray-500 whitespace-nowrap">
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    {exp.location && (
                                        <p className="text-xs text-gray-400 font-mono">{exp.location}</p>
                                    )}
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
            case "projects":
                return projects.length > 0 && (
                    <section key="projects" className="space-y-3">
                        <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: accent }}>
                            <Code2 className="h-3.5 w-3.5" style={{ color: accent }} />
                            <h2 className="font-mono font-bold uppercase tracking-wider text-xs" style={{ color: accent }}>
                                Engineering Projects
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold flex items-center gap-2" style={{ fontSize: "var(--resume-font-base)" }}>
                                            <span>{proj.name}</span>
                                            {proj.url && (
                                                <a
                                                    href={proj.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-xs font-semibold underline"
                                                    style={{ color: accent }}
                                                >
                                                    [code]
                                                </a>
                                            )}
                                        </h3>
                                    </div>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <p className="font-mono text-xs text-gray-500">
                                            Stack: {proj.technologies.join(" · ")}
                                        </p>
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
            case "education":
                return education.length > 0 && (
                    <section key="education" className="space-y-2">
                        <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: accent }}>
                            <Database className="h-3.5 w-3.5" style={{ color: accent }} />
                            <h2 className="font-mono font-bold uppercase tracking-wider text-xs" style={{ color: accent }}>
                                Education & Coursework
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid space-y-0.5">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {edu.institution}
                                        </h3>
                                        <span className="font-mono text-xs text-gray-500 whitespace-nowrap">
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-700 font-medium">{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="font-mono text-gray-500">GPA: {edu.gpa}</span>}
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
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications" className="space-y-2">
                        <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: accent }}>
                            <Award className="h-3.5 w-3.5" style={{ color: accent }} />
                            <h2 className="font-mono font-bold uppercase tracking-wider text-xs" style={{ color: accent }}>
                                Certifications
                            </h2>
                        </div>
                        <div className="space-y-1 font-mono text-xs">
                            {certifications.map((cert) => (
                                <div key={cert.id} className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                    <span className="font-semibold text-gray-800">{cert.name} ({cert.issuer})</span>
                                    {cert.issue_date && <span className="text-gray-500">{cert.issue_date}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages" className="space-y-2">
                        <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: accent }}>
                            <Globe className="h-3.5 w-3.5" style={{ color: accent }} />
                            <h2 className="font-mono font-bold uppercase tracking-wider text-xs" style={{ color: accent }}>
                                Languages
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-1.5">
                                    <span className="font-bold text-gray-800">{lang.language}:</span>
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
            <header className="border-b pb-4 mb-5" style={{ borderColor: accent }}>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h1
                        className="font-mono font-black tracking-tight uppercase"
                        style={{ fontSize: "var(--resume-font-xxxl)", color: accent }}
                    >
                        {profile.full_name || "Your Name"}
                    </h1>
                    <p className="font-mono text-xs font-semibold text-gray-600">
                        {profile.label || "Software Engineer"}
                    </p>
                </div>
                <div className={cn("flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-gray-600", isRtl && "flex-row-reverse")}>
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
                    {profile.github_url && (
                        <div className="flex items-center gap-1">
                            <Github className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                        </div>
                    )}
                    {profile.linkedin_url && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                        </div>
                    )}
                    {profile.website_url && (
                        <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" style={{ color: accent }} />
                            <span>{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-5">
                    <div
                        className="text-justify text-gray-700 prose-sm prose-p:my-0"
                        style={{ fontSize: "var(--resume-font-sm)" }}
                        dangerouslySetInnerHTML={{ __html: profile.summary }}
                    />
                </section>
            )}

            <div className="space-y-4">
                {sectionOrder.map(renderSection)}
            </div>
        </div>
    );
};
