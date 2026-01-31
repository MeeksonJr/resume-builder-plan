import { createClient } from "@/lib/supabase/server";
import { parseLinkedInData, ResumeData } from "@/lib/ai/index";
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

        const { linkedinText } = await req.json();

        if (!linkedinText || linkedinText.trim().length === 0) {
            return new NextResponse("LinkedIn profile text is required", { status: 400 });
        }

        // Parse LinkedIn data using AI
        const resumeData = await parseLinkedInData(linkedinText);

        // Create a new resume with the parsed data
        const { data: newResume, error: resumeError } = await supabase
            .from("resumes")
            .insert({
                user_id: user.id,
                title: `LinkedIn Import - ${resumeData.personalInfo.fullName || "Untitled"}`,
                template: "modern",
            })
            .select()
            .single();

        if (resumeError) throw resumeError;

        // Insert personal info
        if (resumeData.personalInfo) {
            await supabase.from("personal_info").insert({
                resume_id: newResume.id,
                full_name: resumeData.personalInfo.fullName,
                email: resumeData.personalInfo.email,
                phone: resumeData.personalInfo.phone,
                location: resumeData.personalInfo.location,
                linkedin: resumeData.personalInfo.linkedin,
                website: resumeData.personalInfo.website,
                github: resumeData.personalInfo.github,
                summary: resumeData.personalInfo.summary,
            });
        }

        // Insert work experiences
        if (resumeData.workExperience && resumeData.workExperience.length > 0) {
            const workExps = resumeData.workExperience.map((exp, idx) => ({
                resume_id: newResume.id,
                company: exp.company,
                position: exp.position,
                location: exp.location,
                start_date: exp.startDate,
                end_date: exp.endDate,
                is_current: exp.current || false,
                description: exp.description,
                sort_order: idx,
            }));
            await supabase.from("work_experiences").insert(workExps);
        }

        // Insert education
        if (resumeData.education && resumeData.education.length > 0) {
            const eduEntries = resumeData.education.map((edu, idx) => ({
                resume_id: newResume.id,
                institution: edu.institution,
                degree: edu.degree,
                field_of_study: edu.field,
                location: edu.location,
                start_date: edu.startDate,
                end_date: edu.endDate,
                sort_order: idx,
            }));
            await supabase.from("education").insert(eduEntries);
        }

        // Insert skills
        if (resumeData.skills && resumeData.skills.length > 0) {
            const skillEntries = resumeData.skills.map((skill, idx) => ({
                resume_id: newResume.id,
                name: skill.category || "Skills",
                skills: skill.items,
                sort_order: idx,
            }));
            await supabase.from("skills").insert(skillEntries);
        }

        // Insert projects
        if (resumeData.projects && resumeData.projects.length > 0) {
            const projectEntries = resumeData.projects.map((project, idx) => ({
                resume_id: newResume.id,
                name: project.name,
                description: project.description,
                technologies: project.technologies,
                url: project.url,
                sort_order: idx,
            }));
            await supabase.from("projects").insert(projectEntries);
        }

        // Insert certifications
        if (resumeData.certifications && resumeData.certifications.length > 0) {
            const certEntries = resumeData.certifications.map((cert, idx) => ({
                resume_id: newResume.id,
                name: cert.name,
                issuer: cert.issuer,
                date: cert.date,
                url: cert.url,
                sort_order: idx,
            }));
            await supabase.from("certifications").insert(certEntries);
        }

        // Insert languages
        if (resumeData.languages && resumeData.languages.length > 0) {
            const langEntries = resumeData.languages.map((lang, idx) => ({
                resume_id: newResume.id,
                language: lang.language,
                proficiency: lang.proficiency,
                sort_order: idx,
            }));
            await supabase.from("languages").insert(langEntries);
        }

        return NextResponse.json({
            resumeId: newResume.id,
            message: "LinkedIn profile successfully imported!"
        });
    } catch (error) {
        console.error("[LINKEDIN_IMPORT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
