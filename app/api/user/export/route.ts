import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch all user data
        const [profile, resumes, events, applications, coverLetters] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("resumes").select("*").eq("user_id", user.id),
            supabase.from("resume_events").select("*").eq("user_id", user.id),
            supabase.from("applications").select("*").eq("user_id", user.id),
            supabase.from("cover_letters").select("*").eq("user_id", user.id),
        ])

        // For each resume, get all related data
        const resumesWithDetails = await Promise.all(
            (resumes.data || []).map(async (resume) => {
                const [
                    workExperiences,
                    education,
                    skills,
                    projects,
                    certifications,
                    languages,
                ] = await Promise.all([
                    supabase
                        .from("work_experiences")
                        .select("*")
                        .eq("resume_id", resume.id)
                        .order("sort_order"),
                    supabase
                        .from("education")
                        .select("*")
                        .eq("resume_id", resume.id)
                        .order("sort_order"),
                    supabase
                        .from("skills")
                        .select("*")
                        .eq("resume_id", resume.id)
                        .order("sort_order"),
                    supabase
                        .from("projects")
                        .select("*")
                        .eq("resume_id", resume.id)
                        .order("sort_order"),
                    supabase
                        .from("certifications")
                        .select("*")
                        .eq("resume_id", resume.id)
                        .order("sort_order"),
                    supabase
                        .from("languages")
                        .select("*")
                        .eq("resume_id", resume.id)
                        .order("sort_order"),
                ])

                return {
                    ...resume,
                    work_experiences: workExperiences.data || [],
                    education: education.data || [],
                    skills: skills.data || [],
                    projects: projects.data || [],
                    certifications: certifications.data || [],
                    languages: languages.data || [],
                }
            })
        )

        const exportData = {
            export_date: new Date().toISOString(),
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
            },
            profile: profile.data,
            resumes: resumesWithDetails,
            events: events.data || [],
            applications: applications.data || [],
            cover_letters: coverLetters.data || [],
        }

        return NextResponse.json(exportData)
    } catch (error: any) {
        console.error("Export error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to export data" },
            { status: 500 }
        )
    }
}
