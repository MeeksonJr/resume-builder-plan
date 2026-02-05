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
        console.log("[GITHUB_IMPORT_DEBUG] Received:", { resumeId, url });

        if (!resumeId || !url) {
            console.log("[GITHUB_IMPORT_DEBUG] Missing fields");
            return new NextResponse("Resume ID and repository URL are required", { status: 400 });
        }

        // Parse owner and repo from URL
        let normalizedUrl = url.trim();
        // Ensure protocol
        if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        // Remove www.
        normalizedUrl = normalizedUrl.replace("://www.github.com", "://github.com");

        let repoFullName = "";
        try {
            const urlObj = new URL(normalizedUrl);
            if (urlObj.hostname !== "github.com") {
                console.log("[GITHUB_IMPORT_DEBUG] Invalid hostname:", urlObj.hostname);
                return new NextResponse("Invalid GitHub URL. Must be github.com", { status: 400 });
            }
            const pathParts = urlObj.pathname.split("/").filter(Boolean);
            if (pathParts.length < 2) {
                console.log("[GITHUB_IMPORT_DEBUG] Invalid path:", urlObj.pathname);
                return new NextResponse("Invalid GitHub URL. Must contain owner/repo", { status: 400 });
            }
            repoFullName = `${pathParts[0]}/${pathParts[1]}`;
        } catch (e) {
            console.log("[GITHUB_IMPORT_DEBUG] URL Parse failed:", e);
            return new NextResponse("Invalid URL format", { status: 400 });
        }

        console.log("[GITHUB_IMPORT_DEBUG] Target Repo:", repoFullName);

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
