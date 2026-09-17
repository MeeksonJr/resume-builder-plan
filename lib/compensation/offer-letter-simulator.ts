/**
 * ResumeForge AI Offer Letter Analyzer & Compensation Equity Simulator (Phase 57)
 * Models tech compensation (Base, Bonus, Equity RSUs / Stock Options),
 * simulates 4-year vesting trajectories under multiple market scenarios,
 * and synthesizes tactical counter-offer negotiation scripts.
 */

export type EquityType = "rsu" | "iso_options" | "nso_options";

export type CompanyStage =
  | "seed"
  | "series_a"
  | "series_b_c"
  | "late_growth"
  | "pre_ipo"
  | "public";

export interface OfferDetails {
  companyName: string;
  roleTitle: string;
  baseSalary: number;
  signingBonus: number;
  annualBonusPercent: number; // e.g. 15 for 15%
  equityType: EquityType;
  equityGrantUnits: number; // Number of RSUs or Options
  equityGrantValue: number; // Total dollar value of grant (4-yr)
  vestingScheduleYears: number; // typically 4
  cliffMonths: number; // typically 12
  companyStage: CompanyStage;
  stockPriceAtGrant?: number;
  strikePrice?: number;
}

export interface VestingYearProjection {
  year: number;
  vestedPercent: number;
  vestedUnits: number;
  baseEarnings: number;
  bonusEarnings: number;
  equityConservative: number; // 5% annual growth or stable
  equityTarget: number; // 15% annual growth
  equityBull: number; // 35% annual growth / strong exit
  totalTargetComp: number;
}

export interface CompensationAnalysisResult {
  firstYearTotalComp: number;
  fourYearTotalCompTarget: number;
  yearlyProjections: VestingYearProjection[];
  equityBreakdown: {
    annualVestingValueTarget: number;
    optionsExerciseCost?: number;
    spreadValueTarget?: number;
  };
  negotiationLevers: {
    lever: string;
    description: string;
    suggestedAsk: string;
    impactScore: "high" | "medium" | "low";
  }[];
  aiCounterOfferScript: string;
}

/**
 * Simulates the 4-year vesting and total compensation trajectory.
 */
export function simulateOfferCompensation(offer: OfferDetails): CompensationAnalysisResult {
  const years = offer.vestingScheduleYears || 4;
  const yearlyProjections: VestingYearProjection[] = [];

  const annualBonus = (offer.baseSalary * (offer.annualBonusPercent || 0)) / 100;
  const annualEquityUnits = offer.equityGrantUnits / years;
  const baseGrantPerYear = offer.equityGrantValue / years;

  let cumulativeTargetComp = 0;

  for (let y = 1; y <= years; y++) {
    // Standard 1-year cliff: Year 1 gets 25%, subsequent years 25% each
    const vestedPercent = Math.round((100 / years) * y);
    const vestedUnits = Math.round(annualEquityUnits * y);

    // Compound growth rates:
    const conservativeMult = Math.pow(1.05, y - 1);
    const targetMult = Math.pow(1.15, y - 1);
    const bullMult = Math.pow(1.35, y - 1);

    const equityConservative = Math.round(baseGrantPerYear * conservativeMult);
    const equityTarget = Math.round(baseGrantPerYear * targetMult);
    const equityBull = Math.round(baseGrantPerYear * bullMult);

    const isYearOne = y === 1;
    const bonusWithSignOn = annualBonus + (isYearOne ? offer.signingBonus || 0 : 0);
    const totalTargetComp = offer.baseSalary + bonusWithSignOn + equityTarget;

    cumulativeTargetComp += totalTargetComp;

    yearlyProjections.push({
      year: y,
      vestedPercent,
      vestedUnits,
      baseEarnings: offer.baseSalary,
      bonusEarnings: bonusWithSignOn,
      equityConservative,
      equityTarget,
      equityBull,
      totalTargetComp,
    });
  }

  const firstYearComp = yearlyProjections[0].totalTargetComp;

  // Compute negotiation levers tailored to the company stage
  const negotiationLevers = generateNegotiationLevers(offer);

  // Generate tactical AI counter-offer response email
  const aiCounterOfferScript = generateCounterOfferLetter(offer, negotiationLevers);

  return {
    firstYearTotalComp: firstYearComp,
    fourYearTotalCompTarget: cumulativeTargetComp,
    yearlyProjections,
    equityBreakdown: {
      annualVestingValueTarget: Math.round(baseGrantPerYear * 1.15),
      optionsExerciseCost:
        offer.equityType !== "rsu" && offer.strikePrice
          ? Math.round(offer.equityGrantUnits * offer.strikePrice)
          : undefined,
    },
    negotiationLevers,
    aiCounterOfferScript,
  };
}

