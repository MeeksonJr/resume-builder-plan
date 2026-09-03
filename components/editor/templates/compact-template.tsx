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

export const CompactTemplate = ({ data, isRtl, language }: TemplateProps) => {
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

    const accent = visualConfig.accentColor || "#1d4ed8";

    const renderSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience" className="space-y-1.5">
                        <h2
                            className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs"
                            style={{ borderColor: accent, color: accent }}
                        >
                            Experience
                        </h2>
                        <div className="space-y-2">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid space-y-0.5">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="font-bold text-gray-900" style={{ fontSize: "var(--resume-font-sm)" }}>{exp.position}</span>
                                            <span className="text-gray-600 font-medium text-xs">| {exp.company}</span>
                                            {exp.location && <span className="text-gray-400 text-[10px]">({exp.location})</span>}
                                        </div>
                                        <span className="text-gray-500 font-mono text-[10.5px] whitespace-nowrap">
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div
                                        className="text-gray-700 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                        style={{ fontSize: "var(--resume-font-xs)" }}
                                        dangerouslySetInnerHTML={{ __html: exp.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "education":
                return education.length > 0 && (
                    <section key="education" className="space-y-1.5">
                        <h2
                            className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs"
                            style={{ borderColor: accent, color: accent }}
                        >
                            Education
                        </h2>
                        <div className="space-y-1.5">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid space-y-0.5">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="font-bold text-gray-900" style={{ fontSize: "var(--resume-font-sm)" }}>{edu.institution}</span>
                                            <span className="text-gray-600 text-xs">— {edu.degree} in {edu.field_of_study}</span>
                                        </div>
                                        <span className="text-gray-500 font-mono text-[10.5px] whitespace-nowrap">
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    {edu.gpa && <p className="text-gray-500 text-[10.5px]">GPA: {edu.gpa}</p>}
                                    {edu.highlights && edu.highlights.length > 0 && edu.highlights.some((h: string) => h.trim()) && (
                                        <div
                                            className="text-gray-700 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                            style={{ fontSize: "var(--resume-font-xs)" }}
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
                    <section key="skills" className="space-y-1">
                        <h2
                            className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs"
                            style={{ borderColor: accent, color: accent }}
                        >
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ fontSize: "var(--resume-font-xs)" }}>
                            {Object.entries(
                                skills.reduce((acc: any, s: any) => {
                                    const cat = s.category || "General";
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(s.name);
                                    return acc;
                                }, {})
                            ).map(([category, skillNames]: any) => (
                                <div key={category}>
                                    <span className="font-semibold text-gray-800" style={{ color: accent }}>{category}: </span>
                                    <span className="text-gray-600">{skillNames.join(", ")}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects" className="space-y-1.5">
                        <h2
                            className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs"
                            style={{ borderColor: accent, color: accent }}
                        >
                            Projects
                        </h2>
                        <div className="space-y-1.5">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid space-y-0.5">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="font-bold text-gray-900" style={{ fontSize: "var(--resume-font-sm)" }}>{proj.name}</span>
                                            {proj.technologies?.length > 0 && (
                                                <span className="text-gray-400 text-[10px]">({proj.technologies.join(", ")})</span>
                                            )}
                                        </div>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-[10px] underline" style={{ color: accent }}>
                                                link
                                            </a>
                                        )}
                                    </div>
                                    <div
                                        className="text-gray-700 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                        style={{ fontSize: "var(--resume-font-xs)" }}
                                        dangerouslySetInnerHTML={{ __html: proj.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications" className="space-y-1">
                        <h2
                            className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs"
                            style={{ borderColor: accent, color: accent }}
                        >
                            Certifications
                        </h2>
                        <div className="space-y-0.5 text-xs" style={{ fontSize: "var(--resume-font-xs)" }}>
                            {certifications.map((cert) => (
                                <div key={cert.id} className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                    <div>
                                        <span className="font-semibold text-gray-800">{cert.name}</span>
                                        {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                                    </div>
                                    {cert.issue_date && <span className="text-gray-400 text-[10px]">{cert.issue_date}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages" className="space-y-1">
                        <h2
                            className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs"
                            style={{ borderColor: accent, color: accent }}
                        >
                            Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-xs" style={{ fontSize: "var(--resume-font-xs)" }}>
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex gap-1.5">
                                    <span className="font-medium text-gray-800">{lang.language}:</span>
                                    <span className="text-gray-500">{lang.proficiency}</span>
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
            {/* Ultra-compact Header */}
            <header className="border-b pb-2 mb-3" style={{ borderColor: accent }}>
                <div className="flex justify-between items-baseline">
                    <h1
                        className="font-black uppercase tracking-tight"
                        style={{ fontSize: "var(--resume-font-xxl)", color: accent }}
                    >
                        {profile.full_name || "Your Name"}
                    </h1>
                    <span className="text-xs font-semibold text-gray-500">{profile.label}</span>
                </div>
                <div className={cn("flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600 mt-1", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-xs)" }}>
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>• {profile.phone}</span>}
                    {profile.location && <span>• {profile.location}</span>}
                    {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: accent }}>
                            • LinkedIn
                        </a>
                    )}
                    {profile.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: accent }}>
                            • GitHub
                        </a>
                    )}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-2.5">
                    <div
                        className="text-justify text-gray-700 prose-sm prose-p:my-0"
                        style={{ fontSize: "var(--resume-font-xs)" }}
                        dangerouslySetInnerHTML={{ __html: profile.summary }}
                    />
                </section>
            )}

            <div className="space-y-2.5">
                {sectionOrder.map(renderSection)}
            </div>
        </div>
    );
};
