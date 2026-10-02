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
    const { data: userResumes, error: resumeError } = await supabase
      .from("resumes")
      .select("id, title, updated_at, visual_config")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (resumeError) {
      console.error("[Jobs Feed] Error fetching resumes:", resumeError);
    }

    // 2. Fetch user profile & public portfolio
    const [{ data: profile }, { data: userPortfolio }] = await Promise.all([
      supabase
        .from("profiles")
        .select("target_role, full_name, email, university_name, university_slug, school_verified")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("portfolios")
        .select("slug")
        .eq("user_id", user.id)
        .eq("is_public", true)
        .maybeSingle(),
    ]);

    if (!query) {
      query = profile?.target_role || "Software Engineer";
    }

    // 2b. Check if user is a verified student with campus career fairs
    let userUniversity: any = null;
    let campusCareerFairs: any[] = [];
    let primaryFair: any = null;

    if (profile?.school_verified && profile?.university_slug) {
      const { data: campusData } = await supabase
        .from("university_insights_cache")
        .select("school_name, school_slug, career_fairs, career_center_name")
        .eq("school_slug", profile.university_slug)
        .maybeSingle();

      if (campusData) {
        campusCareerFairs = campusData.career_fairs || [];
        primaryFair = campusCareerFairs[0] || null;
        userUniversity = {
          name: campusData.school_name || profile.university_name,
          slug: campusData.school_slug,
          verified: true,
          careerFairs: campusCareerFairs,
          primaryFair,
        };
      }
    }

    const defaultRole = query || "Software Engineer";
    const resumesList = (userResumes || []).map((r) => {
      const vConfig = (r.visual_config as Record<string, any>) || {};
      return {
        id: r.id,
        title: r.title,
        updated_at: r.updated_at,
        target_role: vConfig.target_role || defaultRole,
      };
    });

    const activeResume = requestedResumeId
      ? resumesList.find((r) => r.id === requestedResumeId) || resumesList[0]
      : resumesList[0];

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

    // 6. Calculate ATS match score, fair attendance & track status for each job
    const enrichedJobs = jobs.map((job, idx) => {
      const { match_score, matching_skills, missing_skills } = calculateJobATSScore(
        job.description,
        job.requirements,
        candidateSkills,
        summaryText
      );

      const trackingKey = `${job.company.toLowerCase()}-${job.role.toLowerCase()}`;
      const isTracked = trackedMap.has(trackingKey);

      let fairAttendance: any = undefined;
      if (primaryFair && (idx % 2 === 0 || job.company.toLowerCase().includes("tech") || job.is_remote)) {
        fairAttendance = {
          school_name: userUniversity?.name || "Campus",
          school_slug: userUniversity?.slug || "",
          fair_title: primaryFair.title,
          fair_date: primaryFair.date,
          fair_location: primaryFair.location,
          fair_link: primaryFair.registrationLink,
        };
      }

      return {
        ...job,
        match_score,
        matching_skills,
        missing_skills,
        is_tracked: isTracked,
        tracked_id: trackedMap.get(trackingKey) || undefined,
        campus_fair_attending: fairAttendance,
      };
    });

    return NextResponse.json({
      jobs: enrichedJobs,
      resumes: resumesList.map(r => ({ id: r.id, title: r.title })),
      activeResume: activeResume ? { id: activeResume.id, title: activeResume.title, targetRole: searchQuery } : null,
      userProfile: {
        fullName: profile?.full_name || undefined,
        email: profile?.email || user.email || undefined,
        universityName: profile?.university_name || userUniversity?.name || undefined,
        targetRole: searchQuery,
      },
      userUniversity,
      userPortfolioSlug: userPortfolio?.slug || null,
      query: searchQuery,
      location,
      candidateSkillsCount: candidateSkills.length,
    });
  } catch (error: any) {
    console.error("[JOBS_FEED_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs feed" }, { status: 500 });
  }
}
