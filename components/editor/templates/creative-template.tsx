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

export const CreativeTemplate = ({ data, isRtl, language }: TemplateProps) => {
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

    const accentColor = visualConfig.accentColor || "#102b2b";
    const accentStyle = { color: accentColor };
    const borderStyle = { borderColor: accentColor };
    const bgStyle = { backgroundColor: accentColor };

    const renderRightSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience" className="space-y-4">
                        <h2
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1.5"
                            style={borderStyle}
                        >
                            Professional Experience
                        </h2>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold text-sm text-[#102b2b]">{exp.position}</h3>
                                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                                            {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-baseline text-xs", isRtl && "flex-row-reverse")}>
                                        <span className="font-semibold text-gray-700">{exp.company}</span>
                                        <span className="text-gray-400 italic">{exp.location}</span>
                                    </div>
                                    <div
                                        className="text-xs leading-relaxed text-gray-600 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                        dangerouslySetInnerHTML={{ __html: exp.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects" className="space-y-4">
                        <h2
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1.5"
                            style={borderStyle}
                        >
                            Key Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold text-sm text-[#102b2b] flex items-center gap-1">
                                            {proj.name}
                                            {proj.url && (
                                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex text-[#0d8274] hover:text-[#102b2b]">
                                                    <LinkIcon className="h-3 w-3" />
                                                </a>
                                            )}
                                        </h3>
                                        {proj.start_date && (
                                            <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                                                {proj.start_date} {proj.end_date ? `- ${proj.end_date}` : ""}
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className="text-xs leading-relaxed text-gray-600 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                        dangerouslySetInnerHTML={{ __html: proj.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "education":
                return education.length > 0 && (
                    <section key="education" className="space-y-4">
                        <h2
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1.5"
                            style={borderStyle}
                        >
                            Education
                        </h2>
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid space-y-1">
                                    <div className={cn("flex justify-between items-baseline", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-bold text-sm text-[#102b2b]">{edu.institution}</h3>
                                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                                            {edu.start_date} - {edu.end_date}
                                        </span>
                                    </div>
                                    <div className={cn("flex justify-between items-center text-xs", isRtl && "flex-row-reverse")}>
                                        <span className="font-medium text-gray-700">{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="text-[11px] text-gray-500">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    const renderLeftSection = (id: string) => {
        switch (id) {
            case "skills":
                return skills.length > 0 && (
                    <div key="skills" className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">Skills</h3>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-800 border border-gray-200/50"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            case "certifications":
                return certifications.length > 0 && (
                    <div key="certifications" className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">Certifications</h3>
                        <div className="space-y-2 pt-1">
                            {certifications.map((cert) => (
                                <div key={cert.id} className="text-xs break-inside-avoid">
                                    <p className="font-semibold text-gray-800">{cert.name}</p>
                                    <p className="text-[10px] text-gray-500">{cert.issuer} {cert.issue_date ? `• ${cert.issue_date}` : ""}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "languages":
                return languages.length > 0 && (
                    <div key="languages" className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">Languages</h3>
                        <div className="space-y-1.5 pt-1">
                            {languages.map((lang) => (
                                <div key={lang.id} className="flex justify-between text-xs">
                                    <span className="font-semibold text-gray-800">{lang.language}</span>
                                    <span className="text-gray-500 italic text-[11px]">{lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const rightSections = ["experience", "projects", "education"];
    const leftSections = ["skills", "certifications", "languages"];

    // Filter section orders
    const rightColRender = sectionOrder.filter((s: string) => rightSections.includes(s));
    const leftColRender = sectionOrder.filter((s: string) => leftSections.includes(s));

    return (
        <div
            className={cn(
                "bg-white text-black p-8 min-h-[1056px] h-full flex flex-col justify-between transition-all duration-300",
                visualConfig.fontSize === "small" ? "text-[13px]" : visualConfig.fontSize === "large" ? "text-[16px]" : "text-[14px]",
                visualConfig.lineHeight === "tight" ? "leading-tight" : visualConfig.lineHeight === "relaxed" ? "leading-relaxed" : "leading-normal"
            )}
            style={{ fontFamily: visualConfig.fontFamily }}
        >
            <div>
                {/* Header Banner */}
                <header className="flex justify-between items-start border-b-4 pb-6 mb-6" style={borderStyle}>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#102b2b] uppercase">
                            {profile.full_name || "Your Name"}
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={accentStyle}>
                            {profile.label || "Professional Title"}
                        </p>
                    </div>
                </header>

                {/* Main Two-Column Layout */}
                <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", isRtl && "md:flex-row-reverse")}>
                    {/* Left Column (1/3) */}
                    <div className="col-span-1 space-y-6 border-r border-[#102b2b]/10 pr-4">
                        {/* Contact details */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">Contact</h3>
                            <div className="space-y-2 text-xs text-gray-600">
                                {profile.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 shrink-0" style={accentStyle} />
                                        <span className="truncate">{profile.email}</span>
                                    </div>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 shrink-0" style={accentStyle} />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                                {profile.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" style={accentStyle} />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.linkedin_url && (
                                    <div className="flex items-center gap-2">
                                        <Linkedin className="h-3.5 w-3.5 shrink-0" style={accentStyle} />
                                        <span className="truncate">{profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                                    </div>
                                )}
                                {profile.github_url && (
                                    <div className="flex items-center gap-2">
                                        <Github className="h-3.5 w-3.5 shrink-0" style={accentStyle} />
                                        <span className="truncate">{profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                                    </div>
                                )}
                                {profile.website_url && (
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-3.5 w-3.5 shrink-0" style={accentStyle} />
                                        <span className="truncate">{profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Render left-side sections */}
                        {leftColRender.map(renderLeftSection)}
                    </div>

                    {/* Right Column (2/3) */}
                    <div className="col-span-2 space-y-6">
                        {/* Summary */}
                        {profile.summary && (
                            <section className="space-y-2">
                                <h2
                                    className="text-xs font-bold uppercase tracking-widest border-b pb-1.5"
                                    style={borderStyle}
                                >
                                    About Me
                                </h2>
                                <div
                                    className="text-xs leading-relaxed text-gray-600 prose-sm prose-p:my-0"
                                    dangerouslySetInnerHTML={{ __html: profile.summary }}
                                />
                            </section>
                        )}

                        {/* Render right-side sections */}
                        {rightColRender.map(renderRightSection)}
                    </div>
                </div>
            </div>
        </div>
    );
};
