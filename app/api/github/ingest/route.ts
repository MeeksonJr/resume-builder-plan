import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ingestGitHubProject } from "@/lib/scrapers/github-importer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { input, maxRepos } = await req.json();

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "GitHub repository URL or username is required." },
        { status: 400 }
      );
    }

    const result = await ingestGitHubProject(input.trim(), {
      maxRepos: maxRepos ? Number(maxRepos) : 6,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GITHUB_INGEST_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to ingest GitHub project." },
      { status: 500 }
    );
  }
}
