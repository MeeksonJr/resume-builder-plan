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

        const { resumeId, url } = await req.json();

        if (!resumeId || !url) {
            return new NextResponse("Resume ID and repository URL are required", { status: 400 });
        }

        // Parse owner and repo from URL
        // Expected format: https://github.com/owner/repo or just github.com/owner/repo
        const urlParts = url.replace("https://", "").replace("http://", "").split("/");
        const githubIndex = urlParts.indexOf("github.com");

        if (githubIndex === -1 || urlParts.length < githubIndex + 3) {
            return new NextResponse("Invalid GitHub URL", { status: 400 });
        }

        const owner = urlParts[githubIndex + 1];
        const repo = urlParts[githubIndex + 2];
        const repoFullName = `${owner}/${repo}`;

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

        // Fetch Repo Metadata and README content from GitHub
        let repoData = null;
        let readmeContent = null;

        try {
            const [repoResponse, readmeResponse] = await Promise.all([
                fetch(`https://api.github.com/repos/${repoFullName}`, {
                    headers: {
                        "Accept": "application/vnd.github.v3+json",
                        "User-Agent": "ResumeForge",
                    },
                }),
                fetch(`https://api.github.com/repos/${repoFullName}/readme`, {
                    headers: {
                        "Accept": "application/vnd.github.v3.raw",
                        "User-Agent": "ResumeForge",
                    },
                })
            ]);

            if (repoResponse.ok) {
                repoData = await repoResponse.json();
            } else {
                return new NextResponse("Repository not found or private", { status: 404 });
            }

            if (readmeResponse.ok) {
                readmeContent = await readmeResponse.text();
            }
        } catch (error) {
            console.error("GitHub API Error:", error);
            return new NextResponse("Failed to fetch GitHub data", { status: 500 });
        }

        // Generate project description using AI
        const projectData = await generateProjectFromRepo(
            repoData.name,
            repoData.description || "No description provided",
            repoData.language || "Unknown",
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
                url: url,
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
