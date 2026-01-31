import { createClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/ai";
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

        const { resumeId, jobDescription, recipientName, companyName, jobTitle } = await req.json();

        if (!resumeId || !jobDescription) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Fetch resume data
        const [
            { data: profile },
            { data: workExperiences },
            { data: education },
            { data: skills },
            { data: projects },
            { data: certifications },
            { data: languages },
        ] = await Promise.all([
            supabase.from("profiles").select("*").single(),
            supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
        ]);

        const resumeData = {
            personalInfo: profile || {},
            workExperience: workExperiences || [],
            education: education || [],
            skills: skills || [],
            projects: projects || [],
            certifications: certifications || [],
            languages: languages || [],
        };

        const content = await generateCoverLetter(
            resumeData as any,
            jobDescription,
            { name: recipientName, company: companyName, title: jobTitle }
        );

        // Save to database
        const { data: coverLetter, error } = await supabase
            .from("cover_letters")
            .insert({
                user_id: user.id,
                resume_id: resumeId,
                title: `Cover Letter - ${companyName || jobTitle || "Untitled"}`,
                content,
                recipient_name: recipientName,
                company_name: companyName,
                job_title: jobTitle,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(coverLetter);
    } catch (error) {
        console.error("[API] Cover letter error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
