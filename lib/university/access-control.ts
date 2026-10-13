import { VIRGINIA_INSTITUTIONS } from "@/lib/university/virginia-institutions";

export type CampusUserRole = "student" | "staff" | "advisor" | "dean" | "admin";

export interface VerifiedSchoolRecord {
  slug: string;
  name: string;
  email?: string;
  verified_at?: string;
  role?: CampusUserRole;
}

export interface CampusMemberPermissions {
  can_edit_settings: boolean;
  can_manage_roster: boolean;
  can_review_resumes: boolean;
}

export interface InstitutionalMemberRecord {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: CampusUserRole;
  status: "active" | "invited" | "pending" | "suspended";
  department?: string | null;
  title?: string | null;
  permissions: CampusMemberPermissions;
  created_at: string;
  updated_at?: string;
  avatar_url?: string | null;
}

export function getDefaultPermissions(role?: CampusUserRole | string | null): CampusMemberPermissions {
  const r = (role || "").toLowerCase().trim();
  if (r === "admin" || r === "dean") {
    return { can_edit_settings: true, can_manage_roster: true, can_review_resumes: true };
  }
  if (r === "advisor" || r === "staff") {
    return { can_edit_settings: false, can_manage_roster: true, can_review_resumes: true };
  }
  return { can_edit_settings: false, can_manage_roster: false, can_review_resumes: false };
}

export interface SchoolAccessCheckResult {
  isVerified: boolean;
  userRole: CampusUserRole;
  isStaffOrAdmin: boolean;
  canEditSettings: boolean;
  canManageRoster: boolean;
  userPrimarySlug?: string | null;
  userPrimaryName?: string | null;
  verifiedSchools: VerifiedSchoolRecord[];
  targetInstitution?: (typeof VIRGINIA_INSTITUTIONS)[number] | null;
}

/**
 * Helper to determine whether a given role holds elevated staff/admin privileges.
 * By default, regular verified accounts are 'student' and have zero change/edit access.
 */
export function isCampusStaffOrAdmin(role?: CampusUserRole | string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return r === "admin" || r === "staff" || r === "dean" || r === "advisor" || r === "institution_admin";
}

export function canEditCampusSettings(role?: CampusUserRole | string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return r === "admin" || r === "dean" || r === "staff";
}

export function canManageCampusRoster(role?: CampusUserRole | string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return r === "admin" || r === "dean" || r === "staff" || r === "advisor";
}

export function canApproveCampusResumes(role?: CampusUserRole | string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return r === "admin" || r === "dean" || r === "staff" || r === "advisor";
}

/**
 * Normalizes institutional slugs and acronyms to ensure consistent matching
 * (e.g., "odu" matches "old-dominion-university", "vt" matches "virginia-tech", "uva" matches "university-of-virginia")
 */
export function normalizeInstitutionSlug(slug: string): string {
  let s = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  s = s.replace(/-career-center$/, "").replace(/-career-advising.*$/, "");
  
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
    role?: string | null;
    is_admin?: boolean | null;
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
      userRole: "student",
      isStaffOrAdmin: false,
      canEditSettings: false,
      canManageRoster: false,
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

  // Resolve user role: strictly default all users who joined/verified to 'student'
  // Unless explicitly marked as admin, staff, dean, or advisor in profile or institutional settings
  let resolvedRole: CampusUserRole = "student";
  
  if (profile.is_admin === true || profile.role === "admin") {
    resolvedRole = "admin";
  } else if (profile.role === "staff" || profile.role === "dean") {
    resolvedRole = "dean";
  } else if (profile.role === "advisor") {
    resolvedRole = "advisor";
  } else if (profile.settings?.institutional_roles?.[normalizedTarget]) {
    const customRole = String(profile.settings.institutional_roles[normalizedTarget]).toLowerCase();
    if (customRole === "admin" || customRole === "dean" || customRole === "staff" || customRole === "advisor") {
      resolvedRole = customRole as CampusUserRole;
    }
  }

  // Collect all verified schools for this user
  const verifiedSchools: VerifiedSchoolRecord[] = [];

  if (isGloballyVerified && userPrimarySlug) {
    verifiedSchools.push({
      slug: normalizeInstitutionSlug(userPrimarySlug),
      name: userPrimaryName || userPrimarySlug,
      email: profile.school_email || undefined,
      role: resolvedRole,
    });
  }

  // Check multi-school array in settings if available
  const settingsSchools = profile.settings?.verified_schools;
  if (Array.isArray(settingsSchools)) {
    for (const s of settingsSchools) {
      if (s && s.slug) {
        const norm = normalizeInstitutionSlug(s.slug);
        const schoolSpecificRole = s.role && isCampusStaffOrAdmin(s.role) ? (s.role as CampusUserRole) : resolvedRole;
        if (!verifiedSchools.some((existing) => existing.slug === norm)) {
          verifiedSchools.push({
            slug: norm,
            name: s.name || s.slug,
            email: s.email,
            verified_at: s.verified_at,
            role: schoolSpecificRole,
          });
        }
      }
    }
  }

  // Check if target institution is among verified schools
  const matchedRecord = verifiedSchools.find(
    (v) =>
      v.slug === normalizedTarget ||
      (targetInstitution && v.slug === normalizeInstitutionSlug(targetInstitution.slug))
  );

  const isMatch = Boolean(matchedRecord);
  const finalRole: CampusUserRole = matchedRecord?.role || resolvedRole;

  return {
    isVerified: isMatch,
    userRole: finalRole,
    isStaffOrAdmin: isCampusStaffOrAdmin(finalRole),
    canEditSettings: canEditCampusSettings(finalRole),
    canManageRoster: canManageCampusRoster(finalRole),
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

