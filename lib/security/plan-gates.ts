/**
 * Unified Plan Feature Gates & Quota Definitions
 * Single source of truth for Free vs. Pro tier entitlements.
 */

export type PlanTier = "free" | "pro";

export interface PlanLimits {
  maxResumes: number;
  maxCoverLetters: number;
  voiceInterviewAllowed: boolean;
  maxInterviewSessions: number;
  publicPortfolioAllowed: boolean;
  customSlugAllowed: boolean;
  autonomousSwarmAllowed: boolean;
  maxSwarmTasks: number;
  dailyCareerCoachLimit: number;
  dailySalaryQueriesLimit: number;
  maxAssessmentsPerMonth: number;
  autoAtsTailorAllowed: boolean;
  dedicatedJobMicrositeAllowed: boolean;
  removeBrandingAllowed: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxResumes: 1,
    maxCoverLetters: 1,
    voiceInterviewAllowed: false,
    maxInterviewSessions: 3,
    publicPortfolioAllowed: false,
    customSlugAllowed: false,
    autonomousSwarmAllowed: false,
    maxSwarmTasks: 1, // 1 trial task
    dailyCareerCoachLimit: 1,
    dailySalaryQueriesLimit: 1,
    maxAssessmentsPerMonth: 1,
    autoAtsTailorAllowed: false,
    dedicatedJobMicrositeAllowed: false,
    removeBrandingAllowed: false,
  },
  pro: {
    maxResumes: Infinity,
    maxCoverLetters: Infinity,
    voiceInterviewAllowed: true,
    maxInterviewSessions: Infinity,
    publicPortfolioAllowed: true,
    customSlugAllowed: true,
    autonomousSwarmAllowed: true,
    maxSwarmTasks: Infinity,
    dailyCareerCoachLimit: Infinity,
    dailySalaryQueriesLimit: Infinity,
    maxAssessmentsPerMonth: Infinity,
    autoAtsTailorAllowed: true,
    dedicatedJobMicrositeAllowed: true,
    removeBrandingAllowed: true,
  },
};

/**
 * Derives user's plan tier from profile data.
 * Checks both is_pro boolean and subscription_status ('active' or 'trialing').
 */
export function getUserPlanTier(profile?: {
  is_pro?: boolean | null;
  subscription_status?: string | null;
} | null): PlanTier {
  if (!profile) return "free";
  const isPro =
    profile.is_pro === true ||
    profile.subscription_status === "active" ||
    profile.subscription_status === "trialing";
  return isPro ? "pro" : "free";
}

/**
 * Checks whether an action is allowed based on current count and tier.
 */
export function checkPlanLimit(
  tier: PlanTier,
  feature: keyof PlanLimits,
  currentCount: number = 0
): {
  allowed: boolean;
  limit: number | boolean;
  remaining: number;
  upgradeRequired: boolean;
} {
  const limit = PLAN_LIMITS[tier][feature];

  if (typeof limit === "boolean") {
    return {
      allowed: limit,
      limit,
      remaining: limit ? Infinity : 0,
      upgradeRequired: !limit,
    };
  }

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    limit,
    remaining,
    upgradeRequired: !allowed,
  };
}
