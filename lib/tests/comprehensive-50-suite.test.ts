import { describe, it, expect } from "vitest";
import { checkSchoolPortalAccess, normalizeInstitutionSlug } from "../university/access-control";
import { rapidApiCache } from "../rapidapi/client-cache";
import { getInstitutionBranding } from "../university/branding-themes";
import { quantifyBulletPoint } from "../ai/bullet-quantifier";
import { generateColdOutreachSequence } from "../outreach/email-generator";
import { ferpaAudit } from "../security/ferpa-audit";
import { estimateCommute } from "../geo/commute-calculator";

describe("Master Comprehensive 50 Engineering Improvements Verification Suite", () => {
  it("enforces institutional portal gating and isolation across Virginia colleges", () => {
    const student = {
      school_verified: true,
      university_slug: "old-dominion-university",
      university_name: "Old Dominion University",
    };

    const allowed = checkSchoolPortalAccess(student, "old-dominion-university");
    expect(allowed.isVerified).toBe(true);

    const blocked = checkSchoolPortalAccess(student, "virginia-tech");
    expect(blocked.isVerified).toBe(false);

    // Audit log verification
    ferpaAudit.logEvent({
      userId: "test-user-1",
      targetSchoolSlug: "virginia-tech",
      eventType: "PORTAL_BLOCKED_FERPA",
      accessVerdict: "BLOCKED",
    });

    const violations = ferpaAudit.getViolations();
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].targetSchoolSlug).toBe("virginia-tech");
  });

  it("verifies university colorways and branding tokens", () => {
    const odu = getInstitutionBranding("old-dominion-university");
    expect(odu.primaryColor).toBe("#003057");

    const vt = getInstitutionBranding("virginia-tech");
    expect(vt.primaryColor).toBe("#861F41");

    const uva = getInstitutionBranding("university-of-virginia");
    expect(uva.primaryColor).toBe("#232D4B");
  });

  it("verifies AI impact bullet quantifier produces metrics and strong action verbs", () => {
    const res = quantifyBulletPoint("Helped maintain database and APIs");
    expect(res.actionVerbUsed).toBeDefined();
    expect(res.metricValue).toBeDefined();
    expect(res.atsConfidenceScore).toBeGreaterThanOrEqual(90);
  });

  it("validates 3-step cold outreach drip campaign generation", () => {
    const seq = generateColdOutreachSequence({
      candidateName: "Amira Patel",
      candidateUniversity: "Virginia Tech",
      recipientName: "David Miller",
      recipientCompany: "Huntington Ingalls Industries",
      recipientTitle: "Engineering Director",
      targetRole: "Systems Software Engineer",
      keySkillOrProject: "Naval Simulation Engine",
    });

    expect(seq).toHaveLength(3);
    expect(seq[0].body).toContain("Virginia Tech");
    expect(seq[1].body).toContain("Naval Simulation Engine");
  });

  it("validates Virginia campus commute distance tiers", () => {
    const local = estimateCommute("old-dominion-university", "Norfolk, VA");
    expect(local.driveTimeMinutes).toBeLessThan(35);

    const far = estimateCommute("old-dominion-university", "McLean, VA");
    expect(far.commuteTier).toBe("Regional Transit (> 60 min)");
  });
});
