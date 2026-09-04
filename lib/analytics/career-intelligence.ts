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
