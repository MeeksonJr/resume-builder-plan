import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Create admin Supabase client to bypass row RLS key checks securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

export async function GET(req: Request) {
    try {
        // 1. Authenticate API Key
        const authHeader = req.headers.get("Authorization");
        let token = "";

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // Fallback to query param
            const { searchParams } = new URL(req.url);
            token = searchParams.get("api_key") || "";
        }

        if (!token) {
            return new NextResponse("Unauthorized: Missing Bearer Token", { status: 401 });
        }

        // Hash token to compare with database
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        console.log("DEBUG: tokenHash", tokenHash, "service key loaded?", !!supabaseServiceKey);
        const { data: keyData, error: keyError } = await supabaseAdmin
            .from("user_api_keys")
            .select("user_id")
            .eq("token_hash", tokenHash)
            .single();

        if (keyError || !keyData) {
            console.error("DEBUG: auth error:", keyError);
            return new NextResponse("Unauthorized: Invalid API Token", { status: 401 });
        }

        const userId = keyData.user_id;

        // Update last used timestamp in background
        supabaseAdmin
            .from("user_api_keys")
            .update({ last_used_at: new Date().toISOString() })
            .eq("token_hash", tokenHash)
            .then(({ error }) => {
                if (error) console.error("Error updating key last_used_at:", error);
            });

        // 2. Fetch data
        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id");

        if (resumeId) {
            // Fetch detailed single resume in JSON Resume format
            const { data: resume, error: resumeError } = await supabaseAdmin
                .from("resumes")
                .select("*")
                .eq("id", resumeId)
                .eq("user_id", userId)
                .single();

            if (resumeError || !resume) {
                return new NextResponse("Resume not found", { status: 404 });
            }

            // Fetch all related sections to construct JSON Resume
            const [
                { data: personalInfo },
                { data: workExperiences },
                { data: education },
                { data: skills },
                { data: projects },
                { data: certifications },
                { data: languages },
            ] = await Promise.all([
                supabaseAdmin.from("personal_info").select("*").eq("resume_id", resumeId).single(),
                supabaseAdmin.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
            ]);

            // Convert to JSON Resume standard schema
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

        // Return summaries of all resumes owned by the user
        const { data: resumes, error: resumesError } = await supabaseAdmin
            .from("resumes")
            .select("id, title, slug, template_id, updated_at")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false });

        if (resumesError) {
            console.error("[DEVELOPER_API_RESUMES_ERROR]", resumesError);
            return new NextResponse("Error fetching resumes", { status: 500 });
        }

        return NextResponse.json(resumes);
    } catch (error) {
        console.error("[DEVELOPER_API_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
