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
}

export const MinimalTemplate = ({ data }: TemplateProps) => {
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
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={borderStyle}
                        >
                            Experience
                        </h2>
                        <div className="space-y-5">
                            {workExperiences.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-base">{exp.position}</h3>
                                        <span className="text-xs text-gray-500 italic">
                                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                                        </span>
                                    </div>
                                    <div className="text-sm mb-2">
                                        <span className="font-medium">{exp.company}</span>
                                        {exp.location && <span className="text-gray-500">, {exp.location}</span>}
                                    </div>
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-gray-700">
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
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={borderStyle}
                        >
                            Education
                        </h2>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-base">{edu.institution}</h3>
                                        <span className="text-xs text-gray-500 italic">
                                            {edu.start_date} – {edu.end_date}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span>{edu.degree} in {edu.field_of_study}</span>
                                        {edu.gpa && <span className="text-gray-500 ml-2">(GPA: {edu.gpa})</span>}
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
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={borderStyle}
                        >
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-base">{proj.name}</h3>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline italic">
                                                View Project
                                            </a>
                                        )}
                                    </div>
                                    {proj.technologies.length > 0 && (
                                        <div className="text-xs text-gray-500 mb-1 italic">
                                            {proj.technologies.join(", ")}
                                        </div>
                                    )}
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-gray-700">
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
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={borderStyle}
                        >
                            Skills
                        </h2>
                        <p className="text-sm leading-6">
                            {skills.map(s => s.name).join(" • ")}
                        </p>
                    </section>
                );
            case "certifications":
                return certifications.length > 0 && (
                    <section key="certifications">
                        <h2
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={borderStyle}
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
                            className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4"
                            style={borderStyle}
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
                "bg-white p-10 min-h-[1056px] h-full transition-all duration-300",
                visualConfig.fontSize === "small" ? "text-[13px]" : visualConfig.fontSize === "large" ? "text-[16px]" : "text-[14px]",
                visualConfig.lineHeight === "tight" ? "leading-tight" : visualConfig.lineHeight === "relaxed" ? "leading-relaxed" : "leading-normal"
            )}
            style={{ fontFamily: visualConfig.fontFamily, color: "#374151" }}
        >
            {/* Header - Centered */}
            <header className="text-center mb-8">
                <h1
                    className="text-3xl font-normal uppercase tracking-[0.2em] mb-3"
                    style={{ color: visualConfig.accentColor }}
                >
                    {profile.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-gray-500">
                    {profile.email && <span>{profile.email}</span>}
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.location && <span>{profile.location}</span>}
                    {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:underline">
                            LinkedIn
                        </a>
                    )}
                    {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noreferrer" className="hover:underline">
                            Portfolio
                        </a>
                    )}
                </div>
            </header>

            <div className="space-y-8">
                {/* Summary */}
                {profile.summary && (
                    <section>
                        <p className="text-sm leading-7 text-justify">{profile.summary}</p>
                    </section>
                )}

                {sectionOrder.map(renderSection)}
            </div>
        </div>
    );
};
