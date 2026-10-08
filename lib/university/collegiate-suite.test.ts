import { describe, it, expect } from "vitest";
import { getInstitutionBranding } from "./branding-themes";
import { syncCanvasCareerAssignments } from "../canvas/assignment-sync";

describe("Collegiate Campus Portal Suite (Phase 3)", () => {
  it("resolves official institutional colorways and mascots for Virginia universities", () => {
    const odu = getInstitutionBranding("old-dominion-university");
    expect(odu.primaryColor).toBe("#003057"); // ODU Navy
    expect(odu.athleticsMascot).toBe("Big Blue the Monarch");

    const vt = getInstitutionBranding("virginia-tech");
    expect(vt.primaryColor).toBe("#861F41"); // Chicago Maroon
    expect(vt.secondaryColor).toBe("#E87722"); // Burnt Orange

    const uva = getInstitutionBranding("university-of-virginia");
    expect(uva.primaryColor).toBe("#232D4B"); // Jefferson Blue
    expect(uva.athleticsMascot).toBe("Cavalier");

    const defaultFallback = getInstitutionBranding("unknown-school");
    expect(defaultFallback.primaryColor).toBe("#102b2b");
  });

  it("syncs Canvas LMS career assignments with rubric item scoring", () => {
    const assignments = syncCanvasCareerAssignments("student@odu.edu");
    expect(assignments.length).toBeGreaterThan(0);
    expect(assignments[0]).toHaveProperty("courseId");
    expect(assignments[0]).toHaveProperty("rubricItems");
    expect(assignments[0].rubricItems.length).toBeGreaterThanOrEqual(2);
    expect(assignments[0].pointsPossible).toBe(100);
  });
});
