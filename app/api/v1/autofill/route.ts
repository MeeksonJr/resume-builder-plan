import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

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
            const { searchParams } = new URL(req.url);
            token = searchParams.get("api_key") || "";
        }

        if (!token) {
            return new NextResponse("Unauthorized: Missing Bearer Token", { status: 401 });
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const { data: keyData, error: keyError } = await supabaseAdmin
            .from("user_api_keys")
            .select("user_id")
            .eq("token_hash", tokenHash)
            .single();

        if (keyError || !keyData) {
            return new NextResponse("Unauthorized: Invalid API Token", { status: 401 });
        }

        const userId = keyData.user_id;

        // Update key usage timestamp
        supabaseAdmin
            .from("user_api_keys")
            .update({ last_used_at: new Date().toISOString() })
            .eq("token_hash", tokenHash)
            .then(({ error }) => {
                if (error) console.error("Error updating key usage:", error);
            });

        // 2. Fetch User Profile & Resumes
        const { searchParams } = new URL(req.url);
        let resumeId = searchParams.get("resume_id");

        // If no specific resume is requested, default to the most recently updated resume
        if (!resumeId) {
            const { data: latestResume } = await supabaseAdmin
                .from("resumes")
                .select("id")
                .eq("user_id", userId)
                .order("updated_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (latestResume) {
                resumeId = latestResume.id;
            }
        }

        // Fetch general profile as fallback
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        let autofillContext: any = {
            personal: {
                firstName: "",
                lastName: "",
                fullName: profile?.full_name || "",
                email: "",
                phone: "",
                website: profile?.website_url || "",
                linkedin: "",
                github: "",
                location: profile?.location || "",
                city: "",
                country: "",
                summary: profile?.bio || "",
            },
            workExperience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: []
        };

        // Split name helpers
        if (autofillContext.personal.fullName) {
            const parts = autofillContext.personal.fullName.split(" ");
            autofillContext.personal.firstName = parts[0] || "";
            autofillContext.personal.lastName = parts.slice(1).join(" ") || "";
        }

        // Parse location helpers
        if (autofillContext.personal.location) {
            const parts = autofillContext.personal.location.split(",");
            autofillContext.personal.city = parts[0]?.trim() || "";
            autofillContext.personal.country = parts[parts.length - 1]?.trim() || "";
        }

        // 3. Query detailed resume tables if resume exists
        if (resumeId) {
            const [
                { data: personalInfo },
                { data: workExperiences },
                { data: education },
                { data: skills },
                { data: projects },
                { data: certifications },
                { data: languages },
            ] = await Promise.all([
                supabaseAdmin.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
                supabaseAdmin.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
                supabaseAdmin.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
            ]);

            if (personalInfo) {
                const fullName = personalInfo.full_name || autofillContext.personal.fullName;
                const parts = fullName.split(" ");
                autofillContext.personal = {
                    firstName: parts[0] || "",
                    lastName: parts.slice(1).join(" ") || "",
                    fullName,
                    email: personalInfo.email || "",
                    phone: personalInfo.phone || "",
                    website: personalInfo.website || autofillContext.personal.website,
                    linkedin: personalInfo.linkedin || "",
                    github: personalInfo.github || "",
                    location: personalInfo.location || autofillContext.personal.location,
                    city: personalInfo.location ? personalInfo.location.split(",")[0]?.trim() : autofillContext.personal.city,
                    country: personalInfo.location ? personalInfo.location.split(",").slice(-1)[0]?.trim() : autofillContext.personal.country,
                    summary: personalInfo.summary || autofillContext.personal.summary,
                };
            }

            if (workExperiences) {
                autofillContext.workExperience = workExperiences.map((exp: any) => ({
                    company: exp.company || "",
                    position: exp.position || "",
                    location: exp.location || "",
                    startDate: exp.start_date || "",
                    endDate: exp.end_date || null,
                    current: !exp.end_date,
                    description: exp.description || "",
                }));
            }

            if (education) {
                autofillContext.education = education.map((edu: any) => ({
                    institution: edu.institution || "",
                    degree: edu.degree || "",
                    fieldOfStudy: edu.field_of_study || "",
                    startDate: edu.start_date || "",
                    endDate: edu.end_date || "",
                    gpa: edu.gpa || "",
                }));
            }

            if (skills) {
                // Flatten skills into string array
                autofillContext.skills = Array.from(new Set(
                    skills.flatMap((s: any) => s.skills || [])
                ));
            }

            if (projects) {
                autofillContext.projects = projects.map((proj: any) => ({
                    name: proj.name || "",
                    description: proj.description || "",
                    technologies: proj.technologies || [],
                    url: proj.url || "",
                }));
            }

            if (certifications) {
                autofillContext.certifications = certifications.map((cert: any) => ({
                    name: cert.name || "",
                    issuer: cert.issuer || "",
                    date: cert.date || "",
                    url: cert.url || "",
                }));
            }

            if (languages) {
                autofillContext.languages = languages.map((lang: any) => ({
                    name: lang.name || "",
                    proficiency: lang.proficiency || "",
                }));
            }
        }

        return NextResponse.json(autofillContext);
    } catch (error) {
        console.error("[AUTOFILL_API_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
