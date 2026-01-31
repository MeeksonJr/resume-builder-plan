import { createClient } from "@/lib/supabase/server";
import { generateProjectFromRepo } from "@/lib/ai/index";
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

        const { resumeId, repoFullName, repoName, repoDescription, repoLanguage, repoUrl } = await req.json();

        if (!resumeId || !repoFullName) {
            return new NextResponse("Resume ID and repository name are required", { status: 400 });
        }

        // Verify resume ownership
        const { data: resume } = await supabase
            .from("resumes")
            .select("id")
            .eq("id", resumeId)
            .eq("user_id", user.id)
            .single();

        if (!resume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        // Fetch README content from GitHub
        let readmeContent = null;
        try {
            const readmeResponse = await fetch(
                `https://api.github.com/repos/${repoFullName}/readme`,
                {
                    headers: {
                        "Accept": "application/vnd.github.v3.raw",
                        "User-Agent": "ResumeForge",
                    },
                }
            );
            if (readmeResponse.ok) {
                readmeContent = await readmeResponse.text();
            }
        } catch (error) {
            console.warn("Could not fetch README, proceeding without it");
        }

        // Generate project description using AI
        const projectData = await generateProjectFromRepo(
            repoName,
            repoDescription,
            repoLanguage,
            readmeContent
        );

        // Get current project count for sort order
        const { count } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("resume_id", resumeId);

        // Insert project into database
        const { data: newProject, error: projectError } = await supabase
            .from("projects")
            .insert({
                resume_id: resumeId,
                name: projectData.name,
                description: projectData.highlights.join("\n"),
                technologies: projectData.technologies,
                url: repoUrl,
                sort_order: count || 0,
            })
            .select()
            .single();

        if (projectError) throw projectError;

        return NextResponse.json({
            project: newProject,
            message: "GitHub project successfully imported!"
        });
    } catch (error) {
        console.error("[GITHUB_IMPORT_ERROR]", error);
        return new NextResponse("Failed to import GitHub project", { status: 500 });
    }
}
