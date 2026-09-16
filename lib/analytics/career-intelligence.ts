export interface CareerReadinessInput {
  bestAtsScore: number;
  avgInterviewScore: number;
  pipelineTotal: number;
  latestSkillsMatch: number;
  totalViews: number;
}

export interface ApplicationRecord {
  status: "applied" | "interviewing" | "offered" | "rejected" | "archived" | string;
}

export interface PipelineMetrics {
  applied: number;
  interviewing: number;
  offered: number;
  rejected: number;
  archived: number;
  total: number;
}

export interface VoiceTelemetryRecord {
  session_mode?: string | null;
  voice_analysis?: {
    averageWpm?: number;
    totalFillers?: number;
  } | null;
}

/**
 * Computes the Career Readiness composite index (0 - 100).
 * Formula: 30% ATS + 25% Interview + 20% Pipeline Activity + 15% Skills Match + 10% Engagement
 */
export function calculateCareerReadinessScore(input: CareerReadinessInput): number {
  const bestAts = Math.max(0, Math.min(100, input.bestAtsScore || 0));
  const avgInterview = Math.max(0, Math.min(100, input.avgInterviewScore || 0));
  const pipelineActivity = Math.min(100, (input.pipelineTotal || 0) * 10);
  const skillsMatch = Math.max(0, Math.min(100, input.latestSkillsMatch || 0));
  const engagement = Math.min(100, (input.totalViews || 0) * 5);

  return Math.round(
    bestAts * 0.3 +
    avgInterview * 0.25 +
    pipelineActivity * 0.2 +
    skillsMatch * 0.15 +
    engagement * 0.1
  );
}

/**
 * Computes application pipeline breakdown and conversion rate.
 */
export function computePipelineMetrics(applications: ApplicationRecord[]): {
  pipeline: PipelineMetrics;
  conversionRate: number;
} {
  const pipeline: PipelineMetrics = {
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offered: applications.filter((a) => a.status === "offered").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    archived: applications.filter((a) => a.status === "archived").length,
    total: applications.length,
  };

  const conversionRate =
    pipeline.total > 0
      ? Math.round((pipeline.offered / pipeline.total) * 100)
      : 0;

  return { pipeline, conversionRate };
}

/**
 * Aggregates voice telemetry from speech-enabled mock interview sessions.
 */
export function aggregateVoiceTelemetry(sessions: VoiceTelemetryRecord[]): {
  avgWpm: number;
  totalFillers: number;
  sessionCount: number;
} {
  const voiceSessions = sessions.filter(
    (s) => s.voice_analysis && s.session_mode === "voice"
  );

  const avgWpm =
    voiceSessions.length > 0
      ? Math.round(
          voiceSessions.reduce(
            (sum, s) => sum + (s.voice_analysis?.averageWpm || 0),
            0
          ) / voiceSessions.length
        )
      : 0;

  const totalFillers = voiceSessions.reduce(
    (sum, s) => sum + (s.voice_analysis?.totalFillers || 0),
    0
  );

  return {
    avgWpm,
    totalFillers,
    sessionCount: voiceSessions.length,
  };
}

/**
 * Summarizes resume views and downloads.
 */
export function summarizeEngagement(
  resumes: Array<{ view_count?: number | null }>,
  events: Array<{ event_type: string }>
): {
  totalViews: number;
  totalDownloads: number;
  totalViewEvents: number;
} {
  const totalViews = resumes.reduce(
    (sum, r) => sum + (r.view_count || 0),
    0
  );
  const totalDownloads = events.filter((e) => e.event_type === "download").length;
  const totalViewEvents = events.filter((e) => e.event_type === "view").length;

  return { totalViews, totalDownloads, totalViewEvents };
}

export interface ResumeVariantMetrics {
  resumeId: string;
  resumeTitle: string;
  applicationsCount: number;
  interviewsCount: number;
  offersCount: number;
  interviewRate: number; // percentage 0-100
  offerRate: number; // percentage 0-100
}

export interface ABTestExperimentResult {
  hasExperimentData: boolean;
  totalTestedApplications: number;
  variants: ResumeVariantMetrics[];
  variantA: ResumeVariantMetrics | null;
  variantB: ResumeVariantMetrics | null;
  winnerVariant: "A" | "B" | "tie" | "insufficient_data";
  winnerTitle: string | null;
  relativeLift: number; // e.g. +35%
  statisticalConfidence: "high" | "directional" | "insufficient_data";
  recommendation: string;
}

/**
 * Computes A/B resume testing metrics across tracked job applications (Phase 42)
 */
