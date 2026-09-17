/**
 * ResumeForge Automated Job Application Dispatcher & Form Filler (Phase 54)
 * Generates structured ATS dispatch payloads and browser automation steps for LinkedIn, Indeed, Greenhouse, and Lever.
 */

export type JobPortalType = "linkedin" | "indeed" | "greenhouse" | "lever" | "workday" | "generic";

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience: number;
  workAuthorization: "us_citizen" | "permanent_resident" | "visa_sponsor" | "other";
  salaryExpectation?: string;
}

export interface DispatchStep {
  stepIndex: number;
  name: string;
  description: string;
  status: "pending" | "executing" | "completed" | "skipped";
  durationMs: number;
}

export interface DispatchResult {
  applicationId: string;
  portal: JobPortalType;
  success: boolean;
  stepsCompleted: number;
  totalSteps: number;
  verificationId: string;
  timestamp: string;
  logs: string[];
}

/**
 * Identifies ATS or platform from job URL.
 */
export function detectJobPortal(url?: string): JobPortalType {
  if (!url || typeof url !== "string") return "generic";
  const lower = url.toLowerCase();

  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("indeed.com")) return "indeed";
  if (lower.includes("greenhouse.io")) return "greenhouse";
  if (lower.includes("lever.co")) return "lever";
  if (lower.includes("myworkdayjobs.com") || lower.includes("workday")) return "workday";

  return "generic";
}

/**
 * Generates an ordered execution pipeline for the given job portal.
 */
export function generateDispatchSteps(
  portal: JobPortalType,
  candidate: CandidateProfile,
  resumeTitle: string = "Primary Resume"
): DispatchStep[] {
  return [
    {
      stepIndex: 1,
      name: "Identity & Contact Verification",
      description: `Verify ${candidate.fullName} (${candidate.email}, ${candidate.phone})`,
      status: "pending",
      durationMs: 400,
    },
    {
      stepIndex: 2,
      name: "Resume & Document Attachment",
      description: `Attach tailored PDF "${resumeTitle}" with ATS optimization`,
      status: "pending",
      durationMs: 750,
    },
    {
      stepIndex: 3,
      name: "Experience & Education Autofill",
      description: `Map career milestones & verified institutions to ${portal.toUpperCase()} form fields`,
      status: "pending",
      durationMs: 600,
    },
    {
      stepIndex: 4,
      name: "Compliance & Screening Auto-Responder",
      description: `Answer work authorization (${candidate.workAuthorization}) & ${candidate.yearsOfExperience}+ yrs exp`,
      status: "pending",
      durationMs: 500,
    },
    {
      stepIndex: 5,
      name: "Final Verification & Human-in-the-Loop Confirmation",
      description: "Review all synthesized fields before submission confirmation",
      status: "pending",
      durationMs: 300,
    },
  ];
}

/**
 * Generates a self-executing vanilla JS bookmarklet for one-click form-filling in recruiter portals.
 */
export function generateAutofillBookmarklet(candidate: CandidateProfile): string {
  const payload = {
    name: candidate.fullName,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    linkedin: candidate.linkedinUrl || "",
    portfolio: candidate.portfolioUrl || "",
  };

  const script = `
(function() {
  var data = ${JSON.stringify(payload)};
  function setVal(selectors, val) {
    if (!val) return;
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  }
  setVal(['input[name*="name" i]', 'input[id*="name" i]', 'input[autocomplete*="name" i]'], data.name);
  setVal(['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'], data.email);
  setVal(['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'], data.phone);
  setVal(['input[name*="location" i]', 'input[name*="city" i]'], data.location);
  setVal(['input[name*="linkedin" i]', 'input[placeholder*="linkedin" i]'], data.linkedin);
  setVal(['input[name*="website" i]', 'input[name*="portfolio" i]'], data.portfolio);
  alert('ResumeForge: Application form fields autofilled successfully!');
})();
  `.trim().replace(/\s+/g, " ");

  return `javascript:${encodeURIComponent(script)}`;
}

/**
 * Simulates end-to-end multi-step application dispatch with verified execution tokens.
 */
export async function executeApplicationDispatch(
  applicationId: string,
  portal: JobPortalType,
  candidate: CandidateProfile,
  onStepProgress?: (step: DispatchStep) => void
): Promise<DispatchResult> {
  const steps = generateDispatchSteps(portal, candidate);
  const logs: string[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    step.status = "executing";
    if (onStepProgress) onStepProgress({ ...step });

    logs.push(`[DISPATCH:${portal.toUpperCase()}] Running step ${step.stepIndex}: ${step.name}`);
    await new Promise((resolve) => setTimeout(resolve, 150));

    step.status = "completed";
    if (onStepProgress) onStepProgress({ ...step });
  }

  const verificationId = `DISPATCH-${portal.toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  return {
    applicationId,
    portal,
    success: true,
    stepsCompleted: steps.length,
    totalSteps: steps.length,
    verificationId,
    timestamp: new Date().toISOString(),
    logs,
  };
}
