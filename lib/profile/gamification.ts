export interface MilestoneTelemetry {
  resumeCount: number;
  atsScore?: number;
  savedAtsCount: number;
  applicationsCount: number;
  interviewsCount: number;
  salaryInsightsCount: number;
  hasPortfolio: boolean;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: "FileText" | "Target" | "Briefcase" | "Mic" | "TrendingUp" | "Globe";
  isUnlocked: boolean;
  progressText: string;
  href: string;
  ctaText: string;
}

export interface GamificationStatus {
  badges: MilestoneBadge[];
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
  levelTitle: string;
  isAllCompleted: boolean;
}

export function computeCareerMilestones(telemetry: MilestoneTelemetry): GamificationStatus {
  const resumeCount = telemetry.resumeCount || 0;
  const atsScore = telemetry.atsScore || 0;
  const savedAtsCount = telemetry.savedAtsCount || 0;
  const applicationsCount = telemetry.applicationsCount || 0;
  const interviewsCount = telemetry.interviewsCount || 0;
  const salaryInsightsCount = telemetry.salaryInsightsCount || 0;
  const hasPortfolio = Boolean(telemetry.hasPortfolio);

  const badges: MilestoneBadge[] = [
    {
      id: "document_architect",
      title: "Document Architect",
      subtitle: "Build Your Core Resume",
      description: "Craft your first ATS-compliant resume with tailored typography and layout.",
      iconName: "FileText",
      isUnlocked: resumeCount >= 1,
      progressText: resumeCount >= 1 ? "Completed" : "0 / 1 Resumes Created",
      href: "/dashboard/resume/new",
      ctaText: "Create Resume",
    },
    {
      id: "ats_prodigy",
      title: "ATS Optimization Prodigy",
      subtitle: "Pass ATS Algorithms",
      description: "Analyze your resume against a target role description or reach 80%+ match.",
      iconName: "Target",
      isUnlocked: atsScore >= 80 || savedAtsCount >= 1,
      progressText: (atsScore >= 80 || savedAtsCount >= 1) ? "Completed" : "Run ATS Scan",
      href: "/dashboard/optimize",
      ctaText: "Scan Resume",
    },
    {
      id: "pipeline_commander",
      title: "Pipeline Commander",
      subtitle: "Organize Job Applications",
      description: "Track at least 3 active opportunities on your interactive Kanban board.",
      iconName: "Briefcase",
      isUnlocked: applicationsCount >= 3,
      progressText: applicationsCount >= 3 ? "Completed" : `${applicationsCount} / 3 Applications Tracked`,
      href: "/dashboard/tracker",
      ctaText: "Track Applications",
    },
    {
      id: "verbal_communicator",
      title: "Verbal Communicator",
      subtitle: "AI Voice Mock Interview",
      description: "Complete an interactive voice interview session with real-time speech telemetry.",
      iconName: "Mic",
      isUnlocked: interviewsCount >= 1,
      progressText: interviewsCount >= 1 ? "Completed" : "0 / 1 Interviews Completed",
      href: "/dashboard/interview-prep",
      ctaText: "Start Voice Room",
    },
    {
      id: "market_strategist",
      title: "Market Strategist",
      subtitle: "Compensation & Negotiation",
      description: "Explore localized salary percentiles and generate counter-offer battlecards.",
      iconName: "TrendingUp",
      isUnlocked: salaryInsightsCount >= 1,
      progressText: salaryInsightsCount >= 1 ? "Completed" : "Explore Benchmarks",
      href: "/dashboard/salary",
      ctaText: "Explore Salaries",
    },
    {
      id: "public_portfolio",
      title: "Executive Showcase",
      subtitle: "Publish Public Portfolio",
      description: "Publish your live web portfolio to share with recruiters and network contacts.",
      iconName: "Globe",
      isUnlocked: hasPortfolio,
      progressText: hasPortfolio ? "Completed" : "Setup Portfolio",
      href: "/dashboard/profile",
      ctaText: "View Portfolio",
    },
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  let levelTitle = "Novice Explorer";
  if (unlockedCount >= 6) {
    levelTitle = "Career Master (100%)";
  } else if (unlockedCount >= 5) {
    levelTitle = "High-Caliber Applicant";
  } else if (unlockedCount >= 3) {
    levelTitle = "Active Contender";
  } else if (unlockedCount >= 1) {
    levelTitle = "Emerging Candidate";
  }

  return {
    badges,
    unlockedCount,
    totalCount,
    completionPercentage,
    levelTitle,
    isAllCompleted: unlockedCount === totalCount,
  };
}
