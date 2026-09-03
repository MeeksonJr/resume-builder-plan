import { useResumeStore } from "@/lib/stores/resume-store";
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

export const ClassicTemplate = ({ data, isRtl, language }: TemplateProps) => {
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
                    <section key="experience" className="mb-6">
                        <h2
                            className="font-bold border-b-2 mb-3 uppercase"
                            style={{ borderBottomColor: accent, color: accent, fontSize: "var(--resume-font-lg)" }}
                        >
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between font-bold", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-base)" }}>
                                        <span>{exp.company}</span>
                                        <span>{exp.location}</span>
                                    </div>
                                    <div className={cn("flex justify-between italic mb-2", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-sm)" }}>
                                        <span>{exp.position}</span>
                                        <span>{exp.start_date} – {exp.is_current ? "Present" : exp.end_date}</span>
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
                    <section key="education" className="mb-6">
                        <h2
                            className="font-bold border-b-2 mb-3 uppercase"
                            style={{ borderBottomColor: accent, color: accent, fontSize: "var(--resume-font-lg)" }}
                        >
                            Education
                        </h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between font-bold", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-base)" }}>
                                        <span>{edu.institution}</span>
                                        <span>{edu.location}</span>
                                    </div>
                                    <div className={cn("flex justify-between italic", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-sm)" }}>
                                        <span>{edu.degree} in {edu.field_of_study}</span>
                                        <span>{edu.start_date} – {edu.end_date}</span>
                                    </div>
                                    {edu.gpa && <p style={{ fontSize: "var(--resume-font-sm)" }}>GPA: {edu.gpa}</p>}
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
                    <section key="projects" className="mb-6">
                        <h2
                            className="font-bold border-b-2 mb-3 uppercase"
                            style={{ borderBottomColor: accent, color: accent, fontSize: "var(--resume-font-lg)" }}
                        >
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between font-bold mb-1", isRtl && "flex-row-reverse")} style={{ fontSize: "var(--resume-font-base)" }}>
                                        <span>{proj.name}</span>
                                        {proj.url && <a href={proj.url} className="font-normal underline" style={{ color: accent, fontSize: "var(--resume-font-xs)" }}>{proj.url}</a>}
                                    </div>
                                    {proj.technologies.length > 0 && (
                                        <p className="italic text-gray-600 mb-1" style={{ fontSize: "var(--resume-font-xs)" }}>
                                            Technologies: {proj.technologies.join(", ")}
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
            case "skills":
                return skills.length > 0 && (
                    <section key="skills" className="mb-6">
                        <h2
                            className="font-bold border-b-2 mb-3 uppercase"
                            style={{ borderBottomColor: accent, color: accent, fontSize: "var(--resume-font-lg)" }}
                        >
                            Skills
                        </h2>
                        <p className="text-gray-700" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {skills.map(s => s.name).join(" • ")}
                        </p>
                    </section>
                );
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications" className="mb-6">
                        <h2
                            className="font-bold border-b-2 mb-3 uppercase"
                            style={{ borderBottomColor: accent, color: accent, fontSize: "var(--resume-font-lg)" }}
                        >
                            Certifications
                        </h2>
                        <div className="space-y-1">
                            {certifications.map((cert) => (
                                <div key={cert.id} className="flex justify-between break-inside-avoid" style={{ fontSize: "var(--resume-font-sm)" }}>
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
                        <h2
                            className="font-bold border-b-2 mb-3 uppercase"
                            style={{ borderBottomColor: accent, color: accent, fontSize: "var(--resume-font-lg)" }}
                        >
                            Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-8 gap-y-1">
                            {languages.map((lang) => (
                                <p key={lang.id} style={{ fontSize: "var(--resume-font-sm)" }}>
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
        <div
            className="bg-white text-black min-h-[1056px] h-full transition-all duration-300"
            style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-font-base)",
                lineHeight: "var(--resume-line-height)",
                padding: "var(--resume-padding)",
            }}
        >
            {/* Header - Traditional */}
            <header className="text-center mb-8">
                <h1
                    className="font-bold mb-2 tracking-tight"
                    style={{ color: accent, fontSize: "var(--resume-font-xxxl)" }}
                >
                    {profile.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 text-gray-700" style={{ fontSize: "var(--resume-font-sm)" }}>
                    {profile.location && <span>{profile.location}</span>}
                    {profile.location && (profile.phone || profile.email) && <span>|</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.phone && profile.email && <span>|</span>}
                    {profile.email && <span>{profile.email}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2 underline" style={{ fontSize: "var(--resume-font-xs)", color: accent }}>
                    {profile.linkedin_url && <a href={profile.linkedin_url}>LinkedIn</a>}
                    {profile.github_url && <a href={profile.github_url}>GitHub</a>}
                    {profile.website_url && <a href={profile.website_url}>Website</a>}
                </div>
            </header>

            {/* Summary */}
            {profile.summary && (
                <section className="mb-6">
                    <div
                        className="text-justify italic text-gray-800 prose-sm prose-p:my-0"
                        style={{ fontSize: "var(--resume-font-sm)" }}
                        dangerouslySetInnerHTML={{ __html: profile.summary }}
                    />
                </section>
            )}

            {sectionOrder.map(renderSection)}
        </div>
    );
};
