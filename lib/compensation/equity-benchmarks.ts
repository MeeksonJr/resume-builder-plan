/**
 * ResumeForge Compensation Benchmarking & Equity Calculator Simulator (Phase 66)
 * Real-time Levels.fyi-style RSU vesting curves, bonus multipliers, and counter-offer script generator.
 */

export type VestingScheduleType = "standard_quarterly" | "amazon_backloaded" | "meta_frontloaded" | "uniform_monthly";

export interface CompensationBenchmarkBand {
  level: "L3 (Junior)" | "L4 (Mid-Level)" | "L5 (Senior)" | "L6 (Staff / Principal)";
  role: string;
  metro: "San Francisco Bay Area" | "New York City" | "Seattle" | "Austin / Remote";
  p25TotalComp: number;
  p50MedianTotalComp: number;
  p75TotalComp: number;
  p90TotalComp: number;
  medianBase: number;
  medianEquityAnnual: number;
  medianBonus: number;
}

export interface EquityCurvePoint {
  month: number;
  yearNumber: number;
  vestedPercentCumulative: number;
  vestedValueCumulative: number;
  quarterlyVestValue: number;
  isCliffEvent: boolean;
}

export interface EquityCalculatorParams {
  role: string;
  level: CompensationBenchmarkBand["level"];
  metro: CompensationBenchmarkBand["metro"];
  baseSalary: number;
  fourYearRsuGrant: number;
  annualBonusTargetPercent: number; // e.g. 15 for 15%
  bonusPerformanceMultiplier: number; // e.g. 1.0 = target, 1.3 = top performer, 0.8 = conservative
  scheduleType: VestingScheduleType;
  expectedAnnualStockAppreciation: number; // e.g. 0.10 for 10% annual CAGR
  signingBonusYear1?: number;
}

export interface CounterOfferScriptResult {
  percentileStanding: "Below 25th" | "25th - 50th" | "50th - 75th" | "75th - 90th" | "Top 10% (Market Leading)";
  calculatedYear1TotalComp: number;
  calculatedYear4TotalComp: number;
  equityVestingCurve: EquityCurvePoint[];
  marketGapAmount: number;
  recommendedCounterAsk: {
    baseSalaryAsk: number;
    rsuGrantAsk: number;
    signingBonusAsk: number;
  };
  tailoredScripts: {
    title: string;
    scenario: string;
    script: string;
    keyLevers: string[];
  }[];
}

export const BENCHMARK_LEVEL_BANDS: Record<string, CompensationBenchmarkBand> = {
  "L3_SF": {
    level: "L3 (Junior)",
    role: "Software Engineer",
    metro: "San Francisco Bay Area",
    p25TotalComp: 165000,
    p50MedianTotalComp: 192000,
    p75TotalComp: 225000,
    p90TotalComp: 260000,
    medianBase: 135000,
    medianEquityAnnual: 42000,
    medianBonus: 15000,
  },
  "L4_SF": {
    level: "L4 (Mid-Level)",
    role: "Software Engineer",
    metro: "San Francisco Bay Area",
    p25TotalComp: 220000,
    p50MedianTotalComp: 268000,
    p75TotalComp: 320000,
    p90TotalComp: 385000,
    medianBase: 168000,
    medianEquityAnnual: 75000,
    medianBonus: 25000,
  },
  "L5_SF": {
    level: "L5 (Senior)",
    role: "Software Engineer",
    metro: "San Francisco Bay Area",
    p25TotalComp: 320000,
    p50MedianTotalComp: 395000,
    p75TotalComp: 485000,
    p90TotalComp: 590000,
    medianBase: 215000,
    medianEquityAnnual: 145000,
    medianBonus: 35000,
  },
  "L6_SF": {
    level: "L6 (Staff / Principal)",
    role: "Software Engineer",
    metro: "San Francisco Bay Area",
    p25TotalComp: 460000,
    p50MedianTotalComp: 580000,
    p75TotalComp: 720000,
    p90TotalComp: 910000,
    medianBase: 260000,
    medianEquityAnnual: 275000,
    medianBonus: 45000,
  },
  "L5_REMOTE": {
    level: "L5 (Senior)",
    role: "Software Engineer",
    metro: "Austin / Remote",
    p25TotalComp: 260000,
    p50MedianTotalComp: 325000,
    p75TotalComp: 390000,
    p90TotalComp: 465000,
    medianBase: 185000,
    medianEquityAnnual: 110000,
    medianBonus: 30000,
  },
};

