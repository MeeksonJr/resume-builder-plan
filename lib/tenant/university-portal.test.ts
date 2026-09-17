import { describe, it, expect } from "vitest";
import {
  resolveUniversityTenant,
  calculateTenantStats,
  PRESET_TENANTS,
  MOCK_STUDENT_ROSTER,
} from "./university-portal";

describe("Enterprise Team Workspace & White-Label University Portals (Phase 55)", () => {
  it("resolves pre-configured university tenants by slug", () => {
    const stanford = resolveUniversityTenant("stanford");
    expect(stanford.name).toContain("Stanford");
    expect(stanford.primaryColor).toBe("#8C1515");
    expect(stanford.ferpaCompliant).toBe(true);

    const mit = resolveUniversityTenant("mit");
    expect(mit.name).toContain("MIT");
    expect(mit.institutionType).toBe("university");

    const ga = resolveUniversityTenant("general-assembly");
    expect(ga.institutionType).toBe("bootcamp");
  });

  it("resolves university tenant by custom domain", () => {
    const tenant = resolveUniversityTenant("capd.mit.edu");
    expect(tenant.slug).toBe("mit");
  });

  it("falls back to Stanford default on unknown slug", () => {
    const fallback = resolveUniversityTenant("unknown-school-123");
    expect(fallback.slug).toBe("stanford");
  });

  it("computes weighted institutional cohort statistics accurately", () => {
    const stanford = PRESET_TENANTS.stanford;
    const stats = calculateTenantStats(stanford);

    expect(stats.totalStudents).toBe(238); // 142 + 96
    expect(stats.overallAvgAtsScore).toBeGreaterThanOrEqual(85);
    expect(stats.overallAvgAtsScore).toBeLessThanOrEqual(90);
    expect(stats.totalApplicationsDispatched).toBe(2760);
  });

  it("maintains mock student roster integrity with valid scores and placement statuses", () => {
    expect(MOCK_STUDENT_ROSTER.length).toBeGreaterThanOrEqual(4);
    const topStudent = MOCK_STUDENT_ROSTER[0];
    expect(topStudent.atsScore).toBeGreaterThanOrEqual(90);
    expect(topStudent.targetRoles.length).toBeGreaterThan(0);
  });
});