/**
 * Identifies high-leverage areas based on company stage and compensation mix.
 */
function generateNegotiationLevers(offer: OfferDetails) {
  const levers = [];

  if (offer.companyStage === "seed" || offer.companyStage === "series_a") {
    levers.push({
      lever: "Equity Percentage Upside",
      description: "Early-stage startups preserve cash by granting larger equity allocations.",
      suggestedAsk: `Request an additional 15–20% equity grant (${Math.round(offer.equityGrantUnits * 0.2)} more units)`,
      impactScore: "high" as const,
    });
    levers.push({
      lever: "Early Exercise & 83(b) Election",
      description: "Allows exercising unvested stock immediately to start the capital gains tax clock at near-zero strike.",
      suggestedAsk: "Request early-exercise provisions with standard company repurchase rights",
      impactScore: "high" as const,
    });
  } else if (offer.companyStage === "public" || offer.companyStage === "late_growth") {
    levers.push({
      lever: "Signing Bonus Acceleration",
      description: "Big tech and public companies readily increase sign-on bonuses to bridge unvested equity from current employer.",
      suggestedAsk: `Ask for a $${Math.round((offer.signingBonus || 15000) * 1.5).toLocaleString()} signing bonus (+$${Math.round((offer.signingBonus || 15000) * 0.5).toLocaleString()})`,
      impactScore: "high" as const,
    });
    levers.push({
      lever: "Base Salary Realignment",
      description: "Anchor base salary to top-of-band market rates for your specific tier.",
      suggestedAsk: `Target $${Math.round(offer.baseSalary * 1.08).toLocaleString()} (+8% base increase)`,
      impactScore: "medium" as const,
    });
  }

  levers.push({
    lever: "Remote Work & Professional Development Stipend",
    description: "Low-friction request for annual conference budgets, home office ergonomics, and certifications.",
    suggestedAsk: "Request $3,500/year recurring education & workspace stipend",
    impactScore: "medium" as const,
  });

  return levers;
}

/**
 * Synthesizes a polished, professional counter-offer communication.
 */
function generateCounterOfferLetter(
  offer: OfferDetails,
  levers: { lever: string; suggestedAsk: string }[]
): string {
  const targetBase = Math.round(offer.baseSalary * 1.08);
  const targetSignOn = Math.round((offer.signingBonus || 15000) * 1.4);

  return `Dear [Hiring Manager / Recruiter Name],

Thank you so much for extending the offer to join ${offer.companyName} as ${offer.roleTitle}. I am genuinely thrilled about the team's mission, the technical challenges ahead, and the opportunity to make a direct impact.

After reviewing the full package against current market data for this tier and weighing ongoing conversations, I am enthusiastic about moving forward. To make this an immediate and unequivocal 'yes,' I would like to discuss adjustments to two key components:

1. Base Compensation: In alignment with the scope of ownership for this position, I would like to request a base salary of $${targetBase.toLocaleString()} (from $${offer.baseSalary.toLocaleString()}).
2. Signing / Equity Alignment: To offset unvested equity from my current role, an increase in the signing bonus to $${targetSignOn.toLocaleString()}${
    offer.companyStage === "seed" || offer.companyStage === "series_a"
      ? " or an additional equity allocation"
      : ""
  } would bridge this transition seamlessly.

If we can reach agreement on these adjustments, I am prepared to sign the revised offer letter immediately and begin coordinating my start date.

Thank you again for your partnership and enthusiasm throughout this process. I look forward to your thoughts!

Warm regards,

[Your Name]
[Your Phone Number] | [Your LinkedIn Profile]`.trim();
}
