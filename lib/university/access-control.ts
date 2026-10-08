import { VIRGINIA_INSTITUTIONS } from "@/lib/university/virginia-institutions";

export interface VerifiedSchoolRecord {
  slug: string;
  name: string;
  email?: string;
  verified_at?: string;
}

export interface SchoolAccessCheckResult {
  isVerified: boolean;
  userPrimarySlug?: string | null;
  userPrimaryName?: string | null;
  verifiedSchools: VerifiedSchoolRecord[];
  targetInstitution?: (typeof VIRGINIA_INSTITUTIONS)[number] | null;
}

/**
 * Normalizes institutional slugs and acronyms to ensure consistent matching
 * (e.g., "odu" matches "old-dominion-university", "vt" matches "virginia-tech", "uva" matches "university-of-virginia")
 */
export function normalizeInstitutionSlug(slug: string): string {
  const s = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
  if (s === "odu") return "old-dominion-university";
  if (s === "vt") return "virginia-tech";
  if (s === "uva") return "university-of-virginia";
  if (s === "tcc") return "tidewater-community-college";
  if (s === "nvcc") return "northern-virginia-community-college";
  if (s === "vcu") return "virginia-commonwealth-university";
  if (s === "gmu") return "george-mason-university";
  if (s === "jmu") return "james-madison-university";
  if (s === "wm") return "william-mary";
  
  return s;
}

/**
 * Checks if a user profile is authorized to access a specific university portal.
 * A user can only access the portal of an institution for which they have verified institutional credentials.
 */
export function checkSchoolPortalAccess(
  profile: {
    school_verified?: boolean | string | null;
    university_slug?: string | null;
    university_name?: string | null;
    school_email?: string | null;
    settings?: Record<string, any> | null;
  } | null | undefined,
  targetSlug: string
): SchoolAccessCheckResult {
  const normalizedTarget = normalizeInstitutionSlug(targetSlug);
  
  // Find metadata for the target institution if it's in Virginia
  const targetInstitution = VIRGINIA_INSTITUTIONS.find(
    (v) =>
      normalizeInstitutionSlug(v.slug) === normalizedTarget ||
      v.slug === normalizedTarget ||
      v.shortName.toLowerCase() === targetSlug.toLowerCase()
  ) || null;

  if (!profile) {
    return {
      isVerified: false,
      userPrimarySlug: null,
      userPrimaryName: null,
      verifiedSchools: [],
      targetInstitution,
    };
  }

  const isGloballyVerified = Boolean(
    profile.school_verified === true || profile.school_verified === "true"
  );

  const userPrimarySlug = profile.university_slug || null;
  const userPrimaryName = profile.university_name || null;

  // Collect all verified schools for this user
  const verifiedSchools: VerifiedSchoolRecord[] = [];

  if (isGloballyVerified && userPrimarySlug) {
    verifiedSchools.push({
      slug: normalizeInstitutionSlug(userPrimarySlug),
      name: userPrimaryName || userPrimarySlug,
      email: profile.school_email || undefined,
    });
  }

  // Check multi-school array in settings if available
  const settingsSchools = profile.settings?.verified_schools;
  if (Array.isArray(settingsSchools)) {
    for (const s of settingsSchools) {
      if (s && s.slug) {
        const norm = normalizeInstitutionSlug(s.slug);
        if (!verifiedSchools.some((existing) => existing.slug === norm)) {
          verifiedSchools.push({
            slug: norm,
            name: s.name || s.slug,
            email: s.email,
            verified_at: s.verified_at,
          });
        }
      }
    }
  }

  // Check if target institution is among verified schools
  const isMatch = verifiedSchools.some(
    (v) =>
      v.slug === normalizedTarget ||
      (targetInstitution && v.slug === normalizeInstitutionSlug(targetInstitution.slug))
  );

  return {
    isVerified: isMatch,
    userPrimarySlug,
    userPrimaryName,
    verifiedSchools,
    targetInstitution,
  };
}

/**
 * Returns all verified school slugs/records for a given user profile.
 */
export function getAllUserVerifiedSchools(
  profile: {
    school_verified?: boolean | string | null;
    university_slug?: string | null;
    university_name?: string | null;
    school_email?: string | null;
    settings?: Record<string, any> | null;
  } | null | undefined
): VerifiedSchoolRecord[] {
  if (!profile) return [];
  const check = checkSchoolPortalAccess(profile, "__check_all__");
  return check.verifiedSchools;
}

