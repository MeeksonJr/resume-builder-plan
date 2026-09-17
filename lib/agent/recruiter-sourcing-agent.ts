/**
 * ResumeForge Autonomous Recruiter Sourcing Agent (Phase 67)
 * Scans incoming reverse job board intro requests, qualifies against candidate criteria,
 * and auto-replies with personalized availability schedules and calendar links.
 */

import { RecruiterIntroRequest, CandidateMarketplaceProfile } from "@/lib/marketplace/reverse-job-board";

export interface SourcingAgentConfig {
  enabled: boolean;
  autoReplyMode: "auto_qualify_and_schedule" | "draft_for_approval";
  minSalaryThreshold: number;
  requiredSkills: string[];
  blacklistedCompanies: string[];
  calendarBookingUrl: string;
  availabilitySlotsSummary: string; // e.g. "Tuesdays & Thursdays, 1:00 PM - 5:00 PM PT"
  candidateTimezone: string;
  preferredCallDuration: "15_min_screen" | "30_min_deep_dive";
}

export type QualificationStatus = "qualified_scheduled" | "needs_clarification" | "politely_declined";

export interface SourcingEvaluationResult {
  requestId: string;
  recruiterCompany: string;
  jobRole: string;
  matchScore: number;
  status: QualificationStatus;
  evaluationReasons: string[];
  generatedReplyMessage: string;
  suggestedAction: "auto_dispatched" | "pending_candidate_review";
  evaluatedAt: string;
}

export interface SourcingAgentStats {
  totalScanned: number;
  qualifiedAndScheduled: number;
  pendingClarification: number;
  declinedUnmatched: number;
  averageResponseTimeSec: number;
}

export const DEFAULT_AGENT_CONFIG: SourcingAgentConfig = {
  enabled: true,
  autoReplyMode: "auto_qualify_and_schedule",
  minSalaryThreshold: 185000,
  requiredSkills: ["TypeScript", "React", "Next.js", "System Design"],
  blacklistedCompanies: ["CryptoCasino Ltd", "SpamRecruiters Inc"],
  calendarBookingUrl: "https://cal.com/candidate/intro-chat",
  availabilitySlotsSummary: "Tuesdays and Thursdays between 1:00 PM and 5:00 PM PT",
  candidateTimezone: "America/Los_Angeles",
  preferredCallDuration: "15_min_screen",
};

/**
 * Parses numeric salary from offer strings like "$190k - $220k", "$210,000", or "200k".
 */
export function extractSalaryOfferAmount(salaryStr: string): number {
  if (!salaryStr) return 0;
  const cleaned = salaryStr.toLowerCase().replace(/,/g, "");
  const kMatches = cleaned.match(/(\d+)\s*k/);
  if (kMatches && kMatches[1]) {
    return parseInt(kMatches[1], 10) * 1000;
  }
  const digitsMatches = cleaned.match(/(\d{5,})/);
  if (digitsMatches && digitsMatches[1]) {
    return parseInt(digitsMatches[1], 10);
  }
  return 0;
}

/**
 * Autonomous evaluation and auto-reply synthesis for an incoming recruiter intro request.
 */
