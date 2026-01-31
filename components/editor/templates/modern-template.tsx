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
}

export const ModernTemplate = ({ data }: TemplateProps) => {
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

    const accentStyle = { color: visualConfig.accentColor };
    const borderStyle = { borderColor: visualConfig.accentColor };

    const renderSection = (id: string) => {
        switch (id) {
            case "experience":
                return workExperiences.length > 0 && (
                    <section key="experience">
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={accentStyle}
                        >
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
                );
            case "education":
                return education.length > 0 && (
                    <section key="education">
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={accentStyle}
                        >
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
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects">
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={accentStyle}
                        >
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
                );
            case "skills":
                return skills.length > 0 && (
                    <section key="skills">
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={accentStyle}
                        >
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
                );
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications">
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={accentStyle}
                        >
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
                );
            case "languages":
                return languages.length > 0 && (
                    <section key="languages">
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1"
                            style={accentStyle}
                        >
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
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                "bg-white text-black p-8 min-h-[1056px] h-full transition-all duration-300",
                visualConfig.fontSize === "small" ? "text-[13px]" : visualConfig.fontSize === "large" ? "text-[16px]" : "text-[14px]",
                visualConfig.lineHeight === "tight" ? "leading-tight" : visualConfig.lineHeight === "relaxed" ? "leading-relaxed" : "leading-normal"
            )}
            style={{ fontFamily: visualConfig.fontFamily }}
        >
            {/* Header */}
            <header
                className="border-b-2 pb-6 mb-6"
                style={{ borderBottomColor: visualConfig.accentColor }}
            >
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
                        <h2
                            className="text-sm font-bold uppercase tracking-wider mb-2"
                            style={accentStyle}
                        >
                            Professional Summary
                        </h2>
                        <p className="leading-inherit text-justify">{profile.summary}</p>
                    </section>
                )}

                {sectionOrder.map(renderSection)}
            </div>
        </div>
    );
};
