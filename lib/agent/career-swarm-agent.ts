/**
 * ResumeAI Pro — Autonomous Career Agent Swarm (Phase 60)
 * 
 * 24/7 Multi-Agent Orchestrator:
 * - Scout Agent: Discovers opportunities matching candidate's preferences & salary targets.
 * - Tailor Agent: Generates optimized resume variants tailored to detected ATS keywords.
 * - Auditor Agent: Enforces quality gates and compliance (vetting hallucination & requirements).
 * - Dispatcher Agent: Executes automated form fill submissions or queues for 1-click candidate approval.
 */

export interface SwarmPreferences {
  enabled: boolean;
  mode: "autonomous" | "human_approval";
  maxDailyApplications: number;
  minMatchScore: number;
  targetTitles: string[];
  targetLocations: string[];
  minBaseSalary: number;
  blacklistedCompanies: string[];
  autoTailorResume: boolean;
}

export interface SwarmTask {
  id: string;
  jobId: string;
  company: string;
  role: string;
  location: string;
  estimatedSalary: number;
  matchScore: number;
  portalType: "greenhouse" | "lever" | "workday" | "ashby" | "linkedin" | "indeed";
  portalUrl: string;
  status: "scouted" | "tailoring" | "tailored" | "pending_approval" | "dispatched" | "rejected";
  appliedAt?: string;
  tailoredResumeId?: string;
  auditNotes: string[];
}

export interface SwarmMetrics {
  totalScouted: number;
  tailoredCount: number;
  dispatchedToday: number;
  pendingApprovalCount: number;
  averageMatchScore: number;
}

export const DEFAULT_SWARM_PREFERENCES: SwarmPreferences = {
  enabled: true,
  mode: "human_approval",
  maxDailyApplications: 10,
  minMatchScore: 82,
  targetTitles: ["Staff Software Engineer", "Senior Fullstack Engineer", "AI Solutions Architect"],
  targetLocations: ["San Francisco, CA", "Remote", "New York, NY"],
  minBaseSalary: 175000,
  blacklistedCompanies: ["RevokedCorp", "SpamAgency LLC"],
  autoTailorResume: true,
};

export const MOCK_SWARM_TASKS: SwarmTask[] = [
  {
    id: "task-01",
    jobId: "gh-8912",
    company: "Stripe",
    role: "Staff Software Engineer - Developer Platform",
    location: "Remote / San Francisco",
    estimatedSalary: 235000,
    matchScore: 94,
    portalType: "greenhouse",
    portalUrl: "https://boards.greenhouse.io/stripe/jobs/8912",
    status: "pending_approval",
    auditNotes: ["94% ATS keyword overlap", "Salary exceeds $175k baseline", "Work authorization confirmed"],
  },
  {
    id: "task-02",
    jobId: "lv-4510",
    company: "Linear",
    role: "Senior Fullstack Engineer - Realtime Core",
    location: "Remote",
    estimatedSalary: 195000,
    matchScore: 91,
    portalType: "lever",
    portalUrl: "https://jobs.lever.co/linear/4510",
    status: "dispatched",
    appliedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    auditNotes: ["Tailored resume #linear-v2 attached", "Dispatched via 1-click autofill"],
  },
  {
    id: "task-03",
    jobId: "as-1102",
    company: "Vercel",
    role: "Senior Next.js & Edge Infrastructure Engineer",
    location: "Remote (US)",
    estimatedSalary: 210000,
    matchScore: 88,
    portalType: "ashby",
    portalUrl: "https://jobs.ashbyhq.com/vercel/1102",
    status: "tailoring",
    auditNotes: ["Synthesizing Edge Runtime & Turbopack achievements"],
  },
];

/**
 * Filter jobs according to candidate swarm preferences
 */
export function evaluateJobForSwarm(
  job: {
    company: string;
    role: string;
    salary: number;
    matchScore: number;
  },
  prefs: SwarmPreferences
): { eligible: boolean; reason?: string } {
  if (!prefs.enabled) {
    return { eligible: false, reason: "Swarm is currently paused" };
  }

  if (prefs.blacklistedCompanies.some(c => c.toLowerCase() === job.company.toLowerCase())) {
    return { eligible: false, reason: `Company ${job.company} is on candidate blacklist` };
  }

  if (job.matchScore < prefs.minMatchScore) {
    return { eligible: false, reason: `Match score ${job.matchScore}% below minimum threshold of ${prefs.minMatchScore}%` };
  }

  if (job.salary < prefs.minBaseSalary) {
    return { eligible: false, reason: `Salary $${job.salary.toLocaleString()} below minimum expectation of $${prefs.minBaseSalary.toLocaleString()}` };
  }

  return { eligible: true };
}

/**
 * Compute aggregate metrics across swarm tasks
 */
export function calculateSwarmMetrics(tasks: SwarmTask[]): SwarmMetrics {
  const totalScouted = tasks.length;
  const tailoredCount = tasks.filter(t => t.status === "tailored" || t.status === "dispatched" || t.status === "pending_approval").length;
  const dispatchedToday = tasks.filter(t => t.status === "dispatched").length;
  const pendingApprovalCount = tasks.filter(t => t.status === "pending_approval").length;
  
  const totalScore = tasks.reduce((sum, t) => sum + t.matchScore, 0);
  const averageMatchScore = tasks.length > 0 ? Math.round(totalScore / tasks.length) : 0;

  return {
    totalScouted,
    tailoredCount,
    dispatchedToday,
    pendingApprovalCount,
    averageMatchScore,
  };
}
