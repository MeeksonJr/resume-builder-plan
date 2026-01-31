import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const format = searchParams.get("format");

        // Fetch resume and verify ownership
        const { data: resume } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (!resume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        // If JSON Resume format is requested
        if (format === "json") {
            // Fetch all resume data
            const [
                { data: personalInfo },
                { data: workExperiences },
                { data: education },
                { data: skills },
                { data: projects },
                { data: certifications },
                { data: languages },
            ] = await Promise.all([
                supabase.from("personal_info").select("*").eq("resume_id", id).single(),
                supabase.from("work_experiences").select("*").eq("resume_id", id).order("sort_order"),
                supabase.from("education").select("*").eq("resume_id", id).order("sort_order"),
                supabase.from("skills").select("*").eq("resume_id", id).order("sort_order"),
                supabase.from("projects").select("*").eq("resume_id", id).order("sort_order"),
                supabase.from("certifications").select("*").eq("resume_id", id).order("sort_order"),
                supabase.from("languages").select("*").eq("resume_id", id).order("sort_order"),
            ]);

            // Convert to JSON Resume standard
            const jsonResume = {
                $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
                basics: {
                    name: personalInfo?.full_name || "",
                    label: personalInfo?.title || "",
                    email: personalInfo?.email || "",
                    phone: personalInfo?.phone || "",
                    url: personalInfo?.website || "",
                    summary: personalInfo?.summary || "",
                    location: {
                        address: "",
                        postalCode: "",
                        city: personalInfo?.location || "",
                        countryCode: "",
                        region: "",
                    },
                    profiles: [
                        personalInfo?.linkedin && {
                            network: "LinkedIn",
                            username: "",
                            url: personalInfo.linkedin,
                        },
                        personalInfo?.github && {
                            network: "GitHub",
                            username: "",
                            url: personalInfo.github,
                        },
                    ].filter(Boolean),
                },
                work: (workExperiences || []).map((exp: any) => ({
                    name: exp.company,
                    position: exp.position,
                    location: exp.location,
                    startDate: exp.start_date,
                    endDate: exp.end_date,
                    summary: exp.description || "",
                    highlights: exp.description ? exp.description.split("\n").filter(Boolean) : [],
                })),
                education: (education || []).map((edu: any) => ({
                    institution: edu.institution,
                    area: edu.field_of_study,
                    studyType: edu.degree,
                    startDate: edu.start_date,
                    endDate: edu.end_date,
                    score: edu.gpa,
                })),
                skills: (skills || []).flatMap((skillGroup: any) =>
                    (skillGroup.skills || []).map((s: string) => ({
                        name: s,
                        level: "",
                        keywords: [],
                    }))
                ),
                projects: (projects || []).map((proj: any) => ({
                    name: proj.name,
                    description: proj.description,
                    highlights: proj.description ? proj.description.split("\n").filter(Boolean) : [],
                    keywords: proj.technologies || [],
                    url: proj.url,
                    startDate: "",
                    endDate: "",
                })),
                certificates: (certifications || []).map((cert: any) => ({
                    name: cert.name,
                    date: cert.date,
                    issuer: cert.issuer,
                    url: cert.url,
                })),
                languages: (languages || []).map((lang: any) => ({
                    language: lang.name,
                    fluency: lang.proficiency,
                })),
                meta: {
                    canonical: `https://resumeforge.app/r/${resume.slug}`,
                    version: "v1.0.0",
                    lastModified: resume.updated_at,
                },
            };

            return NextResponse.json(jsonResume);
        }

        // Default response: return resume metadata
        return NextResponse.json(resume);
    } catch (error) {
        console.error("[RESUME_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
