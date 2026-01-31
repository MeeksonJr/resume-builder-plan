import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");

        if (!username) {
            return new NextResponse("GitHub username is required", { status: 400 });
        }

        // Fetch public repositories from GitHub API
        const response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
            {
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "ResumeForge",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch GitHub repositories");
        }

        const repos = await response.json();

        // Filter and format repositories
        const formattedRepos = repos
            .filter((repo: any) => !repo.fork && !repo.private)
            .map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                url: repo.html_url,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                updatedAt: repo.updated_at,
                topics: repo.topics || [],
            }));

        return NextResponse.json(formattedRepos);
    } catch (error) {
        console.error("[GITHUB_REPOS_ERROR]", error);
        return new NextResponse("Failed to fetch repositories", { status: 500 });
    }
}
