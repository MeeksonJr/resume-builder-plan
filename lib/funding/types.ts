export type FundingKind = "scholarship" | "grant" | "fellowship" | "aid";

export interface FundingOpportunity {
  id: string;
  kind: FundingKind;
  title: string;
  provider: string;
  description: string;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  deadline: string | null;
  application_url: string;
  source_url: string;
  source_name: string;
  education_levels: string[];
  majors: string[];
  careers: string[];
  keywords: string[];
  year: number | null;
  eligibility: string[];
  requirements: Record<string, unknown>;
  fetched_at: string;
  verified_at: string | null;
  is_active: boolean;
  // User specific transient / joined data
  user_status?: "saved" | "applying" | "applied" | "dismissed" | null;
  essay_draft?: string | null;
  notes?: string | null;
  match_score?: number | null;
  why_you_match?: string[] | null;
  potential_blockers?: string[] | null;
}

export function formatFundingAmount(opportunity: FundingOpportunity) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opportunity.currency || "USD",
    maximumFractionDigits: 0,
  });

  if (opportunity.amount_min == null && opportunity.amount_max == null) {
    return "Amount varies";
  }

  if (opportunity.amount_min != null && opportunity.amount_max != null && opportunity.amount_min !== opportunity.amount_max) {
    return `${formatter.format(opportunity.amount_min)} - ${formatter.format(opportunity.amount_max)}`;
  }

  return `Up to ${formatter.format(opportunity.amount_max ?? opportunity.amount_min ?? 0)}`;
}
