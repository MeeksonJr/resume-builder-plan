/**
 * ResumeForge — Talent Marketplace & Reverse Job Board (Phase 64)
 * 
 * Enables candidates to set active hiring availability with masked anonymity.
 * Recruiters and engineering managers request introductions; candidate identity
 * (name, contact info, full resume) is revealed ONLY upon candidate approval.
 */

export type AvailabilityStatus = "actively_looking" | "open_to_offers" | "casually_browsing" | "not_available";

export interface CandidateMarketplaceProfile {
  id: string;
  userId: string;
  realName: string;
  email: string;
  headline: string;
  maskedHeadline: string; // e.g. "Staff Distributed Systems Engineer (Ex-FinTech Series C)"
  currentCompany: string;
  hideCurrentCompany: boolean;
  yearsExperience: number;
  primarySkills: string[];
  desiredRole: string;
  desiredSalaryMin: number;
  desiredSalaryMax: number;
  remotePreference: "Remote Only" | "Hybrid" | "On-Site" | "Any";
  availability: AvailabilityStatus;
  isAnonymous: boolean;
  atsScore: number;
  bioSnippet: string;
  createdAt: string;
}

export type IntroRequestStatus = "pending_review" | "approved" | "declined" | "intro_scheduled";

export interface RecruiterIntroRequest {
  id: string;
  candidateId: string;
  recruiterId: string;
  recruiterName: string;
  recruiterCompany: string;
  recruiterEmail: string;
  jobRole: string;
  salaryOffered: string;
  customPitch: string;
  status: IntroRequestStatus;
  requestedAt: string;
  respondedAt?: string;
}

export interface MaskedCandidateView {
  id: string;
  maskedHeadline: string;
  displayCompany: string;
  yearsExperience: number;
  primarySkills: string[];
  desiredRole: string;
  salaryRange: string;
  remotePreference: string;
  availability: AvailabilityStatus;
  atsScore: number;
  bioSnippet: string;
  isUnlocked: boolean;
  revealedInfo?: {
    realName: string;
    email: string;
    currentCompany: string;
  };
}

/**
 * Transforms a full candidate marketplace profile into a privacy-safe masked view
 */
export function getMaskedCandidateView(
  profile: CandidateMarketplaceProfile,
  introRequests: RecruiterIntroRequest[],
  currentRecruiterId?: string
): MaskedCandidateView {
  const isCandidateOwner = currentRecruiterId === profile.userId;
  const approvedIntro = currentRecruiterId
    ? introRequests.find(
        (r) => r.candidateId === profile.id && r.recruiterId === currentRecruiterId && r.status === "approved"
      )
    : undefined;

  const isUnlocked = isCandidateOwner || !!approvedIntro;

  return {
    id: profile.id,
    maskedHeadline: isUnlocked ? profile.headline : profile.maskedHeadline,
    displayCompany: isUnlocked
      ? profile.currentCompany
      : profile.hideCurrentCompany
      ? "Confidential / Stealth Employer"
      : profile.currentCompany,
    yearsExperience: profile.yearsExperience,
    primarySkills: profile.primarySkills,
    desiredRole: profile.desiredRole,
    salaryRange: `$${(profile.desiredSalaryMin / 1000).toFixed(0)}k - $${(profile.desiredSalaryMax / 1000).toFixed(0)}k`,
    remotePreference: profile.remotePreference,
    availability: profile.availability,
    atsScore: profile.atsScore,
    bioSnippet: profile.bioSnippet,
    isUnlocked,
    ...(isUnlocked
      ? {
          revealedInfo: {
            realName: profile.realName,
            email: profile.email,
            currentCompany: profile.currentCompany
          }
        }
      : {})
  };
}

/**
 * Creates a new confidential introduction request from a recruiter to a candidate
 */
