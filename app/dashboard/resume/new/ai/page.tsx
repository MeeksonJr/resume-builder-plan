"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    ArrowRight,
    Sparkles,
    Loader2,
    CheckCircle2,
    X,
    Plus,
    Briefcase,
    GraduationCap,
    Lightbulb,
    Globe,
    Award,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
    { id: "role", title: "Career Goal", description: "What is your target position?", icon: <Sparkles className="h-5 w-5" /> },
    { id: "experience", title: "Work History", description: "Tell us about your past roles", icon: <Briefcase className="h-5 w-5" /> },
    { id: "education", title: "Education", description: "Your academic background", icon: <GraduationCap className="h-5 w-5" /> },
    { id: "skills_projects", title: "Skills & Projects", description: "What are you good at?", icon: <Lightbulb className="h-5 w-5" /> },
    { id: "personality", title: "Languages & Hobbies", description: "A bit more about you", icon: <Globe className="h-5 w-5" /> },
    { id: "achievements", title: "Key Achievements", description: "Your biggest wins", icon: <Award className="h-5 w-5" /> },
];

export default function AIResumeOnboarding() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        role: "",
        experienceLevel: "Intermediate",
        workHistory: "",
        education: "",
        projects: "",
        skills: [] as string[],
        newSkill: "",
        languages: "",
        hobbies: "",
        achievements: "",
        additionalInfo: "",
    });

    const handleAddSkill = () => {
        if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, formData.newSkill.trim()],
                newSkill: "",
            });
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((s) => s !== skill),
        });
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const loadingToast = toast.loading("AI is crafting your full resume...");

        try {
            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: formData.role,
                    experienceLevel: formData.experienceLevel,
                    workHistory: formData.workHistory,
                    education: formData.education,
                    projects: formData.projects,
                    skills: formData.skills,
                    languages: formData.languages,
                    hobbies: formData.hobbies,
                    achievements: formData.achievements,
                    additionalInfo: formData.additionalInfo,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate resume");
            }

            const { resumeData } = await response.json();

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("User not found");

            // 1. Create the resume entry
            const { data: resume, error: resumeError } = await supabase
                .from("resumes")
                .insert({
                    user_id: user.id,
                    title: `${formData.role} Resume (AI Generated)`,
                    template_id: "modern",
                })
                .select()
                .single();

            if (resumeError) throw resumeError;

            // 2. Insert Personal Info
            await supabase.from("personal_info").upsert({
                resume_id: resume.id,
                full_name: resumeData.personalInfo?.fullName || user.user_metadata?.full_name || "",
                email: resumeData.personalInfo?.email || user.email || "",
                phone: resumeData.personalInfo?.phone || "",
                location: resumeData.personalInfo?.location || "",
                summary: resumeData.personalInfo?.summary || "",
            });

            // 3. Insert Work Experience
            if (resumeData.workExperience?.length > 0) {
                await supabase.from("work_experiences").insert(
                    resumeData.workExperience.map((exp: any, index: number) => ({
                        resume_id: resume.id,
                        company: exp.company,
                        position: exp.position,
                        location: exp.location,
                        start_date: exp.startDate ? (exp.startDate.includes('-') ? (exp.startDate.split('-').length === 2 ? `${exp.startDate}-01` : exp.startDate) : `${exp.startDate}-01-01`) : null,
                        end_date: exp.endDate ? (exp.endDate.includes('-') ? (exp.endDate.split('-').length === 2 ? `${exp.endDate}-01` : exp.endDate) : `${exp.endDate}-01-01`) : null,
                        is_current: exp.current || false,
                        description: exp.description,
                        highlights: exp.highlights || [],
                        sort_order: index,
                    }))
                );
            }

            // 4. Insert Education
            if (resumeData.education?.length > 0) {
                await supabase.from("education").insert(
                    resumeData.education.map((edu: any, index: number) => ({
                        resume_id: resume.id,
                        institution: edu.institution,
                        degree: edu.degree,
                        field_of_study: edu.field,
                        location: edu.location,
                        start_date: edu.startDate ? (edu.startDate.includes('-') ? (edu.startDate.split('-').length === 2 ? `${edu.startDate}-01` : edu.startDate) : `${edu.startDate}-01-01`) : null,
                        end_date: edu.endDate ? (edu.endDate.includes('-') ? (edu.endDate.split('-').length === 2 ? `${edu.endDate}-01` : edu.endDate) : `${edu.endDate}-01-01`) : null,
                        achievements: edu.highlights || [],
                        sort_order: index,
                    }))
                );
            }

            // 5. Insert Skills
            if (resumeData.skills?.length > 0) {
                const flattenedSkills: any[] = [];
                resumeData.skills.forEach((skillGroup: any, groupIndex: number) => {
                    const items = Array.isArray(skillGroup.items) ? skillGroup.items : [];
                    items.forEach((skillName: string, skillIndex: number) => {
                        flattenedSkills.push({
                            resume_id: resume.id,
                            name: skillName,
                            category: skillGroup.category || "General",
                            sort_order: groupIndex * 100 + skillIndex,
                        });
                    });
                });
                if (flattenedSkills.length > 0) {
                    await supabase.from("skills").insert(flattenedSkills);
                }
            }

            // 6. Insert Projects
            if (resumeData.projects?.length > 0) {
                await supabase.from("projects").insert(
                    resumeData.projects.map((proj: any, index: number) => ({
                        resume_id: resume.id,
                        name: proj.name,
                        description: proj.description,
                        url: proj.url || "",
                        technologies: proj.technologies || [],
                        highlights: proj.highlights || [],
                        sort_order: index,
                    }))
                );
            }

            // 7. Insert Certifications
            if (resumeData.certifications?.length > 0) {
                await supabase.from("certifications").insert(
                    resumeData.certifications.map((cert: any, index: number) => ({
                        resume_id: resume.id,
                        name: cert.name,
                        issuer: cert.issuer,
                        issue_date: cert.date ? (cert.date.includes('-') ? (cert.date.split('-').length === 2 ? `${cert.date}-01` : cert.date) : `${cert.date}-01-01`) : null,
                        sort_order: index,
                    }))
                );
            }

            // 8. Insert Languages
            if (resumeData.languages?.length > 0) {
                await supabase.from("languages").insert(
                    resumeData.languages.map((lang: any, index: number) => ({
                        resume_id: resume.id,
                        name: lang.language,
                        proficiency: lang.proficiency || "Professional",
                        sort_order: index,
                    }))
                );
            }

            toast.success("Full resume generated!", { id: loadingToast });
            router.push(`/dashboard/resume/${resume.id}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong", { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl py-8 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard/resume/new">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Resume Builder</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {STEPS[currentStep].icon}
                            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${i <= currentStep ? "bg-primary" : "bg-muted"
                                }`}
                        />
                    ))}
                </div>
            </div>

            <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
                <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                    <CardTitle className="text-xl flex items-center gap-2">
                        {STEPS[currentStep].title}
                    </CardTitle>
                    <CardDescription>{STEPS[currentStep].description}</CardDescription>
                </div>

                <CardContent className="min-h-[400px] p-6 pt-8">
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="role">What is your target job title?</Label>
                                <Input
                                    id="role"
                                    placeholder="e.g., Senior Full Stack Engineer"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="text-lg py-6 border-primary/20 focus-visible:ring-primary"
                                />
                                <p className="text-xs text-muted-foreground">The AI uses this to tailor every section of your resume.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {["Entry", "Junior", "Intermediate", "Senior"].map((level) => (
                                        <Button
                                            key={level}
                                            type="button"
                                            variant={formData.experienceLevel === level ? "default" : "outline"}
                                            onClick={() => setFormData({ ...formData, experienceLevel: level })}
                                            className={`w-full ${formData.experienceLevel === level ? "shadow-md scale-105" : ""}`}
                                        >
                                            {level}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="workHistory">Briefly describe your job history</Label>
                                <Textarea
                                    id="workHistory"
                                    placeholder="e.g. 5 years at Google as a Dev, 2 years at a startup. I worked on cloud infrastructure and frontend."
                                    value={formData.workHistory}
                                    onChange={(e) => setFormData({ ...formData, workHistory: e.target.value })}
                                    className="min-h-[200px] text-base"
                                />
                                <p className="text-xs text-muted-foreground">Don't worry about formatting; the AI will structure this into professional entries.</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="education">What is your educational background?</Label>
                                <Textarea
                                    id="education"
                                    placeholder="e.g. BS in Computer Science from MIT (2018), AWS Certified Solutions Architect."
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                    className="min-h-[200px] text-base"
                                />
                                <p className="text-xs text-muted-foreground">Mention degrees, schools, and any major certifications.</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projects">Explain any key projects you've worked on</Label>
                                    <Textarea
                                        id="projects"
                                        placeholder="e.g. Built a custom CRM for a local business using React/Node. Contributed to open source projects like VS Code."
                                        value={formData.projects}
                                        onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newSkill">Add your top skills</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="newSkill"
                                            placeholder="e.g., TypeScript, AWS, Team Leadership"
                                            value={formData.newSkill}
                                            onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                                        />
                                        <Button type="button" onClick={handleAddSkill}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {formData.skills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1 gap-1">
                                                {skill}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                    onClick={() => removeSkill(skill)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="languages">Languages</Label>
                                    <Input
                                        id="languages"
                                        placeholder="e.g. English (Native), Spanish (Fluent)"
                                        value={formData.languages}
                                        onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hobbies">Hobbies / Interests</Label>
                                    <Input
                                        id="hobbies"
                                        placeholder="e.g. Chess, Hiking, Piano"
                                        value={formData.hobbies}
                                        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="additionalInfo">Anything else to include?</Label>
                                <Textarea
                                    id="additionalInfo"
                                    placeholder="e.g. I have a 10-year gap in employment due to parenting. I'm looking for a career change."
                                    value={formData.additionalInfo}
                                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="achievements">
                                    Describe your biggest professional accomplishments
                                </Label>
                                <Textarea
                                    id="achievements"
                                    placeholder="e.g. Increased regional sales by 30% in one year. Mentored 10 junior developers. Developed a patent-pending algorithm."
                                    value={formData.achievements}
                                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                    className="min-h-[200px] text-base leading-relaxed"
                                />
                            </div>
                            <div className="rounded-lg bg-primary/10 p-4 border border-primary/20 shadow-inner">
                                <div className="flex gap-3">
                                    <Sparkles className="h-6 w-6 text-primary shrink-0 mt-0.5 animate-pulse" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-primary">Ready to launch!</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            The AI will now synthesize all your input into a <strong>complete, multi-section resume</strong> tailored specifically for the <strong>{formData.role}</strong> role. Any missing details will be filled with expert-crafted placeholders.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t bg-muted/30 p-6">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isGenerating}
                    >
                        Back
                    </Button>
                    {currentStep === STEPS.length - 1 ? (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !formData.role}
                            className="gap-2 px-8 bg-primary hover:bg-primary/90 shadow-lg transition-all active:scale-95"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Crafting Resume...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate Full Resume
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={isGenerating} className="gap-2 px-8 transition-all active:scale-95">
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>AI will generate smart placeholders for any missing info</span>
            </div>
        </div>
    );
}
