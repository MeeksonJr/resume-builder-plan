import React from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Award, Briefcase, GraduationCap, BookOpen, Globe } from "lucide-react";
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

export const ExecutiveTemplate = ({ data, isRtl, language }: TemplateProps) => {
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

    const accent = visualConfig.accentColor || "#0f172a";

    const renderSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience" className="space-y-4">
                        <div className="flex items-center gap-2 border-b-2 pb-1.5" style={{ borderColor: accent }}>
                            <Briefcase className="h-4 w-4" style={{ color: accent }} />
                            <h2
                                className="font-serif font-black uppercase tracking-wider text-sm"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Executive Experience
                            </h2>
                        </div>
                        <div className="space-y-5">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid space-y-1.5">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-serif font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {exp.position}
                                        </h3>
                                        <span className="font-mono text-xs font-semibold text-gray-500 whitespace-nowrap">
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-baseline text-xs text-gray-600 font-medium", isRtl && "flex-row-reverse")}>
                                        <span className="font-semibold text-gray-800" style={{ color: accent }}>{exp.company}</span>
                                        <span className="italic">{exp.location}</span>
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
                        <div className="flex items-center gap-2 border-b-2 pb-1.5" style={{ borderColor: accent }}>
                            <GraduationCap className="h-4 w-4" style={{ color: accent }} />
                            <h2
                                className="font-serif font-black uppercase tracking-wider text-sm"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Education & Credentials
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-serif font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {edu.institution}
                                        </h3>
                                        <span className="font-mono text-xs text-gray-500 whitespace-nowrap">
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-center text-xs", isRtl && "flex-row-reverse")}>
                                        <span className="font-semibold text-gray-700">{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="text-gray-500 font-mono">GPA: {edu.gpa}</span>}
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
                    <section key="skills" className="space-y-3">
                        <div className="flex items-center gap-2 border-b-2 pb-1.5" style={{ borderColor: accent }}>
                            <Award className="h-4 w-4" style={{ color: accent }} />
                            <h2
                                className="font-serif font-black uppercase tracking-wider text-sm"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Core Competencies
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {skills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="flex items-center gap-1.5 p-1.5 border-l-2 bg-gray-50 text-gray-800"
                                    style={{ borderLeftColor: accent }}
                                >
                                    <span className="font-medium text-xs truncate">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects" className="space-y-4">
                        <div className="flex items-center gap-2 border-b-2 pb-1.5" style={{ borderColor: accent }}>
                            <BookOpen className="h-4 w-4" style={{ color: accent }} />
                            <h2
                                className="font-serif font-black uppercase tracking-wider text-sm"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Key Initiatives & Boards
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-serif font-bold text-gray-900" style={{ fontSize: "var(--resume-font-base)" }}>
                                            {proj.name}
                                        </h3>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: accent }}>
                                                Link
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
                    <section key="certifications" className="space-y-3">
                        <div className="flex items-center gap-2 border-b-2 pb-1.5" style={{ borderColor: accent }}>
                            <Award className="h-4 w-4" style={{ color: accent }} />
                            <h2
                                className="font-serif font-black uppercase tracking-wider text-sm"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Executive Certifications
                            </h2>
                        </div>
                        <div className="space-y-1.5" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {certifications.map((cert) => (
                                <div key={cert.id} className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                    <div>
                                        <span className="font-semibold text-gray-800">{cert.name}</span>
                                        {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                                    </div>
                                    {cert.issue_date && <span className="text-gray-500 font-mono text-xs whitespace-nowrap">{cert.issue_date}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages" className="space-y-3">
                        <div className="flex items-center gap-2 border-b-2 pb-1.5" style={{ borderColor: accent }}>
                            <Globe className="h-4 w-4" style={{ color: accent }} />
                            <h2
                                className="font-serif font-black uppercase tracking-wider text-sm"
                                style={{ color: accent, fontSize: "var(--resume-font-sm)" }}
                            >
                                Global Languages
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-1" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-2">
                                    <span className="font-semibold text-gray-800">{lang.language}:</span>
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
            {/* Executive Masthead Banner */}
            <header className="border-b-4 pb-6 mb-6" style={{ borderColor: accent }}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1
                            className="font-serif font-black tracking-tight uppercase"
                            style={{ fontSize: "var(--resume-font-xxxl)", color: accent }}
                        >
                            {profile.full_name || "Your Name"}
                        </h1>
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-gray-600 mt-1">
                            {profile.label || "Executive Leader"}
                        </p>
                    </div>
                    {/* Contact details */}
                    <div className={cn("flex flex-wrap sm:flex-col sm:items-end gap-2 text-xs text-gray-600", isRtl && "sm:items-start")}>
                        {profile.email && (
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                                <span>{profile.email}</span>
                            </div>
                        )}
                        {profile.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                                <span>{profile.phone}</span>
                            </div>
                        )}
                        {profile.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.linkedin_url && (
                            <div className="flex items-center gap-1.5">
                                <Linkedin className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                                <span className="underline">{profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Executive Summary */}
            {profile.summary && (
                <section className="mb-6 p-4 border-l-4 bg-gray-50/60" style={{ borderLeftColor: accent }}>
                    <div
                        className="text-justify font-serif italic text-gray-800 prose-sm prose-p:my-0"
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