export function createIntroRequest(
  candidateId: string,
  recruiter: {
    id: string;
    name: string;
    company: string;
    email: string;
    jobRole: string;
    salaryOffered: string;
    customPitch: string;
  }
): RecruiterIntroRequest {
  return {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    candidateId,
    recruiterId: recruiter.id,
    recruiterName: recruiter.name,
    recruiterCompany: recruiter.company,
    recruiterEmail: recruiter.email,
    jobRole: recruiter.jobRole,
    salaryOffered: recruiter.salaryOffered,
    customPitch: recruiter.customPitch,
    status: "pending_review",
    requestedAt: new Date().toISOString()
  };
}

/**
 * Updates an introduction request status
 */
export function respondToIntroRequest(
  request: RecruiterIntroRequest,
  decision: "approved" | "declined"
): RecruiterIntroRequest {
  return {
    ...request,
    status: decision,
    respondedAt: new Date().toISOString()
  };
}

/**
 * Sample marketplace pool for demo and instant browsing
 */
export const SAMPLE_MARKETPLACE_CANDIDATES: CandidateMarketplaceProfile[] = [
  {
    id: "cand-001",
    userId: "user-alpha",
    realName: "Elena Rostova",
    email: "elena.rostova@engineer.dev",
    headline: "Principal Distributed Systems Engineer at Stripe",
    maskedHeadline: "Principal Distributed Systems Engineer (Tier-1 Payments / High Throughput)",
    currentCompany: "Stripe",
    hideCurrentCompany: true,
    yearsExperience: 8,
    primarySkills: ["Go", "Kafka", "Rust", "Distributed Consensus", "PostgreSQL"],
    desiredRole: "Principal Engineer / Staff Systems Architect",
    desiredSalaryMin: 240000,
    desiredSalaryMax: 310000,
    remotePreference: "Remote Only",
    availability: "actively_looking",
    isAnonymous: true,
    atsScore: 98,
    bioSnippet: "Architected fault-tolerant settlement engines processing >$4B daily volume with 99.999% SLA.",
    createdAt: new Date().toISOString()
  },
  {
    id: "cand-002",
    userId: "user-beta",
    realName: "Marcus Vance",
    email: "marcus.vance@fullstack.io",
    headline: "Lead Full Stack & Next.js Architect at Vercel",
    maskedHeadline: "Lead Full Stack & Design Systems Engineer (Series B Unicorn)",
    currentCompany: "Vercel",
    hideCurrentCompany: false,
    yearsExperience: 6,
    primarySkills: ["TypeScript", "Next.js", "React 19", "Tailwind CSS", "Node.js"],
    desiredRole: "Senior / Staff Frontend Engineer",
    desiredSalaryMin: 185000,
    desiredSalaryMax: 230000,
    remotePreference: "Remote Only",
    availability: "open_to_offers",
    isAnonymous: true,
    atsScore: 95,
    bioSnippet: "Built micro-frontend platforms, design systems, and real-time collaborative editors for 500k+ MAU.",
    createdAt: new Date().toISOString()
  },
  {
    id: "cand-003",
    userId: "user-gamma",
    realName: "Amina Al-Mansoor",
    email: "amina.ai@research.org",
    headline: "Senior Machine Learning Engineer at Anthropic",
    maskedHeadline: "Senior AI / LLM Evaluation & Alignment Engineer (Top AI Lab)",
    currentCompany: "Anthropic",
    hideCurrentCompany: true,
    yearsExperience: 5,
    primarySkills: ["Python", "PyTorch", "vLLM", "RAG", "Agentic Orchestration"],
    desiredRole: "Lead AI Engineer / ML Architect",
    desiredSalaryMin: 220000,
    desiredSalaryMax: 280000,
    remotePreference: "Hybrid",
    availability: "actively_looking",
    isAnonymous: true,
    atsScore: 96,
    bioSnippet: "Led fine-tuning and safety benchmark pipelines for frontier reasoning models and autonomous agent swarms.",
    createdAt: new Date().toISOString()
  }
];
