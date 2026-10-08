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

  it("dynamically generates tenant on unknown slug", () => {
    const dynamicTenant = resolveUniversityTenant("unknown-school-123");
    expect(dynamicTenant.slug).toBe("unknown-school-123");
    expect(dynamicTenant.name).toContain("Unknown School 123");
    expect(dynamicTenant.ferpaCompliant).toBe(true);
  });

  it("computes weighted institutional cohort statistics accurately", () => {
    const stanford = PRESET_TENANTS.stanford;
    const stats = calculateTenantStats(stanford);

    expect(stats.totalStudents).toBe(238); // 142 + 96
    expect(stats.overallAvgAtsScore).toBeGreaterThanOrEqual(85);
    expect(stats.overallAvgAtsScore).toBeLessThanOrEqual(90);
    expect(stats.totalApplicationsDispatched).toBe(2760);
  });

  it("maintains verified student roster structure", () => {
    expect(Array.isArray(MOCK_STUDENT_ROSTER)).toBe(true);
  });
});
