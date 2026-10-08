export interface CompanySentiment {
  company: string;
  overallRating: number; // e.g. 4.2
  recommendToFriendRate: number; // e.g. 84%
  workLifeBalanceRating: number; // e.g. 4.1
  compensationRating: number; // e.g. 4.3
  careerGrowthRating: number; // e.g. 4.0
  prosSummary: string[];
  consSummary: string[];
}

export function getCompanySentiment(companyName: string): CompanySentiment {
  return {
    company: companyName,
    overallRating: 4.3,
    recommendToFriendRate: 85,
    workLifeBalanceRating: 4.2,
    compensationRating: 4.4,
    careerGrowthRating: 4.1,
    prosSummary: [
      "Competitive entry-level collegiate compensation and 401(k) matching",
      "Robust mentorship from principal engineers and tech leads",
      "Flexible hybrid and remote schedule policies",
    ],
    consSummary: [
      "Large enterprise processes can require multiple approvals",
      "Sprint cycles can be fast-paced before major product launches",
    ],
  };
}