/**
 * Calculates 4-year monthly & quarterly RSU vesting schedule points based on schedule type.
 */
export function calculateVestingCurve(
  totalGrantValue: number,
  scheduleType: VestingScheduleType,
  cagrStockGrowth: number = 0.08
): EquityCurvePoint[] {
  const points: EquityCurvePoint[] = [];

  // Year 1 to 4 annual vesting fractions
  let yearlyFractions: [number, number, number, number] = [0.25, 0.25, 0.25, 0.25];
  if (scheduleType === "amazon_backloaded") {
    yearlyFractions = [0.05, 0.15, 0.40, 0.40];
  } else if (scheduleType === "meta_frontloaded") {
    yearlyFractions = [0.33, 0.33, 0.22, 0.12];
  }

  let cumulativeVestedValue = 0;
  let cumulativePercent = 0;

  for (let month = 1; month <= 48; month++) {
    const yearIdx = Math.floor((month - 1) / 12);
    const yearAnnualStockMultiplier = Math.pow(1 + cagrStockGrowth, yearIdx);
    const yearShareFraction = yearlyFractions[yearIdx];
    let monthFraction = 0;
    let isCliff = false;

    if (scheduleType === "standard_quarterly" || scheduleType === "meta_frontloaded") {
      // 1-year cliff at month 12
      if (month < 12) {
        monthFraction = 0;
      } else if (month === 12) {
        monthFraction = yearlyFractions[0];
        isCliff = true;
      } else if (month % 3 === 0) {
        monthFraction = yearShareFraction / 4;
      }
    } else if (scheduleType === "amazon_backloaded") {
      // 5% year 1, 15% year 2 (vested every 6 mos), 40% year 3 (monthly), 40% year 4 (monthly)
      if (month < 12) {
        monthFraction = 0;
      } else if (month === 12) {
        monthFraction = 0.05;
        isCliff = true;
      } else if (month === 18 || month === 24) {
        monthFraction = 0.075;
      } else if (month > 24) {
        monthFraction = 0.40 / 12;
      }
    } else {
      // uniform monthly
      monthFraction = 1 / 48;
    }

    const monthValue = totalGrantValue * monthFraction * yearAnnualStockMultiplier;
    cumulativeVestedValue += monthValue;
    cumulativePercent += monthFraction;

    if (month % 3 === 0 || month === 12 || month === 48) {
      points.push({
        month,
        yearNumber: yearIdx + 1,
        vestedPercentCumulative: Math.min(100, Math.round(cumulativePercent * 1000) / 10),
        vestedValueCumulative: Math.round(cumulativeVestedValue),
        quarterlyVestValue: Math.round(monthValue),
        isCliffEvent: isCliff,
      });
    }
  }

  return points;
}

/**
 * Evaluates candidate's offer against market bands and synthesizes negotiation counter-offers.
 */
