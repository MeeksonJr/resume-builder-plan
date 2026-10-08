import { describe, it, expect } from "vitest";
import {
  checkSchoolPortalAccess,
  normalizeInstitutionSlug,
  getAllUserVerifiedSchools,
} from "./access-control";

describe("Campus Portal Institutional Access Control", () => {
  it("normalizes common Virginia university abbreviations and slugs", () => {
    expect(normalizeInstitutionSlug("odu")).toBe("old-dominion-university");
    expect(normalizeInstitutionSlug("vt")).toBe("virginia-tech");
    expect(normalizeInstitutionSlug("uva")).toBe("university-of-virginia");
    expect(normalizeInstitutionSlug("tcc")).toBe("tidewater-community-college");
    expect(normalizeInstitutionSlug("Old Dominion University")).toBe("old-dominion-university");
  });

  it("grants access to the student's verified primary institution", () => {
    const profile = {
      school_verified: true,
      university_slug: "old-dominion-university",
      university_name: "Old Dominion University",
      school_email: "monarch@odu.edu",
    };

    const res = checkSchoolPortalAccess(profile, "old-dominion-university");
    expect(res.isVerified).toBe(true);
    expect(res.userPrimarySlug).toBe("old-dominion-university");
    expect(res.targetInstitution?.slug).toBe("old-dominion-university");
  });

  it("blocks verified students from accessing other institutions' portals (Institutional Isolation)", () => {
    const oduStudent = {
      school_verified: true,
      university_slug: "old-dominion-university",
      university_name: "Old Dominion University",
      school_email: "monarch@odu.edu",
    };

    // Attempting to access Virginia Tech
    const vtCheck = checkSchoolPortalAccess(oduStudent, "virginia-tech");
    expect(vtCheck.isVerified).toBe(false);
    expect(vtCheck.targetInstitution?.shortName).toBe("VT");

    // Attempting to access UVA
    const uvaCheck = checkSchoolPortalAccess(oduStudent, "university-of-virginia");
    expect(uvaCheck.isVerified).toBe(false);

    // Attempting to access TCC
    const tccCheck = checkSchoolPortalAccess(oduStudent, "tidewater-community-college");
    expect(tccCheck.isVerified).toBe(false);
  });

  it("permits access when student adds and verifies multiple schools in settings.verified_schools", () => {
    const dualStudent = {
      school_verified: true,
      university_slug: "tidewater-community-college",
      university_name: "Tidewater Community College",
      school_email: "transfer@email.vccs.edu",
      settings: {
        verified_schools: [
          {
            slug: "old-dominion-university",
            name: "Old Dominion University",
            email: "student@odu.edu",
            verified_at: "2026-10-08T12:00:00Z",
          },
        ],
      },
    };

    // Should have access to primary (TCC)
    const tccCheck = checkSchoolPortalAccess(dualStudent, "tidewater-community-college");
    expect(tccCheck.isVerified).toBe(true);

    // Should have access to verified transfer institution (ODU)
    const oduCheck = checkSchoolPortalAccess(dualStudent, "old-dominion-university");
    expect(oduCheck.isVerified).toBe(true);

    // Still blocked from non-verified schools (e.g. George Mason University)
    const gmuCheck = checkSchoolPortalAccess(dualStudent, "george-mason-university");
    expect(gmuCheck.isVerified).toBe(false);
  });

  it("retrieves all verified schools for a user profile", () => {
    const profile = {
      school_verified: true,
      university_slug: "old-dominion-university",
      university_name: "Old Dominion University",
      school_email: "student@odu.edu",
      settings: {
        verified_schools: [
          {
            slug: "virginia-tech",
            name: "Virginia Tech",
            email: "student@vt.edu",
          },
        ],
      },
    };

    const schools = getAllUserVerifiedSchools(profile);
    expect(schools).toHaveLength(2);
    expect(schools.map((s) => s.slug)).toEqual([
      "old-dominion-university",
      "virginia-tech",
    ]);
  });
});
