/**
 * ResumeForge Enterprise Team Workspace & White-Label University Portals (Phase 55)
 * Powers multi-tenant career centers, university cohorts, and bootcamp talent directories.
 */

export interface UniversityTenant {
  slug: string;
  name: string;
  institutionType: "university" | "bootcamp" | "enterprise";
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  customDomain?: string;
  ssoEnabled: boolean;
  ferpaCompliant: boolean;
  activeCohorts: CohortGroup[];
}

export interface CohortGroup {
  id: string;
  name: string; // e.g. "Spring 2026 - Computer Science"
  graduationYear: number;
  totalStudents: number;
  averageAtsScore: number;
  placementRatePercent: number;
  applicationsDispatched: number;
}

export interface StudentRosterMember {
  id: string;
  name: string;
  email: string;
  major: string;
  graduationYear: number;
  resumeTitle: string;
  resumeSlug: string;
  atsScore: number;
  hasVideoPitch: boolean;
  placementStatus: "Searching" | "Interviewing" | "Placed";
  targetRoles: string[];
}

export const PRESET_TENANTS: Record<string, UniversityTenant> = {
  stanford: {
    slug: "stanford",
    name: "Stanford University Career Center",
    institutionType: "university",
    primaryColor: "#8C1515", // Cardinal Red
    accentColor: "#d8f36b",
    customDomain: "careers.stanford.edu",
    ssoEnabled: true,
    ferpaCompliant: true,
    activeCohorts: [
      {
        id: "su-cs-2026",
        name: "Class of 2026 - Computer Science",
        graduationYear: 2026,
        totalStudents: 142,
        averageAtsScore: 88.4,
        placementRatePercent: 78.5,
        applicationsDispatched: 1840,
      },
      {
        id: "su-ee-2026",
        name: "Class of 2026 - Electrical Engineering",
        graduationYear: 2026,
        totalStudents: 96,
        averageAtsScore: 85.2,
        placementRatePercent: 71.0,
        applicationsDispatched: 920,
      },
    ],
  },
  mit: {
    slug: "mit",
    name: "MIT Career Advising & Professional Development",
    institutionType: "university",
    primaryColor: "#A31F34", // MIT Red
    accentColor: "#8A8B8C", // Gray
    customDomain: "capd.mit.edu",
    ssoEnabled: true,
    ferpaCompliant: true,
    activeCohorts: [
      {
        id: "mit-eecs-2026",
        name: "Class of 2026 - EECS",
        graduationYear: 2026,
        totalStudents: 210,
        averageAtsScore: 91.2,
        placementRatePercent: 84.0,
        applicationsDispatched: 3100,
      },
    ],
  },
  "general-assembly": {
    slug: "general-assembly",
    name: "General Assembly Software Engineering Immersive",
    institutionType: "bootcamp",
    primaryColor: "#EE3124", // GA Red
    accentColor: "#102b2b",
    customDomain: "talenthub.generalassemb.ly",
    ssoEnabled: false,
    ferpaCompliant: true,
    activeCohorts: [
      {
        id: "ga-sei-42",
        name: "SEI Cohort 42 - Fullstack Web",
        graduationYear: 2026,
        totalStudents: 48,
        averageAtsScore: 86.0,
        placementRatePercent: 68.5,
        applicationsDispatched: 1420,
      },
    ],
  },
};

export const MOCK_STUDENT_ROSTER: StudentRosterMember[] = [
  {
    id: "std-1",
    name: "Elena Rostova",
    email: "erostova@stanford.edu",
    major: "Computer Science (AI Track)",
    graduationYear: 2026,
    resumeTitle: "Elena Rostova - Machine Learning Engineer",
    resumeSlug: "elena-rostova-ml",
    atsScore: 94,
    hasVideoPitch: true,
    placementStatus: "Interviewing",
    targetRoles: ["Machine Learning Engineer", "AI Research Scientist"],
  },
  {
    id: "std-2",
    name: "Marcus Thorne",
    email: "mthorne@stanford.edu",
    major: "Computer Systems",
    graduationYear: 2026,
    resumeTitle: "Marcus Thorne - Distributed Systems",
    resumeSlug: "marcus-thorne-systems",
    atsScore: 89,
    hasVideoPitch: true,
    placementStatus: "Placed",
    targetRoles: ["Cloud Systems Engineer", "Site Reliability Engineer"],
  },
  {
    id: "std-3",
    name: "Aaliyah Patel",
    email: "apatel@stanford.edu",
    major: "Human-Computer Interaction",
    graduationYear: 2026,
    resumeTitle: "Aaliyah Patel - Product Design & Frontend",
    resumeSlug: "aaliyah-patel-design",
    atsScore: 91,
    hasVideoPitch: false,
    placementStatus: "Searching",
    targetRoles: ["Fullstack Engineer", "Product Engineer"],
  },
  {
    id: "std-4",
    name: "Devon Reed",
    email: "dreed@stanford.edu",
    major: "Data Science & Statistics",
    graduationYear: 2026,
    resumeTitle: "Devon Reed - Quantitative Analytics",
    resumeSlug: "devon-reed-quant",
    atsScore: 82,
    hasVideoPitch: false,
    placementStatus: "Searching",
    targetRoles: ["Data Scientist", "Quantitative Analyst"],
  },
];

/**
 * Resolves a university tenant by slug or domain, falling back to Stanford demo.
 */
export function resolveUniversityTenant(slugOrDomain: string): UniversityTenant {
  const normalized = slugOrDomain.toLowerCase().trim();
  if (PRESET_TENANTS[normalized]) {
    return PRESET_TENANTS[normalized];
  }

  // Check matching custom domains
  for (const t of Object.values(PRESET_TENANTS)) {
    if (t.customDomain && t.customDomain.toLowerCase() === normalized) {
      return t;
    }
  }

  return PRESET_TENANTS.stanford;
}

/**
 * Calculates aggregate stats across all active cohorts in a tenant.
 */
export function calculateTenantStats(tenant: UniversityTenant): {
  totalStudents: number;
  overallAvgAtsScore: number;
  overallPlacementRate: number;
  totalApplicationsDispatched: number;
} {
  const cohorts = tenant.activeCohorts;
  if (!cohorts || cohorts.length === 0) {
    return {
      totalStudents: 0,
      overallAvgAtsScore: 0,
      overallPlacementRate: 0,
      totalApplicationsDispatched: 0,
    };
  }

  const totalStudents = cohorts.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalDispatched = cohorts.reduce((acc, c) => acc + c.applicationsDispatched, 0);

  const weightedAtsSum = cohorts.reduce((acc, c) => acc + c.averageAtsScore * c.totalStudents, 0);
  const weightedPlacementSum = cohorts.reduce(
    (acc, c) => acc + c.placementRatePercent * c.totalStudents,
    0
  );

  return {
    totalStudents,
    overallAvgAtsScore: parseFloat((weightedAtsSum / totalStudents).toFixed(1)),
    overallPlacementRate: parseFloat((weightedPlacementSum / totalStudents).toFixed(1)),
    totalApplicationsDispatched: totalDispatched,
  };
}
