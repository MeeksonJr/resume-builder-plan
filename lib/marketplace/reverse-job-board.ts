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
  // Virginia & University Collegiate Fields
  universityName?: string;
  universitySlug?: string;
  schoolVerified?: boolean;
  major?: string;
  graduationYear?: string;
  isStudent?: boolean;
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
  universityName?: string;
  universitySlug?: string;
  schoolVerified?: boolean;
  major?: string;
  graduationYear?: string;
  isStudent?: boolean;
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
    universityName: profile.universityName,
    universitySlug: profile.universitySlug,
    schoolVerified: profile.schoolVerified,
    major: profile.major,
    graduationYear: profile.graduationYear,
    isStudent: profile.isStudent,
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
  },
  {
    id: "cand-va-odu",
    userId: "user-odu-01",
    realName: "Jordan Hayes",
    email: "[student]@odu.edu",
    headline: "Cybersecurity & Cloud Systems Engineer (ODU Center for Cybersecurity)",
    maskedHeadline: "Junior Cloud Defense Engineer (Hampton Roads Defense Track • ODU)",
    currentCompany: "Old Dominion University Cybersecurity Research Lab",
    hideCurrentCompany: false,
    yearsExperience: 1,
    primarySkills: ["Cybersecurity", "Python", "AWS GovCloud", "Network Security", "Linux", "Docker"],
    desiredRole: "Cybersecurity Analyst / Cloud Security Engineer",
    desiredSalaryMin: 85000,
    desiredSalaryMax: 110000,
    remotePreference: "Hybrid",
    availability: "actively_looking",
    isAnonymous: true,
    atsScore: 97,
    bioSnippet: "Old Dominion University senior. Completed DoD-sponsored threat modeling project. Active Secret clearance eligible.",
    createdAt: new Date().toISOString(),
    universityName: "Old Dominion University",
    universitySlug: "old-dominion-university",
    schoolVerified: true,
    major: "Cybersecurity & Computer Science",
    graduationYear: "2026",
    isStudent: true,
  },
  {
    id: "cand-va-vt",
    userId: "user-vt-02",
    realName: "David Chen",
    email: "[student]@vt.edu",
    headline: "Embedded Systems & Autonomous Robotics Engineer (Virginia Tech)",
    maskedHeadline: "Robotics & C++ Software Engineer (Virginia Tech Autonomous Hub)",
    currentCompany: "Virginia Tech Robotics & Mechatronics Lab",
    hideCurrentCompany: false,
    yearsExperience: 2,
    primarySkills: ["C++", "ROS 2", "Python", "Embedded Linux", "CUDA", "Real-Time Systems"],
    desiredRole: "Autonomous Systems Software Engineer",
    desiredSalaryMin: 105000,
    desiredSalaryMax: 135000,
    remotePreference: "Hybrid",
    availability: "actively_looking",
    isAnonymous: true,
    atsScore: 98,
    bioSnippet: "Virginia Tech M.S. candidate in Computer Engineering. Developed real-time sensor fusion pipeline for autonomous vehicle test fleet.",
    createdAt: new Date().toISOString(),
    universityName: "Virginia Tech",
    universitySlug: "virginia-tech",
    schoolVerified: true,
    major: "Computer Engineering",
    graduationYear: "2026",
    isStudent: true,
  },
  {
    id: "cand-va-tcc",
    userId: "user-tcc-03",
    realName: "Taylor Brooks",
    email: "[student]@email.vccs.edu",
    headline: "Fullstack Web Developer & AS Computer Science (TCC to ODU Transfer Track)",
    maskedHeadline: "Fullstack Web Developer (VCCS Collegiate Honor Roll • TCC)",
    currentCompany: "Tidewater Community College STEM Center",
    hideCurrentCompany: false,
    yearsExperience: 1,
    primarySkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
    desiredRole: "Junior Fullstack Developer / Software Intern",
    desiredSalaryMin: 72000,
    desiredSalaryMax: 90000,
    remotePreference: "Hybrid",
    availability: "actively_looking",
    isAnonymous: true,
    atsScore: 96,
    bioSnippet: "Tidewater Community College student transferring to ODU. Built regional event coordination platform serving 1,200 active users.",
    createdAt: new Date().toISOString(),
    universityName: "Tidewater Community College",
    universitySlug: "tidewater-community-college",
    schoolVerified: true,
    major: "Computer Science (Transfer Track)",
    graduationYear: "2026",
    isStudent: true,
  },
  {
    id: "cand-va-uva",
    userId: "user-uva-04",
    realName: "Sarah Miller",
    email: "[student]@virginia.edu",
    headline: "Data Science & Quantitative Analytics (University of Virginia)",
    maskedHeadline: "Quant Data Scientist & Econometric Modeler (UVA School of Data Science)",
    currentCompany: "UVA Data Science Institute",
    hideCurrentCompany: false,
    yearsExperience: 1,
    primarySkills: ["Python", "SQL", "Machine Learning", "R", "Tableau", "Time Series Analysis"],
    desiredRole: "Data Scientist / Financial Quant Analyst",
    desiredSalaryMin: 110000,
    desiredSalaryMax: 140000,
    remotePreference: "Any",
    availability: "open_to_offers",
    isAnonymous: true,
    atsScore: 99,
    bioSnippet: "University of Virginia graduate student. Won 1st place in 2025 Virginia Collegiate FinTech Datathon with 99.4% predictive accuracy model.",
    createdAt: new Date().toISOString(),
    universityName: "University of Virginia",
    universitySlug: "university-of-virginia",
    schoolVerified: true,
    major: "Data Science & Statistics",
    graduationYear: "2026",
    isStudent: true,
  },
  {
    id: "cand-va-nvcc",
    userId: "user-nvcc-05",
    realName: "Carlos Mendez",
    email: "[student]@email.vccs.edu",
    headline: "Cloud & DevOps Specialist (NOVA AWS Cloud Academy • VCCS)",
    maskedHeadline: "AWS Certified Cloud Solutions Associate (Northern Virginia Tech Corridor)",
    currentCompany: "Northern Virginia Technology Incubator",
    hideCurrentCompany: false,
    yearsExperience: 1,
    primarySkills: ["AWS Certified", "Terraform", "Docker", "Linux", "CI/CD Pipelines", "Python"],
    desiredRole: "Junior Cloud & DevOps Engineer",
    desiredSalaryMin: 80000,
    desiredSalaryMax: 98000,
    remotePreference: "Hybrid",
    availability: "actively_looking",
    isAnonymous: true,
    atsScore: 95,
    bioSnippet: "Northern Virginia Community College student with AWS Solutions Architect certification. Northern Virginia tech hub based.",
    createdAt: new Date().toISOString(),
    universityName: "Northern Virginia Community College",
    universitySlug: "northern-virginia-community-college",
    schoolVerified: true,
    major: "Cloud Computing & Systems",
    graduationYear: "2026",
    isStudent: true,
  }
];