export function evaluateRecruiterRequest(
  request: RecruiterIntroRequest,
  candidate: CandidateMarketplaceProfile,
  config: SourcingAgentConfig = DEFAULT_AGENT_CONFIG
): SourcingEvaluationResult {
  const reasons: string[] = [];
  let score = 70; // baseline

  // 1. Check blacklisted companies
  const isBlacklisted = config.blacklistedCompanies.some((b) =>
    request.recruiterCompany.toLowerCase().includes(b.toLowerCase())
  );
  if (isBlacklisted) {
    return {
      requestId: request.id,
      recruiterCompany: request.recruiterCompany,
      jobRole: request.jobRole,
      matchScore: 10,
      status: "politely_declined",
      evaluationReasons: ["Company matches candidate exclusion blacklist"],
      generatedReplyMessage: `Hi ${request.recruiterName}, thank you for reaching out. At this time, I am focusing my search on other domains and must respectfully decline. Best of luck with your hiring!`,
      suggestedAction: "auto_dispatched",
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 2. Check salary alignment
  const offeredSalary = extractSalaryOfferAmount(request.salaryOffered);
  if (offeredSalary > 0) {
    if (offeredSalary >= config.minSalaryThreshold) {
      score += 20;
      reasons.push(`Target compensation verified ($${offeredSalary.toLocaleString()} >= $${config.minSalaryThreshold.toLocaleString()})`);
    } else {
      score -= 25;
      reasons.push(`Offered compensation ($${offeredSalary.toLocaleString()}) is below target threshold ($${config.minSalaryThreshold.toLocaleString()})`);
    }
  } else {
    reasons.push("Compensation band unstated in initial inquiry");
  }

  // 3. Check role alignment
  const roleLower = request.jobRole.toLowerCase();
  const desiredLower = candidate.desiredRole.toLowerCase();
  if (roleLower.includes("senior") || roleLower.includes("staff") || roleLower.includes("lead")) {
    score += 10;
    reasons.push("Senior/Staff leadership leveling detected");
  }

  // 4. Check pitch personalization
  if (request.customPitch.length > 120) {
    score += 10;
    reasons.push("High-effort, personalized outreach pitch");
  }

  // Decision logic: If compensation is unstated, require clarification first
  if (offeredSalary === 0) {
    const clarificationReply = `Hi ${request.recruiterName},\n\nThank you for getting in touch about the ${request.jobRole} role at ${request.recruiterCompany}. To ensure our conversation is productive and mutually aligned before putting time on the calendar, could you share the approved total compensation band (Base + Equity) and whether this position is open to remote or hybrid (${candidate.remotePreference})?\n\nLooking forward to hearing from you!\n\nBest,\n${candidate.realName || "Candidate"}`;

    return {
      requestId: request.id,
      recruiterCompany: request.recruiterCompany,
      jobRole: request.jobRole,
      matchScore: Math.min(score, 74),
      status: "needs_clarification",
      evaluationReasons: reasons,
      generatedReplyMessage: clarificationReply,
      suggestedAction: "pending_candidate_review",
      evaluatedAt: new Date().toISOString(),
    };
  }

  if (score >= 75) {
    const reply = `Hi ${request.recruiterName},\n\nThank you for reaching out regarding the ${request.jobRole} position at ${request.recruiterCompany}! The technical focus and mission align closely with my current search priorities.\n\nI'd be glad to schedule an initial introductory discussion. You can pick any time that works for you on my direct calendar here:\n${config.calendarBookingUrl}\n\nI am generally open on ${config.availabilitySlotsSummary} (${config.candidateTimezone}). Looking forward to connecting!\n\nBest regards,\n${candidate.realName || "Candidate"}`;

    return {
      requestId: request.id,
      recruiterCompany: request.recruiterCompany,
      jobRole: request.jobRole,
      matchScore: Math.min(98, score),
      status: "qualified_scheduled",
      evaluationReasons: reasons,
      generatedReplyMessage: reply,
      suggestedAction: config.autoReplyMode === "auto_qualify_and_schedule" ? "auto_dispatched" : "pending_candidate_review",
      evaluatedAt: new Date().toISOString(),
    };
  }

  return {
    requestId: request.id,
    recruiterCompany: request.recruiterCompany,
    jobRole: request.jobRole,
    matchScore: score,
    status: "politely_declined",
    evaluationReasons: reasons,
    generatedReplyMessage: `Hi ${request.recruiterName},\n\nThank you for considering me for the ${request.jobRole} opportunity at ${request.recruiterCompany}. Given my current target parameters, I am unable to move forward with this role right now. Thank you for your time and I wish you success with the search!\n\nBest,\n${candidate.realName || "Candidate"}`,
    suggestedAction: config.autoReplyMode === "auto_qualify_and_schedule" ? "auto_dispatched" : "pending_candidate_review",
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Batch scans a list of incoming recruiter intro requests.
 */
export function runSourcingAgentBatch(
  requests: RecruiterIntroRequest[],
  candidate: CandidateMarketplaceProfile,
  config: SourcingAgentConfig = DEFAULT_AGENT_CONFIG
): {
  evaluations: SourcingEvaluationResult[];
  stats: SourcingAgentStats;
} {
  const evaluations = requests.map((req) => evaluateRecruiterRequest(req, candidate, config));

  const stats: SourcingAgentStats = {
    totalScanned: evaluations.length,
    qualifiedAndScheduled: evaluations.filter((e) => e.status === "qualified_scheduled").length,
    pendingClarification: evaluations.filter((e) => e.status === "needs_clarification").length,
    declinedUnmatched: evaluations.filter((e) => e.status === "politely_declined").length,
    averageResponseTimeSec: 14,
  };

  return { evaluations, stats };
}
