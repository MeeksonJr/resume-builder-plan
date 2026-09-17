import { describe, it, expect } from "vitest";
import {
  simulateOfferCompensation,
  OfferDetails,
} from "./offer-letter-simulator";

describe("AI Offer Letter Analyzer & Compensation Equity Simulator (Phase 57)", () => {
  const sampleOffer: OfferDetails = {
    companyName: "Stripe",
    roleTitle: "Staff Software Engineer",
    baseSalary: 210000,
    signingBonus: 30000,
    annualBonusPercent: 15,
    equityType: "rsu",
    equityGrantUnits: 4000,
    equityGrantValue: 400000, // 100k/yr
    vestingScheduleYears: 4,
    cliffMonths: 12,
    companyStage: "late_growth",
  };

  it("calculates accurate year-1 total compensation including signing bonus", () => {
    const result = simulateOfferCompensation(sampleOffer);

    // Year 1: Base (210k) + Bonus (15% = 31.5k) + Sign-on (30k) + Equity Y1 (100k) = ~371.5k
    expect(result.firstYearTotalComp).toBeGreaterThanOrEqual(370000);
    expect(result.yearlyProjections.length).toBe(4);
    expect(result.yearlyProjections[0].vestedPercent).toBe(25);
  });

  it("projects 4-year vesting growth trajectories under conservative, target, and bull models", () => {
    const result = simulateOfferCompensation(sampleOffer);
    const y4 = result.yearlyProjections[3];

    // Year 4 bull should reflect strong compounding equity
    expect(y4.equityBull).toBeGreaterThan(y4.equityTarget);
    expect(y4.equityTarget).toBeGreaterThan(y4.equityConservative);
    expect(y4.vestedPercent).toBe(100);
  });

  it("tailors tactical negotiation levers for early-stage startup options", () => {
    const startupOffer: OfferDetails = {
      ...sampleOffer,
      companyName: "Supabase Stealth",
      companyStage: "series_a",
      equityType: "iso_options",
      strikePrice: 2.5,
    };

    const result = simulateOfferCompensation(startupOffer);

    expect(result.negotiationLevers.some((l) => l.lever.includes("Equity Percentage"))).toBe(true);
    expect(result.negotiationLevers.some((l) => l.lever.includes("83(b)"))).toBe(true);
    expect(result.equityBreakdown.optionsExerciseCost).toBe(10000); // 4000 * 2.5
  });

  it("generates a polite, highly persuasive counter-offer email letter", () => {
    const result = simulateOfferCompensation(sampleOffer);

    expect(result.aiCounterOfferScript).toContain("Stripe");
    expect(result.aiCounterOfferScript).toContain("Staff Software Engineer");
    expect(result.aiCounterOfferScript).toContain("Base Compensation");
    expect(result.aiCounterOfferScript).toContain("Signing / Equity Alignment");
  });
});