export function computeABTestAnalytics(
  applications: Array<{ id: string; status: string; resume_id?: string | null }>,
  resumes: Array<{ id: string; title: string }>
): ABTestExperimentResult {
  const resumeMap = new Map<string, string>();
  resumes.forEach((r) => resumeMap.set(r.id, r.title || "Untitled Resume"));

  // Group applications by resume_id
  const groups: Record<string, { total: number; interviews: number; offers: number }> = {};

  applications.forEach((app) => {
    if (!app.resume_id) return;
    if (!groups[app.resume_id]) {
      groups[app.resume_id] = { total: 0, interviews: 0, offers: 0 };
    }
    groups[app.resume_id].total += 1;
    if (app.status === "interviewing" || app.status === "offered") {
      groups[app.resume_id].interviews += 1;
    }
    if (app.status === "offered") {
      groups[app.resume_id].offers += 1;
    }
  });

  const variants: ResumeVariantMetrics[] = Object.entries(groups)
    .map(([resumeId, counts]) => {
      const interviewRate = counts.total > 0 ? Math.round((counts.interviews / counts.total) * 100) : 0;
      const offerRate = counts.total > 0 ? Math.round((counts.offers / counts.total) * 100) : 0;
      return {
        resumeId,
        resumeTitle: resumeMap.get(resumeId) || "Untitled Resume",
        applicationsCount: counts.total,
        interviewsCount: counts.interviews,
        offersCount: counts.offers,
        interviewRate,
        offerRate,
      };
    })
    .sort((a, b) => b.applicationsCount - a.applicationsCount);

  const totalTested = variants.reduce((sum, v) => sum + v.applicationsCount, 0);

  if (variants.length === 0) {
    return {
      hasExperimentData: false,
      totalTestedApplications: 0,
      variants: [],
      variantA: null,
      variantB: null,
      winnerVariant: "insufficient_data",
      winnerTitle: null,
      relativeLift: 0,
      statisticalConfidence: "insufficient_data",
      recommendation: "Tag your job applications with target resumes in Kanban to activate A/B testing analytics.",
    };
  }

  const variantA = variants[0];
  const variantB = variants.length > 1 ? variants[1] : null;

  if (!variantB) {
    return {
      hasExperimentData: true,
      totalTestedApplications: totalTested,
      variants,
      variantA,
      variantB: null,
      winnerVariant: "insufficient_data",
      winnerTitle: variantA.resumeTitle,
      relativeLift: 0,
      statisticalConfidence: "insufficient_data",
      recommendation: `Currently tracking "${variantA.resumeTitle}". Submit applications with a second resume variant to run an A/B test.`,
    };
  }

  // Calculate lift and winner between A and B
  let winnerVariant: "A" | "B" | "tie" | "insufficient_data" = "tie";
  let winnerTitle: string | null = null;
  let relativeLift = 0;

  if (variantA.interviewRate > variantB.interviewRate) {
    winnerVariant = "A";
    winnerTitle = variantA.resumeTitle;
    const base = Math.max(1, variantB.interviewRate);
    relativeLift = Math.round(((variantA.interviewRate - variantB.interviewRate) / base) * 100);
  } else if (variantB.interviewRate > variantA.interviewRate) {
    winnerVariant = "B";
    winnerTitle = variantB.resumeTitle;
    const base = Math.max(1, variantA.interviewRate);
    relativeLift = Math.round(((variantB.interviewRate - variantA.interviewRate) / base) * 100);
  } else {
    winnerVariant = "tie";
    winnerTitle = null;
    relativeLift = 0;
  }

  const minSample = Math.min(variantA.applicationsCount, variantB.applicationsCount);
  let statisticalConfidence: "high" | "directional" | "insufficient_data" = "insufficient_data";
  if (minSample >= 8 && Math.abs(relativeLift) >= 20) {
    statisticalConfidence = "high";
  } else if (minSample >= 3) {
    statisticalConfidence = "directional";
  }

  let recommendation = "";
  if (winnerVariant === "A") {
    recommendation = `Variant A ("${variantA.resumeTitle}") is outperforming Variant B by +${relativeLift}% in interview callbacks. Prioritize using Variant A for new job applications.`;
  } else if (winnerVariant === "B") {
    recommendation = `Variant B ("${variantB.resumeTitle}") is outperforming Variant A by +${relativeLift}% in interview callbacks. Consider switching your default resume to Variant B.`;
  } else {
    recommendation = "Both resume variants are performing similarly. Continue collecting more application data for statistical separation.";
  }

  return {
    hasExperimentData: true,
    totalTestedApplications: totalTested,
    variants,
    variantA,
    variantB,
    winnerVariant,
    winnerTitle,
    relativeLift,
    statisticalConfidence,
    recommendation,
  };
}

