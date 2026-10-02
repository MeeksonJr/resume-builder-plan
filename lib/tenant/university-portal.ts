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

export const MOCK_STUDENT_ROSTER: StudentRosterMember[] = [];

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

  // Dynamic tenant for any selected or searched university
  const schoolTitle = normalized
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const fullName = schoolTitle.toLowerCase().includes("university") || schoolTitle.toLowerCase().includes("college")
    ? schoolTitle
    : `${schoolTitle} University`;

  return {
    slug: normalized,
    name: `${fullName} Career Center`,
    institutionType: "university",
    primaryColor: "#0d8274",
    accentColor: "#d8f36b",
    customDomain: `careers.${normalized}.edu`,
    ssoEnabled: true,
    ferpaCompliant: true,
    activeCohorts: [],
  };
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
