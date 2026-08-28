import { createClient } from "@/lib/supabase/server";
import { analyzeSkillsGap } from "@/lib/ai/index";
import { ResumeData } from "@/lib/ai/index";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check plan-wise daily rate limits
        const { allowed, isPro } = await checkRateLimit("skills_gap");
        if (!allowed) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "LIMIT_EXCEEDED", 
                    message: isPro 
                        ? "You have reached your daily limit for Skills Gap Audits." 
                        : "Free users can only run 1 Skills Gap Audit per day. Please upgrade to Pro for unlimited access." 
                }), 
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        const { resumeId, targetRole } = await req.json();

        if (!resumeId || !targetRole) {
            return new NextResponse("Missing required fields (resumeId, targetRole)", { status: 400 });
        }

        // 1. Fetch resume and related data
        const { data: resume } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", resumeId)
            .eq("user_id", user.id)
            .single();

        if (!resume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        const [
            { data: personalInfo },
            { data: workExperiences },
            { data: education },
            { data: skills },
            { data: projects },
            { data: certifications },
            { data: languages },
        ] = await Promise.all([
            supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
            supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
        ]);

        // 2. Format as ResumeData for lib/ai
        const resumeData: ResumeData = {
            personalInfo: {
                fullName: personalInfo?.full_name || undefined,
                email: personalInfo?.email || undefined,
                phone: personalInfo?.phone || undefined,
                location: personalInfo?.location || undefined,
                linkedin: personalInfo?.linkedin || undefined,
                website: personalInfo?.website || undefined,
                github: personalInfo?.github || undefined,
                summary: personalInfo?.summary || undefined,
            },
            workExperience: (workExperiences || []).map(exp => ({
                company: exp.company || "",
                position: exp.position || "",
                location: exp.location || undefined,
                startDate: exp.start_date || undefined,
                endDate: exp.end_date || undefined,
                current: exp.is_current || false,
                description: exp.description || "",
            })),
            education: (education || []).map(edu => ({
                institution: edu.institution || "",
                degree: edu.degree || undefined,
                field: edu.field_of_study || undefined,
                location: edu.location || undefined,
                startDate: edu.start_date || undefined,
                endDate: edu.end_date || undefined,
            })),
            skills: (skills || []).map(s => ({
                items: s.skills || [],
                category: s.name || "Skills",
            })),
            projects: (projects || []).map(p => ({
                name: p.name || "",
                description: p.description || "",
                technologies: p.technologies || [],
                url: p.url || undefined,
            })),
            certifications: (certifications || []).map(c => ({
                name: c.name || "",
                issuer: c.issuer || "",
                date: c.date || undefined,
                url: c.url || undefined,
            })),
            languages: (languages || []).map(l => ({
                language: l.language || "",
                proficiency: l.proficiency || "",
            })),
        };

        // 3. Run skills gap analysis
        const analysis = await analyzeSkillsGap(resumeData, targetRole);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("[SKILLS_GAP_ANALYSIS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
