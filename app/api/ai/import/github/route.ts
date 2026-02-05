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

        const { resumeId, username } = await req.json();
        console.log("[GITHUB_IMPORT_DEBUG] Received:", { resumeId, username });

        if (!resumeId || !username) {
            return new NextResponse("Resume ID and GitHub username are required", { status: 400 });
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

        // Fetch user's top repositories from GitHub
        let repos = [];
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5&type=owner`, {
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "ResumeForge",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return new NextResponse("GitHub user not found", { status: 404 });
                }
                const text = await response.text();
                console.error("[GITHUB_IMPORT_DEBUG] GitHub API Error:", text);
                return new NextResponse(`GitHub API Error: ${response.statusText}`, { status: response.status });
            }

            repos = await response.json();
        } catch (error) {
            console.error("[GITHUB_IMPORT_DEBUG] Failed to fetch repos:", error);
            return new NextResponse("Failed to connect to GitHub", { status: 500 });
        }

        if (!repos || repos.length === 0) {
            return new NextResponse("No public repositories found for this user", { status: 404 });
        }

        // Filter out forks if desired, or keep them. For now, we take the top ones.
        // We will process the top 3 most relevant repos (highest stars or most recently updated is already sort=updated)
        // Let's re-sort by stars to get the most impressive ones, or keep recent?
        // Let's stick to the top 3 from the API response (which are most recently updated) to be safe for quotas.
        const topRepos = repos.slice(0, 3);
        const importedProjects = [];

        for (const repo of topRepos) {
            try {
                // Fetch README content
                let readmeContent = null;
                try {
                    const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
                        headers: {
                            "Accept": "application/vnd.github.v3.raw",
                            "User-Agent": "ResumeForge",
                        },
                    });
                    if (readmeResponse.ok) readmeContent = await readmeResponse.text();
                } catch (e) {
                    // Ignore README errors
                }

                // Generate project description using AI
                const projectData = await generateProjectFromRepo(
                    repo.name,
                    repo.description || "No description provided",
                    repo.language || "Unknown",
                    readmeContent
                );

                // Insert project into database
                // Get current count for sort order
                const { count } = await supabase
                    .from("projects")
                    .select("*", { count: "exact", head: true })
                    .eq("resume_id", resumeId);

                const { data: newProject } = await supabase
                    .from("projects")
                    .insert({
                        resume_id: resumeId,
                        name: projectData.name,
                        description: projectData.highlights.join("\n"),
                        technologies: projectData.technologies,
                        url: repo.html_url,
                        sort_order: (count || 0),
                    })
                    .select()
                    .single();

                if (newProject) importedProjects.push(newProject);

            } catch (err) {
                console.error(`[GITHUB_IMPORT_DEBUG] Failed to import repo ${repo.full_name}:`, err);
                // Continue to next repo
            }
        }

        return NextResponse.json({
            count: importedProjects.length,
            projects: importedProjects,
            message: `Successfully imported ${importedProjects.length} projects from GitHub!`
        });

    } catch (error: any) {
        console.error("[GITHUB_IMPORT_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