export function simulateCompensationOffer(
  params: EquityCalculatorParams
): CounterOfferScriptResult {
  const bandKey = `${params.level.split(" ")[0]}_${params.metro.includes("San Francisco") ? "SF" : "REMOTE"}`;
  const benchmark = BENCHMARK_LEVEL_BANDS[bandKey] || BENCHMARK_LEVEL_BANDS["L5_SF"];

  const curve = calculateVestingCurve(
    params.fourYearRsuGrant,
    params.scheduleType,
    params.expectedAnnualStockAppreciation
  );

  const year1VestingValue = curve.find((p) => p.month === 12)?.vestedValueCumulative || params.fourYearRsuGrant * 0.25;
  const annualBonus = params.baseSalary * (params.annualBonusTargetPercent / 100) * params.bonusPerformanceMultiplier;
  const year1TotalComp = params.baseSalary + annualBonus + year1VestingValue + (params.signingBonusYear1 || 0);

  const year4VestingCumulative = curve[curve.length - 1]?.vestedValueCumulative || params.fourYearRsuGrant;
  const year4AnnualizedEquity = year4VestingCumulative / 4;
  const year4TotalComp = params.baseSalary + annualBonus + year4AnnualizedEquity;

  // Determine market percentile
  let standing: CounterOfferScriptResult["percentileStanding"] = "50th - 75th";
  if (year1TotalComp < benchmark.p25TotalComp) {
    standing = "Below 25th";
  } else if (year1TotalComp < benchmark.p50MedianTotalComp) {
    standing = "25th - 50th";
  } else if (year1TotalComp < benchmark.p75TotalComp) {
    standing = "50th - 75th";
  } else if (year1TotalComp < benchmark.p90TotalComp) {
    standing = "75th - 90th";
  } else {
    standing = "Top 10% (Market Leading)";
  }

  const targetMarketP75 = benchmark.p75TotalComp;
  const marketGap = Math.max(0, targetMarketP75 - year1TotalComp);

  // Recommended counter ask
  const recommendedAsk = {
    baseSalaryAsk: Math.round(params.baseSalary + marketGap * 0.4),
    rsuGrantAsk: Math.round(params.fourYearRsuGrant + marketGap * 0.5 * 4),
    signingBonusAsk: Math.round((params.signingBonusYear1 || 0) + marketGap * 0.2),
  };

  const scripts = [
    {
      title: "Data-Backed Market Alignment (Levels.fyi Benchmark)",
      scenario: "When the offer is below the 75th percentile for your verified leveling and metro.",
      script: `Thank you for extending this offer! I am genuinely excited about the team's mission and technical roadmap. Based on current verified market data for ${params.level} roles in the ${params.metro} area (median TC $${benchmark.p50MedianTotalComp.toLocaleString()}, 75th percentile $${benchmark.p75TotalComp.toLocaleString()}), my current proposed Year 1 compensation ($${Math.round(year1TotalComp).toLocaleString()}) sits around the ${standing} band. Given the scope of architectural ownership and immediate impact I will bring, would the team be open to adjusting the base to $${recommendedAsk.baseSalaryAsk.toLocaleString()} and the initial equity grant to $${recommendedAsk.rsuGrantAsk.toLocaleString()}?`,
      keyLevers: ["Verified 75th Percentile Market Benchmark", "Senior Architectural Ownership", "Base + RSU Balance"],
    },
    {
      title: "Backloaded Vesting Compensation Neutralizer",
      scenario: "When company utilizes Amazon-style backloaded RSU vesting (5%/15%/40%/40%).",
      script: `I am very enthusiastic about joining. One item that stands out in reviewing the structure is the backloaded vesting schedule, which results in a significant cash-flow discrepancy in Years 1 & 2 before the 40% tranches vest in Year 3. To bridge this gap and remain competitive with standard quarterly vesting offers, could we structure a Year 1 signing bonus of $${Math.max(25000, Math.round(recommendedAsk.signingBonusAsk)).toLocaleString()} and an additional $${Math.round(recommendedAsk.signingBonusAsk * 0.75).toLocaleString()} in Year 2?`,
      keyLevers: ["First-Year Cash Flow Bridge", "Signing Bonus Offsetting Backload", "Retention Incentive"],
    },
    {
      title: "Competing Offer Leverage",
      scenario: "Leveraging another active pipeline or existing unvested equity golden handcuffs.",
      script: `I want to be completely transparent that I have a parallel conversation progressing where the total package is tracking around $${targetMarketP75.toLocaleString()}. Because this team and problem space remain my top preference, if we can close the delta with an adjusted equity grant of $${recommendedAsk.rsuGrantAsk.toLocaleString()} over 4 years, I would be thrilled to sign immediately and decline other active conversations.`,
      keyLevers: ["Exploding Commitment / Ready to Sign", "Explicit Numerical Anchor", "Mutual De-risking"],
    },
  ];

  return {
    percentileStanding: standing,
    calculatedYear1TotalComp: Math.round(year1TotalComp),
    calculatedYear4TotalComp: Math.round(year4TotalComp),
    equityVestingCurve: curve,
    marketGapAmount: Math.round(marketGap),
    recommendedCounterAsk: recommendedAsk,
    tailoredScripts: scripts,
  };
}
