import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  calculateCareerReadinessScore,
  computePipelineMetrics,
  aggregateVoiceTelemetry,
  summarizeEngagement,
} from "@/lib/analytics/career-intelligence";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Aggregate all data streams in parallel
    const [
      resumesResult,
      eventsResult,
      applicationsResult,
      interviewsResult,
      atsResult,
      skillsGapsResult,
      salaryResult,
      snapshotResult,
    ] = await Promise.all([
      // 1. Resume metrics
      supabase
        .from("resumes")
        .select("id, title, view_count, last_viewed_at, updated_at, target_role")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),

      // 2. Resume events (last 90 days)
      supabase
        .from("resume_events")
        .select("id, event_type, created_at, browser, os, device, city, country")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true }),

      // 3. Application pipeline
      supabase
        .from("applications")
        .select("id, company, role, status, applied_at, updated_at")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false }),

      // 4. Interview sessions
      supabase
        .from("interview_sessions")
        .select("id, target_role, difficulty, question_count, answered_count, average_score, completed_at, created_at, session_mode, voice_analysis")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // 5. ATS history
      supabase
        .from("saved_ats_analyses")
        .select("id, resume_id, target_role, score, breakdown, missing_keywords, overall_feedback, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // 6. Skills gap trends
      supabase
        .from("saved_skills_gaps")
        .select("id, target_role, match_score, matching_skills, missing_hard_skills, missing_soft_skills, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // 7. Salary benchmarks
      supabase
        .from("saved_salary_insights")
        .select("id, target_role, location, low, median, high, market_demand, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // 8. Latest AI career trajectory snapshot
      supabase
        .from("career_analytics_snapshots")
        .select("id, data, created_at")
        .eq("user_id", user.id)
        .eq("snapshot_type", "trajectory_report")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const resumes = resumesResult.data || [];
    const events = eventsResult.data || [];
    const applications = applicationsResult.data || [];
    const interviews = interviewsResult.data || [];
    const atsAnalyses = atsResult.data || [];
    const skillsGaps = skillsGapsResult.data || [];
    const salaryInsights = salaryResult.data || [];
    const latestSnapshot = snapshotResult.data;

    // === Compute derived metrics ===
    const { totalViews, totalDownloads, totalViewEvents } = summarizeEngagement(resumes, events);
    const { pipeline, conversionRate } = computePipelineMetrics(applications);
    const { avgWpm, totalFillers, sessionCount } = aggregateVoiceTelemetry(interviews);

    // Interview performance
    const completedInterviews = interviews.filter((i: any) => i.completed_at);
    const avgInterviewScore = completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum: number, i: any) => sum + (parseFloat(i.average_score) || 0), 0) /
          completedInterviews.length
        )
      : 0;

    // Best ATS score
    const bestAtsScore = atsAnalyses.length > 0
      ? Math.max(...atsAnalyses.map((a: any) => a.score || 0))
      : 0;

    // Career readiness composite score
    const latestSkillsMatch = skillsGaps.length > 0 ? skillsGaps[0].match_score : 0;
    const careerReadinessScore = calculateCareerReadinessScore({
      bestAtsScore,
      avgInterviewScore,
      pipelineTotal: pipeline.total,
      latestSkillsMatch,
      totalViews,
    });

    return NextResponse.json({
      // KPI metrics
      kpi: {
        totalViews,
        totalDownloads,
        conversionRate,
        avgInterviewScore,
        bestAtsScore,
        careerReadinessScore,
        totalApplications: pipeline.total,
        completedInterviews: completedInterviews.length,
        totalInterviews: interviews.length,
      },

      // Pipeline funnel
      pipeline,

      // Raw data for charts
      resumes,
      events,
      applications,
      interviews,
      atsAnalyses,
      skillsGaps,
      salaryInsights,

      // Voice telemetry
      voiceTelemetry: {
        avgWpm,
        totalFillers,
        sessionCount,
      },

      // Cached AI report
      latestReport: latestSnapshot?.data || null,
      reportGeneratedAt: latestSnapshot?.created_at || null,
    });
  } catch (error) {
    console.error("[CAREER_INTELLIGENCE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
