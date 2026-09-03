import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { scrapeLiveJobs, calculateJobATSScore } from "@/lib/scrapers/jobs-scraper";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedResumeId = searchParams.get("resumeId");
    let query = searchParams.get("query");
    const location = searchParams.get("location") || "Remote";

    // 1. Fetch user's resumes to populate resume switcher
    const { data: userResumes } = await supabase
      .from("resumes")
      .select("id, title, target_role, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    const resumesList = userResumes || [];
    const activeResume = requestedResumeId
      ? resumesList.find(r => r.id === requestedResumeId) || resumesList[0]
      : resumesList[0];

    // 2. Determine target role query if not explicitly passed
    if (!query) {
      if (activeResume?.target_role) {
        query = activeResume.target_role;
      } else {
        // Check profile target role
        const { data: profile } = await supabase
          .from("profiles")
          .select("target_role")
          .eq("id", user.id)
          .single();

        query = profile?.target_role || "Software Engineer";
      }
    }

    const searchQuery = query || "Software Engineer";

    // 3. Fetch candidate's skills & summary for ATS matching
    let candidateSkills: string[] = [];
    let summaryText = "";

    if (activeResume) {
      const [{ data: skillsData }, { data: personalInfo }] = await Promise.all([
        supabase.from("skills").select("name, skills").eq("resume_id", activeResume.id),
        supabase.from("personal_info").select("summary").eq("resume_id", activeResume.id).maybeSingle(),
      ]);

      summaryText = personalInfo?.summary || "";
      if (skillsData && skillsData.length > 0) {
        skillsData.forEach(s => {
          if (Array.isArray(s.skills) && s.skills.length > 0) {
            candidateSkills.push(...s.skills);
          } else if (s.name) {
            candidateSkills.push(s.name);
          }
        });
      }
    }

    // Fallback if resume has no skills: check global skills table
    if (candidateSkills.length === 0) {
      const { data: globalSkills } = await supabase
        .from("skills")
        .select("name")
        .eq("user_id", user.id);
      candidateSkills = globalSkills?.map(s => s.name) || ["React", "TypeScript", "JavaScript", "Git"];
    }

    // 4. Fetch existing tracked applications to flag jobs already in tracker
    const { data: existingApps } = await supabase
      .from("applications")
      .select("id, company, role, status")
      .eq("user_id", user.id);

    const trackedMap = new Map<string, string>();
    (existingApps || []).forEach(app => {
      const key = `${app.company.toLowerCase()}-${app.role.toLowerCase()}`;
      trackedMap.set(key, app.id);
    });

    // 5. Scrape live jobs
    const jobs = await scrapeLiveJobs(searchQuery, location);

    // 6. Calculate ATS match score & track status for each job
    const enrichedJobs = jobs.map(job => {
      const { match_score, matching_skills, missing_skills } = calculateJobATSScore(
        job.description,
        job.requirements,
        candidateSkills,
        summaryText
      );

      const trackingKey = `${job.company.toLowerCase()}-${job.role.toLowerCase()}`;
      const isTracked = trackedMap.has(trackingKey);

      return {
        ...job,
        match_score,
        matching_skills,
        missing_skills,
        is_tracked: isTracked,
        tracked_id: trackedMap.get(trackingKey) || undefined,
      };
    });

    return NextResponse.json({
      jobs: enrichedJobs,
      resumes: resumesList.map(r => ({ id: r.id, title: r.title })),
      activeResume: activeResume ? { id: activeResume.id, title: activeResume.title, targetRole: searchQuery } : null,
      query: searchQuery,
      location,
      candidateSkillsCount: candidateSkills.length,
    });
  } catch (error: any) {
    console.error("[JOBS_FEED_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs feed" }, { status: 500 });
  }
}
