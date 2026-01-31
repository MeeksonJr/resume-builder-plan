import { createClient } from "@/lib/supabase/server";
import { getInterviewFeedback, ResumeData } from "@/lib/ai/index";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { resumeId, jobDescription, question, answer } = await req.json();

        if (!resumeId || !jobDescription || !question || !answer) {
            return new NextResponse("Missing required fields", { status: 400 });
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
            supabase.from("personal_info").select("*").eq("resume_id", resumeId).single(),
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
                fullName: personalInfo?.full_name,
                email: personalInfo?.email,
                phone: personalInfo?.phone,
                location: personalInfo?.location,
                linkedin: personalInfo?.linkedin,
                website: personalInfo?.website,
                github: personalInfo?.github,
                summary: personalInfo?.summary,
            },
            workExperience: (workExperiences || []).map(exp => ({
                company: exp.company,
                position: exp.position,
                location: exp.location,
                startDate: exp.start_date,
                endDate: exp.end_date,
                current: exp.is_current,
                description: exp.description,
            })),
            education: (education || []).map(edu => ({
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field_of_study,
                location: edu.location,
                startDate: edu.start_date,
                endDate: edu.end_date,
            })),
            skills: (skills || []).map(s => ({
                items: s.skills || [],
                category: s.name,
            })),
            projects: (projects || []).map(p => ({
                name: p.name,
                description: p.description,
                technologies: p.technologies || [],
                url: p.url,
            })),
            certifications: (certifications || []).map(c => ({
                name: c.name,
                issuer: c.issuer,
                date: c.date,
                url: c.url,
            })),
            languages: (languages || []).map(l => ({
                language: l.language,
                proficiency: l.proficiency,
            })),
        };

        // 3. Get feedback
        const feedback = await getInterviewFeedback(question, answer, resumeData, jobDescription);

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("[INTERVIEW_FEEDBACK_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
