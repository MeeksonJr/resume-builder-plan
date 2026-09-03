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

export const MinimalTemplate = ({ data, isRtl, language }: TemplateProps) => {
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
                            className="font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={{ borderColor: accent, color: accent, fontSize: "var(--resume-font-xs)" }}
                        >
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {workExperiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between items-baseline mb-1", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-semibold" style={{ fontSize: "var(--resume-font-base)" }}>{exp.position}</h3>
                                        <span className="text-gray-500 italic whitespace-nowrap" style={{ fontSize: "var(--resume-font-xs)" }}>
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-1" style={{ fontSize: "var(--resume-font-sm)" }}>
                                        {exp.company} {exp.location && `· ${exp.location}`}
                                    </p>
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
                            className="font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={{ borderColor: accent, color: accent, fontSize: "var(--resume-font-xs)" }}
                        >
                            Education
                        </h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between items-baseline mb-1", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-semibold" style={{ fontSize: "var(--resume-font-base)" }}>{edu.institution}</h3>
                                        <span className="text-gray-500 italic whitespace-nowrap" style={{ fontSize: "var(--resume-font-xs)" }}>
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "var(--resume-font-sm)" }}>
                                        <span>{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="text-gray-500 ml-2">(GPA: {edu.gpa})</span>}
                                    </div>
                                    {(() => {
                                        const hl = edu.highlights || edu.achievements || [];
                                        return hl.length > 0 && hl.some((h: string) => h && h.trim()) ? (
                                            <div
                                                className="text-gray-700 mt-1 prose-sm prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                                                style={{ fontSize: "var(--resume-font-sm)" }}
                                                dangerouslySetInnerHTML={{ __html: hl.join("\n") }}
                                            />
                                        ) : null;
                                    })()}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case "projects":
                return projects.length > 0 && (
                    <section key="projects">
                        <h2
                            className="font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={{ borderColor: accent, color: accent, fontSize: "var(--resume-font-xs)" }}
                        >
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id} className="break-inside-avoid">
                                    <div className={cn("flex justify-between items-baseline mb-1", isRtl && "flex-row-reverse")}>
                                        <h3 className="font-semibold" style={{ fontSize: "var(--resume-font-base)" }}>{proj.name}</h3>
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
                            className="font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={{ borderColor: accent, color: accent, fontSize: "var(--resume-font-xs)" }}
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
                            className="font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={{ borderColor: accent, color: accent, fontSize: "var(--resume-font-xs)" }}
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
                            className="font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={{ borderColor: accent, color: accent, fontSize: "var(--resume-font-xs)" }}
                        >
                            Languages
                        </h2>
                        <div className="flex flex-wrap gap-2" style={{ fontSize: "var(--resume-font-sm)" }}>
                            {languages.map((lang) => {
                                const langName = lang.language || lang.name || "Language";
                                return (
                                    <div key={lang.id} className="inline-flex items-center gap-1.5 border border-neutral-200 px-2 py-0.5 text-neutral-800">
                                        <span className="font-semibold">{langName}</span>
                                        {lang.proficiency && (
                                            <span className="text-xs text-neutral-500">({lang.proficiency})</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="bg-white min-h-[1056px] h-auto transition-all duration-300"
            style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-font-base)",
                lineHeight: "var(--resume-line-height)",
                padding: "var(--resume-padding)",
                color: "#374151",
            }}
        >
            {/* Header - Centered */}
            <header className="text-center mb-8">
                <h1
                    className="font-normal uppercase tracking-[0.2em] mb-3"
                    style={{ color: accent, fontSize: "var(--resume-font-xxxl)" }}
                >
                    {profile.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 uppercase tracking-wider text-gray-500" style={{ fontSize: "var(--resume-font-xs)" }}>
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.location && <span>{profile.location}</span>}
                    {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: accent }}>
                            LinkedIn
                        </a>
                    )}
                    {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: accent }}>
                            Portfolio
                        </a>
                    )}
                </div>
            </header>

            <div className="space-y-8">
                {/* Summary */}
                {profile.summary && (
                    <section>
                        <div
                            className="text-justify prose-sm prose-p:my-0 font-normal"
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
