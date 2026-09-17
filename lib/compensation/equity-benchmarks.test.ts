import { describe, it, expect } from "vitest";
import {
  calculateVestingCurve,
  simulateCompensationOffer,
  BENCHMARK_LEVEL_BANDS,
} from "./equity-benchmarks";

describe("Compensation Benchmarking & Equity Calculator Simulator (Phase 66)", () => {
  it("calculates standard 25/25/25/25 RSU vesting curves with a 1-year cliff", () => {
    const curve = calculateVestingCurve(400000, "standard_quarterly", 0.0);
    expect(curve.length).toBeGreaterThan(10);

    // Month 12 should be the 25% cliff ($100,000)
    const cliffPoint = curve.find((p) => p.month === 12);
    expect(cliffPoint).toBeDefined();
    expect(cliffPoint?.isCliffEvent).toBe(true);
    expect(cliffPoint?.vestedValueCumulative).toBe(100000);
    expect(cliffPoint?.vestedPercentCumulative).toBe(25);

    // Final point at Month 48 should be 100% ($400,000)
    const finalPoint = curve[curve.length - 1];
    expect(finalPoint.month).toBe(48);
    expect(finalPoint.vestedValueCumulative).toBe(400000);
    expect(finalPoint.vestedPercentCumulative).toBe(100);
  });

  it("calculates Amazon-style backloaded vesting curves (5/15/40/40)", () => {
    const curve = calculateVestingCurve(400000, "amazon_backloaded", 0.0);
    const month12 = curve.find((p) => p.month === 12);
    expect(month12?.vestedValueCumulative).toBe(20000); // 5% of 400k
    expect(month12?.vestedPercentCumulative).toBe(5);

    const month24 = curve.find((p) => p.month === 24);
    expect(month24?.vestedValueCumulative).toBe(80000); // 5% + 15% = 20% of 400k
  });

  it("evaluates candidate offer against market bands and produces counter-offer asks", () => {
    const simulation = simulateCompensationOffer({
      role: "Software Engineer",
      level: "L5 (Senior)",
      metro: "San Francisco Bay Area",
      baseSalary: 195000,
      fourYearRsuGrant: 320000,
      annualBonusTargetPercent: 15,
      bonusPerformanceMultiplier: 1.0,
      scheduleType: "standard_quarterly",
      expectedAnnualStockAppreciation: 0.10,
      signingBonusYear1: 20000,
    });

    expect(simulation.calculatedYear1TotalComp).toBeGreaterThan(250000);
    expect(simulation.tailoredScripts.length).toBe(3);
    expect(simulation.tailoredScripts[0].title).toContain("Levels.fyi Benchmark");
    expect(simulation.tailoredScripts[0].script).toContain("verified market data");
    expect(simulation.recommendedCounterAsk.baseSalaryAsk).toBeGreaterThan(195000);
    expect(simulation.recommendedCounterAsk.rsuGrantAsk).toBeGreaterThan(320000);
  });
});
