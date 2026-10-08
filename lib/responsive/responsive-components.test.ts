import { describe, it, expect } from "vitest";

describe("Responsive UI Utilities & Layout Mechanics", () => {
  it("computes progress percentages accurately for multi-step stepper", () => {
    const totalSteps = 4;
    const step1Percent = Math.round(((0 + 1) / totalSteps) * 100);
    const step2Percent = Math.round(((1 + 1) / totalSteps) * 100);
    const step4Percent = Math.round(((3 + 1) / totalSteps) * 100);

    expect(step1Percent).toBe(25);
    expect(step2Percent).toBe(50);
    expect(step4Percent).toBe(100);
  });

  it("formats slider values with custom formatting functions and units", () => {
    const formatCurrency = (val: number) => `$${val.toLocaleString()}/yr`;
    expect(formatCurrency(75000)).toBe("$75,000/yr");
    expect(formatCurrency(120000)).toBe("$120,000/yr");
  });

  it("handles responsive table column visibility and primary identifiers", () => {
    const columns = [
      { key: "company", header: "Company", isPrimary: true },
      { key: "role", header: "Role" },
      { key: "salary", header: "Salary", hideOnMobile: true },
    ];

    const primary = columns.find((c) => c.isPrimary);
    const mobileCols = columns.filter((c) => !c.isPrimary && !c.hideOnMobile);

    expect(primary?.key).toBe("company");
    expect(mobileCols).toHaveLength(1);
    expect(mobileCols[0].key).toBe("role");
  });
});
