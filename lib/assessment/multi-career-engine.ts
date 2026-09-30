/**
 * ResumeForge Multi-Career & Skill Assessment Engine
 * 
 * Supports all career disciplines (Healthcare, Product, Finance, Marketing, Sales,
 * HR, Design, Operations, Legal, Engineering, and custom user-entered roles).
 * 
 * Features:
 * - Situational Judgment & Decision-Making Dilemmas
 * - Applied Case Study & Real-World Scenario Challenges
 * - Dynamic AI-generated role assessments for any custom career/skill
 * - Deterministic HMAC-SHA256 Cryptographic Skill Badges
 */

import { generateCryptographicBadgeSignature, getBadgeVerificationUrl } from "./skill-sandbox-engine";

export type ExperienceLevel = "Entry Level" | "Mid Level" | "Senior Specialist" | "Executive / Director";

export interface CompetencyScore {
  name: string;
  score: number; // 0 - 100
  weight: number;
}

export interface SituationalOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  scoreWeight: number; // 0 to 1
  rationale: string;
}

export interface SituationalQuestion {
  id: string;
  competency: string;
  scenario: string;
  question: string;
  options: SituationalOption[];
}

export interface PracticalCaseStudy {
  id: string;
  title: string;
  brief: string;
  context: string;
  prompt: string;
  rubric: {
    criterion: string;
    description: string;
    points: number;
  }[];
  sampleGoodAnswerTips: string[];
}

export interface CareerAssessmentTrack {
  id: string;
  careerField: string;
  category: string;
  title: string;
  iconName: string;
  experienceLevel: ExperienceLevel;
  timeLimitMinutes: number;
  overview: string;
  keyCompetencies: string[];
  situationalQuestions: SituationalQuestion[];
  caseStudy: PracticalCaseStudy;
}

export interface MultiCareerBadge {
  badgeId: string;
  candidateName: string;
  careerField: string;
  trackTitle: string;
  experienceLevel: ExperienceLevel;
  overallScore: number;
  performanceTier: "Distinguished Fellow" | "Senior Master" | "Certified Practitioner" | "Foundational Associate";
  competencies: { name: string; score: number }[];
  issuedAt: string;
  signatureAlgorithm: "HMAC-SHA256";
  signatureHash: string;
  verifiablePayload: string;
  explorerUrl: string;
}

export interface AssessmentSubmission {
  candidateName: string;
  trackId: string;
  selectedAnswers: Record<string, string>; // questionId -> optionId
  caseStudyAnswer: string;
  timeSpentSeconds: number;
}

export interface AssessmentEvaluationResult {
  passed: boolean;
  overallScore: number; // 0 - 100
  performanceTier: MultiCareerBadge["performanceTier"];
  situationalScore: number;
  caseStudyScore: number;
  competencyBreakdown: { name: string; score: number }[];
  feedback: {
    strengths: string[];
    growthAreas: string[];
    caseStudyCritique: string;
  };
  badge?: MultiCareerBadge;
}

/**
 * Curated Pre-Configured Assessment Tracks for Major Non-Coding and Technical Disciplines
 */
export const CURATED_CAREER_TRACKS: CareerAssessmentTrack[] = [
  // 1. Healthcare & Clinical Nursing
  {
    id: "healthcare-clinical-triage",
    careerField: "Healthcare & Nursing",
    category: "Healthcare & Medicine",
    title: "Clinical Patient Triage & Critical Care Decision-Making",
    iconName: "Stethoscope",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess clinical prioritization, emergency triage protocols (ESI), pharmacological safety checks, and interdisciplinary patient advocacy under acute distress.",
    keyCompetencies: ["Emergency Triage Prioritization", "Pharmacological Safety & Dosage", "HIPAA & Patient Advocacy", "Interprofessional Communication"],
    situationalQuestions: [
      {
        id: "hc-q1",
        competency: "Emergency Triage Prioritization",
        scenario: "You are the lead triage nurse in an emergency department operating at 115% capacity. Four patients present within a 3-minute window.",
        question: "Which patient should be immediately assigned ESI Level 2 (high risk/confused/severe pain) and routed directly to a resuscitation bed?",
        options: [
          {
            id: "opt-1",
            text: "A 48-year-old with sudden-onset tearing chest pain radiating to the back, blood pressure 198/112 mmHg, and diaphoresis.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Classic presentation of acute aortic dissection or acute coronary syndrome with hypertensive crisis requiring immediate Level 2 emergency stabilization."
          },
          {
            id: "opt-2",
            text: "A 22-year-old with an isolated closed wrist deformity after a sports fall, capillary refill < 2s, reporting 8/10 pain.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "ESI Level 4 or 3 depending on resource needs (X-ray, splinting), but hemodynamically stable without life-threat."
          },
          {
            id: "opt-3",
            text: "A 35-year-old with productive cough, temperature 38.4°C (101.1°F), SpO2 97% on room air, and normal respiratory rate.",
            isCorrect: false,
            scoreWeight: 0.3,
            rationale: "ESI Level 3; requires chest X-ray and lab work but vitals do not indicate acute decompensation."
          },
          {
            id: "opt-4",
            text: "A 60-year-old requesting medication refills for chronic hypertension with blood pressure 150/90 mmHg.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "ESI Level 5; non-urgent ambulatory resource."
          }
        ]
      },
      {
        id: "hc-q2",
        competency: "Pharmacological Safety & Dosage",
        scenario: "An order arrives for continuous intravenous infusion of regular insulin for a patient in Diabetic Ketoacidosis (DKA). The order states 'Administer 50 units Regular Insulin IV bolus followed by 0.5 units/kg/hr infusion'.",
        question: "What is your immediate nursing action?",
        options: [
          {
            id: "opt-1",
            text: "Hold the medication immediately and contact the prescribing physician to question both the excessive bolus and infusion rate, referencing standard ADA DKA guidelines (typically 0.1 units/kg/hr).",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Standard clinical guidelines caution against massive rapid insulin boluses due to profound risk of fatal hypokalemia, cerebral edema, and sudden hypoglycemia."
          },
          {
            id: "opt-2",
            text: "Administer the 50 unit bolus immediately to arrest ketone production, then verify potassium levels before starting the infusion.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Dangerous error: 50 units IV bolus is 5-10x standard adult dosage and could trigger lethal arrhythmia."
          },
          {
            id: "opt-3",
            text: "Reduce the rate arbitrarily to 5 units/hr without consulting the physician and document as physician verbal order.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Violates scope of practice and pharmacological administration standards."
          },
          {
            id: "opt-4",
            text: "Request a second nurse check the pump calculation and proceed with the ordered dosage.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "Dual check is good practice, but the underlying order itself is clinically hazardous and must be challenged."
          }
        ]
      }
    ],
    caseStudy: {
      id: "hc-cs-1",
      title: "Acute Decompensation & Family Surrogacy Dilemma",
      brief: "Manage a high-stakes clinical deterioration accompanied by conflicting family directives and advance directives.",
      context: "A 79-year-old patient admitted with aspiration pneumonia deteriorates into septic shock (BP 78/42, HR 134, SpO2 84% on BiPAP). The patient's chart contains a verified DNR/DNI (Do Not Resuscitate / Do Not Intubate) order signed 2 weeks ago while lucid. The patient's visiting adult child arrives, becomes distraught, and demands immediate endotracheal intubation, threatening legal action against nursing staff.",
      prompt: "Detail your step-by-step clinical management and ethical de-escalation plan. Explain how you uphold patient autonomy, manage comfort and hemodynamics, and communicate with the family member during active crisis.",
      rubric: [
        { criterion: "Patient Autonomy & Legal Ethics", description: "Recognizes legal primacy of the patient's existing valid DNR/DNI order while seeking Medical Power of Attorney clarification.", points: 30 },
        { criterion: "Acute Clinical Interventions", description: "Provides maximal medical therapies compliant with DNR (IV fluid bolus, vasopressors, supplemental oxygen/suctioning, palliative comfort).", points: 40 },
        { criterion: "Crisis Communication & Empathy", description: "De-escalates family distress with clear, non-defensive empathy, explains comfort care, and engages the palliative/physician team.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Reassure the family member that 'DNR does not mean do not treat' — explain active aggressive medical interventions being deployed (pressors, antibiotics).",
        "Gently explain the patient's documented wishes and focus on the patient's dignity and comfort.",
        "Summon attending physician and hospital palliative/ethics liaison."
      ]
    }
  },

  // 2. Product Management & Strategy
  {
    id: "product-strategy-prioritization",
    careerField: "Product Management",
    category: "Product & Strategy",
    title: "Product Strategy, RICE Prioritization & Executive Trade-offs",
    iconName: "Target",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Evaluate your capability to lead cross-functional roadmaps, arbitrate between enterprise sales pressure and technical debt, and drive outcome-driven product discovery.",
    keyCompetencies: ["Framework Prioritization (RICE/Value vs Effort)", "Product Discovery & User Insights", "Stakeholder Alignment & Negotiation", "KPIs & North Star Metric Design"],
    situationalQuestions: [
      {
        id: "pm-q1",
        competency: "Stakeholder Alignment & Negotiation",
        scenario: "The VP of Enterprise Sales demands that the engineering team halt current sprint commitments to build a bespoke single-tenant export feature promised to close a $1.2M annual contract, bypassing the quarterly roadmap.",
        question: "How should a Principal Product Manager respond to balance revenue impact against architectural roadmap velocity?",
        options: [
          {
            id: "opt-1",
            text: "Evaluate the requested feature's alignment with the broader product vision, calculate the opportunity cost and technical debt, and propose a phased generalized capability that solves the customer's root problem without creating bespoke architectural divergence.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Protects platform architecture from fragmented custom forks while actively partnering with Sales to discover the real business need and monetize scalable solutions."
          },
          {
            id: "opt-2",
            text: "Refuse the request outright, reminding the VP that sales has no governance authority over engineering sprint backlogs.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Antagonistic, ignores material commercial business opportunities, and fractures cross-executive trust."
          },
          {
            id: "opt-3",
            text: "Immediately pause all sprint goals and assign the entire backend team to build the requested custom export to secure the ARR.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "Builds dangerous precedent of sales-led roadmap derailment, accumulating debilitating tech debt and customer churn."
          },
          {
            id: "opt-4",
            text: "Tell the customer they can hire an external contractor to build an unofficial API scraper.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Unprofessional and creates security/compliance risks."
          }
        ]
      },
      {
        id: "pm-q2",
        competency: "KPIs & North Star Metric Design",
        scenario: "Your B2B SaaS onboarding funnel shows high user registration (10,000/mo), but 30-day cohort retention drops from 68% to 14%.",
        question: "Which metric is the most effective diagnostic leading indicator for discovering the retention drop-off?",
        options: [
          {
            id: "opt-1",
            text: "Time-to-First-Value (TTFV) and activation milestone completion rate within the first 72 hours of account setup.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Activation and TTFV directly correlate with long-term retention; users who fail to reach the core 'Aha!' moment in the first 72 hours predictably churn by day 30."
          },
          {
            id: "opt-2",
            text: "Total monthly pageviews on the user account settings profile page.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Vanity metric that provides zero insight into user workflow completion or core product value."
          },
          {
            id: "opt-3",
            text: "Annual Net Promoter Score (NPS) sent 6 months after signup.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "Lagging indicator that never reaches the 86% of users who already abandoned the app in month one."
          },
          {
            id: "opt-4",
            text: "The number of marketing drip emails opened by the user.",
            isCorrect: false,
            scoreWeight: 0.3,
            rationale: "Measures email deliverability/subject line CTR, not in-app product value realization."
          }
        ]
      }
    ],
    caseStudy: {
      id: "pm-cs-1",
      title: "Self-Serve PLG vs Enterprise Governance Dilemma",
      brief: "Architect an end-to-end product strategy to unlock self-serve growth without cannibalizing high-touch enterprise deal flow.",
      context: "Your company provides a collaboration workspace tool historically sold top-down via sales reps to Fortune 500 companies ($60k ACV). Growth is slowing due to long 9-month sales cycles. Competitors are rapidly eating bottom-up market share via frictionless freemium PLG (Product-Led Growth).",
      prompt: "Formulate a Product Discovery & Go-To-Market blueprint: 1) What is your freemium monetization fence (usage, features, or seats)? 2) How do you design the automated self-serve upgrade trigger into an enterprise sales pipeline? 3) What metrics do you instrument to monitor cannibalization?",
      rubric: [
        { criterion: "Strategic Monetization Fencing", description: "Clear rationale for what features stay free vs gated (e.g. SSO, audit logs, unlimited historical data vs basic seats).", points: 35 },
        { criterion: "Product-Qualified Lead (PQL) Engine", description: "Actionable definition of PQL scoring based on team virality, domain expansion, and feature thresholds.", points: 35 },
        { criterion: "Risk & Cannibalization Controls", description: "Monitors Net Revenue Retention (NRR) and average contract size with explicit boundary rules.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Gate enterprise-grade security (SAML/SCIM, HIPAA/SOC2 compliance, DLP) while keeping core collaboration frictionless.",
        "Define PQL as >5 active domain members collaborating across 3+ shared documents within 14 days.",
        "Set up an automated alert to routing SDRs when a corporate domain crosses the viral threshold."
      ]
    }
  },

  // 3. Digital Marketing & Growth
  {
    id: "digital-marketing-growth",
    careerField: "Marketing & Growth",
    category: "Marketing & Sales",
    title: "Omnichannel Growth Strategy, Attribution & CAC/LTV Optimization",
    iconName: "TrendingUp",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess customer acquisition modeling, multi-touch attribution, conversion rate optimization (CRO), and paid media allocation in privacy-restricted landscapes (iOS ATT/Cookieless).",
    keyCompetencies: ["Paid Media ROAS & CAC Modeling", "Conversion Rate Optimization (CRO)", "Multi-Touch Attribution & Incrementality", "Lifecycle Retention & Email Automation"],
    situationalQuestions: [
      {
        id: "mkt-q1",
        competency: "Paid Media ROAS & CAC Modeling",
        scenario: "Your paid search campaign shows an apparent ROAS of 4.5x in Google Ads, while Meta Ads reports 1.8x ROAS. However, when Google Ads spend was paused for 1 week in a regional geo-holdout experiment, total revenue dropped by only 4%.",
        question: "What does this incrementality experiment reveal, and what strategic media reallocation should you execute?",
        options: [
          {
            id: "opt-1",
            text: "Google Ads was cannibalizing high-intent branded organic search traffic with low incremental lift; budget should be redirected toward prospecting channels that generate net-new demand.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Brand search campaigns often show stellar platform ROAS due to last-click attribution bias, yet yield near-zero incremental revenue when tested against holdouts."
          },
          {
            id: "opt-2",
            text: "Immediately quadruple the Google Ads budget because 4.5x ROAS is higher than Meta.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Ignores experimental causal evidence of near-zero incrementality, wasting precious capital."
          },
          {
            id: "opt-3",
            text: "Shut down Meta Ads immediately since 1.8x is below target.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "Meta typically drives top-of-funnel assisted conversions that last-click models fail to capture."
          },
          {
            id: "opt-4",
            text: "Assume the holdout test was broken and change nothing.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Dismisses scientific marketing testing and wastes optimization opportunities."
          }
        ]
      },
      {
        id: "mkt-q2",
        competency: "Conversion Rate Optimization (CRO)",
        scenario: "An e-commerce checkout step has an 82% abandonment rate on mobile devices (vs 44% on desktop). Heatmaps reveal users repeatedly tapping the postal code field and experiencing keyboard jumping.",
        question: "What is the highest-leverage, evidence-based optimization to deploy first?",
        options: [
          {
            id: "opt-1",
            text: "Implement one-tap express checkout (Apple Pay / Google Pay / Shop Pay) and streamline address autofill with postal code API lookup.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Mobile checkout friction is overwhelmingly solved by digital wallets that bypass 15+ input fields and eliminate formatting errors."
          },
          {
            id: "opt-2",
            text: "Add a 20-question customer satisfaction exit survey modal on cart leave.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Increases frustration and guarantees complete bounce without solving the UX bug."
          },
          {
            id: "opt-3",
            text: "Send a retargeting display ad 30 minutes later offering 5% off.",
            isCorrect: false,
            scoreWeight: 0.3,
            rationale: "Eats margin without fixing the underlying broken checkout interaction."
          },
          {
            id: "opt-4",
            text: "Make the postal code label bold red with an exclamation mark.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Cosmetic tweak that does not address mobile keyboard layout or input fatigue."
          }
        ]
      }
    ],
    caseStudy: {
      id: "mkt-cs-1",
      title: "Growth Engine Re-architecture Under Cookieless Privacy",
      brief: "Formulate a full-funnel acquisition and retention engine for a $15M D2C subscription brand facing a 40% YoY CAC increase.",
      context: "Following Apple ATT and browser third-party cookie deprecation, your client's blended CAC jumped from $35 to $78 against a $90 first-order AOV. LTV at 12 months is $160. Current marketing spend is 90% concentrated on Meta Ads.",
      prompt: "Draft an integrated 90-day turnaround strategy: 1) How will you diversify acquisition channels across non-dependent paid, organic, and creator ecosystems? 2) How will you configure first-party data capture & lifecycle email/SMS to expand 60-day repeat purchase rate? 3) What measurement framework replaces last-click attribution?",
      rubric: [
        { criterion: "Channel Diversification & Creator Ops", description: "Deploys YouTube Shorts/TikTok creator whitelisting, affiliate, SEO, or podcast sponsorship with clear economics.", points: 35 },
        { criterion: "First-Party Data & Retention Velocity", description: "Implements personalized quizzes, SMS winback cadences, and subscription bundles to elevate 60-day LTV.", points: 35 },
        { criterion: "Modern Attribution Framework", description: "Utilizes Marketing Mix Modeling (MMM) alongside geo-lift testing and post-purchase surveys.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Incorporate Post-Purchase 'How did you hear about us?' surveys (Fairing) to triangulate self-reported attribution.",
        "Deploy automated replenishment SMS flows timed to customer consumption cycles (day 21, day 28).",
        "Move from last-touch reporting to blended MER (Marketing Efficiency Ratio) and Contribution Margin."
      ]
    }
  },

  // 4. Financial Modeling & Corporate Finance
  {
    id: "finance-corporate-valuation",
    careerField: "Financial Analysis & Accounting",
    category: "Finance & Accounting",
    title: "Corporate Valuation, Working Capital & Capital Allocation",
    iconName: "DollarSign",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess DCF financial modeling, discounted cash flow rigor, working capital liquidity stress-testing, and M&A capital budgeting decisions.",
    keyCompetencies: ["Discounted Cash Flow (DCF) & WACC", "Working Capital & Cash Flow Liquidity", "Financial Statement Synthesis (3-Statement)", "Capital Structure & Risk Management"],
    situationalQuestions: [
      {
        id: "fin-q1",
        competency: "Discounted Cash Flow (DCF) & WACC",
        scenario: "In a company DCF model, the 10-year Treasury yield jumps from 1.5% to 4.5%, while company debt beta increases due to high leverage.",
        question: "Holding projected unlevered free cash flows constant, what is the mathematical and economic effect on Enterprise Value?",
        options: [
          {
            id: "opt-1",
            text: "WACC rises significantly across both cost of equity and after-tax cost of debt, leading to a substantial decrease in discounted Enterprise Value.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Higher risk-free rates expand the denominator discount rate in the Gordon Growth and discrete DCF formulas, depressing present value of future cash flows."
          },
          {
            id: "opt-2",
            text: "Enterprise value increases because higher interest rates indicate a booming macroeconomic environment.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Fundamental valuation error: discount rates and valuation multiples are inversely related."
          },
          {
            id: "opt-3",
            text: "No impact on DCF valuation because WACC only applies to book value of equity, not market valuation.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Incorrect: WACC is calculated using market values of debt and equity."
          },
          {
            id: "opt-4",
            text: "Only terminal value drops, but the first 5 projection years remain unaffected.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "Every single discrete cash flow year is discounted by (1+WACC)^t, affecting the entire projection horizon."
          }
        ]
      },
      {
        id: "fin-q2",
        competency: "Working Capital & Cash Flow Liquidity",
        scenario: "A manufacturing firm reports $12M in Net Income on the Income Statement, but Cash Flow from Operations (CFO) is negative ($4M) for the third consecutive quarter. Accounts Receivable Days Sales Outstanding (DSO) jumped from 38 days to 94 days.",
        question: "What is the primary corporate governance and balance-sheet risk here?",
        options: [
          {
            id: "opt-1",
            text: "Aggressive revenue recognition or collection failure: sales are booked without cash receipt, creating severe liquidity vulnerability and potential bad-debt write-downs.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "A chronic divergence between Accrual Net Income and Operating Cash Flow driven by ballooning DSO is a classic red flag for channel stuffing, customer insolvency, or loose credit terms."
          },
          {
            id: "opt-2",
            text: "The company is overly conservative and should immediately increase customer credit lines.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Expanding credit lines when DSO is 94 days would exacerbate insolvency risk."
          },
          {
            id: "opt-3",
            text: "This is completely normal and indicates rapid equity growth without working capital friction.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Negative CFO with positive net income is unsustainable and consumes runway rapidly."
          },
          {
            id: "opt-4",
            text: "The company should immediately issue debt dividends to reward shareholders.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Reckless capital management that accelerates bankruptcy."
          }
        ]
      }
    ],
    caseStudy: {
      id: "fin-cs-1",
      title: "M&A Acquisition Synergy & Debt Capacity Stress Test",
      brief: "Evaluate a $250M leveraged buyout (LBO) acquisition proposal in a rising interest rate environment.",
      context: "Target Corp generates $35M in EBITDA with 12% annual growth. The acquiring company plans to finance the $250M purchase price with $160M Senior Secured Debt (SOFR + 425 bps), $40M Mezzanine Subordinated Notes (12% PIK), and $50M Sponsor Equity. Target Corp currently has maintenance CapEx of $8M and cash taxes of $6M.",
      prompt: "Perform a financial risk assessment: 1) Calculate the Debt/EBITDA leverage multiple and Fixed-Charge Coverage Ratio (FCCR). 2) Stress-test what happens if SOFR rises 200 bps or EBITDA contracts 15%. 3) What covenant protections and working capital safeguards must be required?",
      rubric: [
        { criterion: "Debt Multiple & Leverage Calculation", description: "Accurately calculates total leverage ($200M debt / $35M EBITDA = 5.7x) and senior leverage ($160M / $35M = 4.57x).", points: 35 },
        { criterion: "Interest Coverage Sensitivity Stress-Testing", description: "Demonstrates cash interest burden changes and identifies default/breakeven triggers.", points: 35 },
        { criterion: "Credit Agreement Covenants & Capital Structuring", description: "Recommends interest rate caps/hedges, excess cash flow sweeps, and maintenance covenants.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Include mandatory interest rate collar or cap for at least 50% of the floating debt.",
        "Incorporate a 50% Excess Cash Flow sweep to rapidly de-lever from 5.7x to under 3.5x.",
        "Model minimum 1.25x Fixed Charge Coverage Ratio covenant with cure rights."
      ]
    }
  },

  // 5. Human Resources & People Operations
  {
    id: "hr-people-operations",
    careerField: "Human Resources & People Ops",
    category: "People & Talent",
    title: "Organizational Design, Conflict Resolution & Labor Law Compliance",
    iconName: "Users",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess workplace grievance investigation, FLSA/EEOC regulatory compliance, retention architecture, and sensitive executive offboarding.",
    keyCompetencies: ["Workplace Investigation & Grievance", "Labor Compliance & Employment Law", "Talent Retention & Performance Systems", "Compensation Benchmarking & Equity"],
    situationalQuestions: [
      {
        id: "hr-q1",
        competency: "Workplace Investigation & Grievance",
        scenario: "An individual contributor approaches HR stating that their direct manager has been making uncomfortable personal remarks during 1-on-1s. The employee requests that HR 'keep it completely confidential and promise not to do or say anything yet'.",
        question: "How should an HR professional respond?",
        options: [
          {
            id: "opt-1",
            text: "Explain empathetically that while HR will maintain strict discretion on a need-to-know basis, the organization has a legal obligation under Title VII to investigate and protect employees from potential harassment, and outline what the supportive investigation process entails.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "HR cannot promise absolute confidentiality regarding allegations of harassment; doing so exposes both the employee to ongoing misconduct and the employer to severe liability."
          },
          {
            id: "opt-2",
            text: "Promise 100% total secrecy, file the notes in an encrypted personal folder, and take zero action until the employee decides to quit.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Gross compliance negligence that breaches duty of care and workplace safety laws."
          },
          {
            id: "opt-3",
            text: "Immediately send a company-wide email warning all managers to stop making personal comments.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Violates privacy, alerts the subject without investigation, and sparks unnecessary panic."
          },
          {
            id: "opt-4",
            text: "Instruct the employee to confront the manager publicly in their next team standup meeting.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Hostile and dangerous advice that invites retaliation."
          }
        ]
      },
      {
        id: "hr-q2",
        competency: "Labor Compliance & Employment Law",
        scenario: "The engineering lead wants to reclassify 12 junior software support coordinators from non-exempt (hourly, overtime-eligible) to exempt (salaried) to eliminate overtime pay during weekend deployments, without changing their day-to-day duties.",
        question: "What is the legal evaluation under the Fair Labor Standards Act (FLSA)?",
        options: [
          {
            id: "opt-1",
            text: "Deny the reclassification: FLSA exemption is determined by statutory duties tests (administrative, executive, computer, or professional) and discretion/independent judgment, not job titles or management desire to avoid overtime.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Misclassifying non-exempt support workers as exempt triggers severe wage-and-hour lawsuits, back pay liability with liquidated damages, and civil penalties."
          },
          {
            id: "opt-2",
            text: "Approve the reclassification as long as their new salary exceeds minimum wage by $1.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Ignores the federal salary threshold ($43,888+ / $58,656) and the mandatory duties test."
          },
          {
            id: "opt-3",
            text: "Allow them to sign a waiver stating they voluntarily forfeit overtime pay rights.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "FLSA employee rights cannot be legally waived by private contract."
          },
          {
            id: "opt-4",
            text: "Convert them to 1099 independent contractors while maintaining mandatory 9-to-5 desk hours.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Blatant worker misclassification violation under IRS/DOL common law guidelines."
          }
        ]
      }
    ],
    caseStudy: {
      id: "hr-cs-1",
      title: "Restructuring, RIF Execution & Cultural Continuity",
      brief: "Plan and execute an organizational reduction in force (RIF) impacting 15% of headcount while mitigating disparate impact and cultural demoralization.",
      context: "Due to macro shifts, your executive committee mandates a 15% reduction across engineering and marketing within 4 weeks. You must lead the selection criteria, legal compliance (WARN Act, OWBPA), severance packaging, manager enablement, and survivor guilt mitigation.",
      prompt: "Present a comprehensive RIF roadmap: 1) What objective, legally defensible selection criteria do you use to avoid disparate impact? 2) What are the crucial compliance milestones (Older Workers Benefit Protection Act, notification periods)? 3) How do you support retained employees post-announcement?",
      rubric: [
        { criterion: "Selection Criteria & Disparate Impact Audit", description: "Establishes objective job-related criteria (role elimination, skills redundancy) and runs adverse impact statistical testing.", points: 35 },
        { criterion: "OWBPA, WARN & Severance Compliance", description: "Accounts for 45-day review / 7-day revocation periods for 40+ workers, informational disclosures, and WARN thresholds.", points: 35 },
        { criterion: "Change Management & Culture Retention", description: "Direct, transparent leadership communication, role clarity sessions, and psychological safety check-ins.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Conduct an adverse impact statistical analysis (4/5ths rule and Chi-square) before finalizing impacted lists.",
        "Equip people managers with empathetic scripts and live HR partner pairing for 1-on-1 notification conversations.",
        "Offer transition support including COBRA subsidies, career coaching, and outplacement services."
      ]
    }
  },

  // 6. UI/UX & Product Design
  {
    id: "ux-product-design",
    careerField: "UI/UX & Product Design",
    category: "Design & Creative",
    title: "User Research, Design Systems & Usability Heuristics",
    iconName: "Palette",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess design system architecture (tokens, accessibility WCAG 2.2 AA), interaction heuristics, user interview synthesis, and cross-platform responsive UX.",
    keyCompetencies: ["Accessibility & WCAG 2.2 Compliance", "Design System Token Architecture", "Usability Heuristics & Information Architecture", "User Research & Interaction Design"],
    situationalQuestions: [
      {
        id: "ux-q1",
        competency: "Accessibility & WCAG 2.2 Compliance",
        scenario: "Your design system team proposes using a subtle light-gray placeholder text (#A0A0A0) on white background with no floating label in form inputs to achieve a 'minimalist aesthetic'.",
        question: "What usability and accessibility violations does this introduce under WCAG 2.2 Level AA?",
        options: [
          {
            id: "opt-1",
            text: "Fails the 4.5:1 text contrast ratio requirement for normal text and eliminates persistent field context when users type, disproportionately harming users with cognitive impairments and low vision.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "#A0A0A0 on white achieves only ~2.9:1 contrast (failing 4.5:1 AA), and placeholder text disappears on input, forcing users to delete text to recall what the field asked for."
          },
          {
            id: "opt-2",
            text: "It is fully compliant as long as the submit button is neon green.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Unrelated and absurd."
          },
          {
            id: "opt-3",
            text: "Only fails for screen readers, but sighted users experience zero friction.",
            isCorrect: false,
            scoreWeight: 0.2,
            rationale: "Sighted users with cataracts, glare, or aging eyes heavily struggle with low contrast placeholders."
          },
          {
            id: "opt-4",
            text: "Complies with WCAG 2.2 as long as an aria-label attribute is added in code.",
            isCorrect: false,
            scoreWeight: 0.3,
            rationale: "ARIA does not fix visual contrast failures for sighted users."
          }
        ]
      },
      {
        id: "ux-q2",
        competency: "Usability Heuristics & Information Architecture",
        scenario: "Users on a complex B2B analytics dashboard report feeling overwhelmed by a data table with 42 visible columns, causing critical metrics to be missed.",
        question: "Which progressive disclosure pattern best resolves this cognitive overload while preserving expert power-user workflows?",
        options: [
          {
            id: "opt-1",
            text: "Default to a curated view of 7-8 primary metrics, accompanied by customizable column selectors, saved view presets, and expandable slide-over row drawers for deep attribute inspection.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Progressive disclosure provides immediate scannability for 80% of routine workflows while giving advanced analysts instant access to granular columns when needed."
          },
          {
            id: "opt-2",
            text: "Shrink the font size to 8px so all 42 columns fit on a standard 13-inch laptop screen without scrolling.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Destroys legibility and increases cognitive exhaustion."
          },
          {
            id: "opt-3",
            text: "Delete 34 columns permanently from the product database without consulting user personas.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Risks breaking critical reporting workflows required by key accounts."
          },
          {
            id: "opt-4",
            text: "Add a 45-second animated tutorial video that autoplays on every login.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Annoying pattern that fails to fix bad information hierarchy."
          }
        ]
      }
    ],
    caseStudy: {
      id: "ux-cs-1",
      title: "Omnichannel Design System Modernization & Dark Mode",
      brief: "Architect a scalable token-based design system supporting dynamic themes (Light, Dark, High-Contrast) across Web and Mobile.",
      context: "Your legacy application has 14 different shades of blue, hardcoded hex values in 400 CSS files, and broken dark mode states causing unreadable text. You are tasked with establishing a modern 3-layer design token architecture (Primitive -> Semantic -> Component) and leading engineering adoption.",
      prompt: "Deliver a design system specification: 1) Outline your token hierarchy structure with concrete examples for color and elevation. 2) Explain how you resolve theme switching without UI flicker. 3) What governance process ensures designers and developers don't revert to hardcoded values?",
      rubric: [
        { criterion: "Design Token Architecture", description: "Clean separation of global primitives (blue-500) to semantic aliases (interactive-accent) to component tokens.", points: 40 },
        { criterion: "Accessibility & Color Science", description: "Utilizes APCA or WCAG perceptual contrast curves to ensure guaranteed contrast ratios across both modes.", points: 30 },
        { criterion: "System Governance & Linting", description: "Implements Stylelint/Figma Tokens Studio sync, PR linting against hardcoded hexes, and component contribution reviews.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Define 3 layers: Primitives (blue-600) -> Semantic (bg-primary, text-muted) -> Component (btn-primary-bg).",
        "Use CSS custom properties injected at root (:root / .dark) to prevent theme swap flicker.",
        "Add automated CI linters that fail builds if raw hex codes (#...) are detected in CSS/Tailwind."
      ]
    }
  },

  // 7. Operations & Supply Chain
  {
    id: "operations-supply-chain",
    careerField: "Operations & Supply Chain",
    category: "Operations & Logistics",
    title: "Supply Chain Resilience, Inventory Optimization & Crisis Logistics",
    iconName: "Truck",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess supply chain risk mitigation, Economic Order Quantity (EOQ), vendor SLA negotiation, and rapid crisis re-routing during geopolitical or port disruptions.",
    keyCompetencies: ["Inventory Modeling & Safety Stock", "Vendor Management & SLA Enforcement", "Crisis Logistics & Business Continuity", "Process Optimization & Lean Six Sigma"],
    situationalQuestions: [
      {
        id: "ops-q1",
        competency: "Crisis Logistics & Business Continuity",
        scenario: "A primary international port handling 65% of your inbound raw materials declares an indefinite strike. Factory production will shut down in 14 days unless alternative feedstock arrives.",
        question: "What is your immediate operational contingency plan?",
        options: [
          {
            id: "ops-1",
            text: "Activate pre-vetted dual-source regional suppliers for critical path SKUs, contract bonded air freight charters for immediate buffer stock, and prioritize high-margin finished product lines.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Proactive dual-sourcing and immediate air bridging prevents catastrophic factory idle costs while maintaining delivery to top-tier customers."
          },
          {
            id: "ops-2",
            text: "Wait 10 days to see if the port union and port management resolve their disagreement before making decisions.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Passive delay guarantees production shutdown and unrecoverable lead-time spikes."
          },
          {
            id: "ops-3",
            text: "Cancel all customer orders across all product lines immediately.",
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: "Extreme reaction that destroys customer trust and triggers breach-of-contract penalties."
          },
          {
            id: "ops-4",
            text: "Instruct warehouse workers to work 24-hour shifts to manufacture raw materials manually.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Physically impossible and violates labor regulations."
          }
        ]
      }
    ],
    caseStudy: {
      id: "ops-cs-1",
      title: "Omnichannel Fulfillment Network Optimization",
      brief: "Redesign a nationwide fulfillment network to achieve 2-day ground delivery for 95% of continental US customers without multiplying carrying costs.",
      context: "Currently operating from a single centralized mega-warehouse in Ohio, average shipping transit is 4.2 days to West Coast customers, and shipping costs are climbing due to Zone 7/8 parcel rates.",
      prompt: "Outline your multi-node distribution strategy: 1) What warehouse distribution footprint (2, 3, or 4 nodes) optimizes freight cost vs inventory carrying cost? 2) How do you allocate SKU velocity (Fast-moving vs Long-tail) across nodes? 3) What WMS/3PL integration milestones are required?",
      rubric: [
        { criterion: "Network Footprint & Center of Gravity Analysis", description: "Proposes realistic node strategy (e.g. Northeast, West Coast, Southeast) balancing lease cost vs freight reduction.", points: 35 },
        { criterion: "Inventory Segmentation (ABC Analysis)", description: "Concentrates high-velocity A-SKUs in regional forward nodes while keeping slow-moving C-SKUs centralized.", points: 35 },
        { criterion: "Carrier Strategy & SLA Governance", description: "Diversifies regional parcel carriers (OnTrac, LaserShip) alongside national carriers to mitigate rate surcharges.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Adopt a 3-node model: PA/NJ, Dallas/TX, Reno/CA reaching 95% of US population in 2 days via Ground.",
        "Store Top 20% SKUs (driving 80% volume) at all 3 nodes; keep slow-movers centralized.",
        "Integrate distributed order management (DOM) to route orders based on lowest landed shipping cost."
      ]
    }
  },

  // 8. Software Architecture & Distributed Systems (Technical non-coding or high-level architecture)
  {
    id: "software-system-architecture",
    careerField: "Software Engineering & Architecture",
    category: "Software & Technology",
    title: "Distributed Systems Architecture, High Availability & Data Resiliency",
    iconName: "Server",
    experienceLevel: "Senior Specialist",
    timeLimitMinutes: 20,
    overview: "Assess distributed consensus, microservices fault-tolerance, database sharding, idempotent event streaming, and zero-downtime deployment topologies.",
    keyCompetencies: ["Distributed Consensus & CAP Theorem", "Event-Driven Resiliency & Idempotency", "Database Partitioning & Sharding", "Observability & Disaster Recovery"],
    situationalQuestions: [
      {
        id: "se-q1",
        competency: "Event-Driven Resiliency & Idempotency",
        scenario: "A payment processing webhook consumer occasionally receives duplicate HTTP POST events from Stripe during network blips, resulting in rare instances of duplicate customer credit balances.",
        question: "What architectural pattern guarantees that duplicate webhook deliveries will never execute multiple balance credits?",
        options: [
          {
            id: "opt-1",
            text: "Implement an idempotent consumer pattern using the unique Stripe Event ID stored in an atomic transactional database record (or Redis distributed lock with TTL), rejecting already-processed IDs before ledger mutations.",
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: "Idempotency keys paired with ACID transactions guarantee exactly-once processing semantics at the application business layer even with at-least-once message delivery."
          },
          {
            id: "opt-2",
            text: "Add a setTimeout of 5 seconds in Javascript before processing the webhook payload.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Delays do not prevent race conditions or duplicate execution."
          },
          {
            id: "opt-3",
            text: "Ask Stripe support to guarantee they will never retry a network timeout.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Network distributed systems inherently require retries; consumers must be idempotent."
          },
          {
            id: "opt-4",
            text: "Delete all logs whenever an error occurs so metrics look clean.",
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: "Horrible practice that prevents incident investigation."
          }
        ]
      }
    ],
    caseStudy: {
      id: "se-cs-1",
      title: "Global Multi-Region Active-Active Database Migration",
      brief: "Design an active-active global data replication architecture for a mission-critical financial ledger operating across US and EU regions.",
      context: "A fintech platform with 10M daily active users requires p99 latency < 50ms in both Europe and North America while strictly complying with GDPR data residency rules and zero data loss (RPO = 0, RTO < 30s).",
      prompt: "Draft the technical architecture: 1) How do you handle write conflicts across regions without global lock contention? 2) How do you partition user data to comply with cross-border privacy regulations? 3) What consensus and replication topology do you deploy?",
      rubric: [
        { criterion: "Conflict Resolution & Consistency Model", description: "Evaluates CRDTs, Spanner/CockroachDB Truetime consensus, or master-per-user localized routing.", points: 35 },
        { criterion: "Data Residency & Partitioning", description: "Geo-partitioning tables by user jurisdiction (EU accounts pinned to EU storage nodes).", points: 35 },
        { criterion: "Failure Domains & Disaster Recovery", description: "Autonomous regional failover mechanics, read replicas, and circuit-breaker patterns.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        "Adopt home-region tenancy: route user writes to their home region while allowing global read caching.",
        "Use distributed databases with geo-partitioned tables (CockroachDB or Google Cloud Spanner).",
        "Implement transactional outbox pattern with Kafka/Debezium for cross-region asynchronous sync."
      ]
    }
  }
];

/**
 * Generate a dynamic Assessment Track for any custom user career or skill
 * (Fallback generator when AI is offline or as local baseline)
 */
export function generateDynamicCareerAssessment(
  careerTitle: string,
  experienceLevel: ExperienceLevel = "Senior Specialist"
): CareerAssessmentTrack {
  const normalizedTitle = careerTitle.trim();
  const slug = normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: `custom-${slug}-${Date.now().toString(36)}`,
    careerField: normalizedTitle,
    category: "Specialized Career",
    title: `${normalizedTitle} Professional Competency & Strategy Assessment`,
    iconName: "Briefcase",
    experienceLevel,
    timeLimitMinutes: 20,
    overview: `Comprehensive, multi-dimensional assessment evaluating high-stakes decision making, real-world domain mastery, and tactical execution required for ${normalizedTitle} practitioners.`,
    keyCompetencies: [
      `${normalizedTitle} Core Methodology & Best Practices`,
      "Strategic Problem Solving & Root-Cause Analysis",
      "Stakeholder Communication & Risk Mitigation",
      "Process Optimization & Quality Governance"
    ],
    situationalQuestions: [
      {
        id: "cust-q1",
        competency: "Strategic Problem Solving & Root-Cause Analysis",
        scenario: `As a ${experienceLevel} in ${normalizedTitle}, you are confronted with an unexpected operational breakdown where client deliverable timelines are threatened due to conflicting priorities between key stakeholders.`,
        question: `What is the most effective initial intervention to stabilize operations and preserve stakeholder trust?`,
        options: [
          {
            id: "opt-1",
            text: `Conduct a rapid impact assessment, assemble accountable leads for transparent trade-off prioritization, and issue an objective communication detailing options, revised milestones, and risk mitigations.`,
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: `Objective situational analysis coupled with transparent stakeholder alignment represents the standard for senior ${normalizedTitle} leadership.`
          },
          {
            id: "opt-2",
            text: `Arbitrarily cut the scope of the project in secret without consulting clients or management.`,
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: `Undermines governance and invites severe breach-of-trust consequences.`
          },
          {
            id: "opt-3",
            text: `Instruct junior staff to work unpaid overnight shifts while denying any timeline issues to stakeholders.`,
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: `Unethical, unsustainable, and leads to severe burnout and errors.`
          },
          {
            id: "opt-4",
            text: `Blame the external suppliers in a public email before verifying where the root breakdown occurred.`,
            isCorrect: false,
            scoreWeight: 0.0,
            rationale: `Unprofessional and destroys inter-team working relationships.`
          }
        ]
      },
      {
        id: "cust-q2",
        competency: `${normalizedTitle} Core Methodology & Best Practices`,
        scenario: `A major initiative under your purview as a ${normalizedTitle} is undergoing audit for quality standards and regulatory compliance. An established process is found to be 20% slower than industry benchmarks but maintains a 99.8% quality accuracy record.`,
        question: `How should you optimize this workflow balance between speed and quality?`,
        options: [
          {
            id: "opt-1",
            text: `Map the value stream to eliminate non-value-added administrative handoffs while preserving automated validation gates that protect the 99.8% quality threshold.`,
            isCorrect: true,
            scoreWeight: 1.0,
            rationale: `Lean optimization focuses on eliminating bureaucratic delay without compromising vital quality controls.`
          },
          {
            id: "opt-2",
            text: `Bypass all verification checkpoints to double speed regardless of error rate.`,
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: `Disastrous for brand reputation, customer satisfaction, and regulatory compliance.`
          },
          {
            id: "opt-3",
            text: `Refuse to make any changes because any speed improvement automatically damages quality.`,
            isCorrect: false,
            scoreWeight: 0.3,
            rationale: `Resists continuous improvement and risks obsolescence against agile competitors.`
          },
          {
            id: "opt-4",
            text: `Outsource the entire process overseas without standard operating procedures.`,
            isCorrect: false,
            scoreWeight: 0.1,
            rationale: `Introduces uncontrolled risks and variable quality.`
          }
        ]
      }
    ],
    caseStudy: {
      id: `cs-${slug}`,
      title: `${normalizedTitle} Strategic Turnaround & Growth Challenge`,
      brief: `Design a high-impact roadmap to resolve a complex challenge and modernize practices within the ${normalizedTitle} discipline.`,
      context: `You have been brought in to lead a critical transformation for a mid-to-large organization experiencing plateaus in efficiency, team alignment, and customer outcomes within their ${normalizedTitle} operations. Budget is constrained by 10%, yet executive leadership expects a 25% improvement in key performance outcomes over the next two quarters.`,
      prompt: `Formulate your strategic blueprint: 1) What diagnostic methods will you deploy in the first 30 days to pinpoint root inefficiencies? 2) Describe your phased execution plan (Days 30-90) including key interventions and stakeholder management. 3) What quantitative and qualitative KPIs will you monitor to prove ROI to leadership?`,
      rubric: [
        { criterion: "Diagnostic Rigor & Root-Cause Discovery", description: `Demonstrates thorough qualitative and quantitative analysis of the ${normalizedTitle} workflow.`, points: 35 },
        { criterion: "Actionable Phased Execution & Resource Allocation", description: "Practical roadmap with clear milestones, change management, and risk mitigations.", points: 35 },
        { criterion: "KPI Framework & Leadership ROI", description: "Clear definition of leading/lagging indicators measuring quality, velocity, and business impact.", points: 30 }
      ],
      sampleGoodAnswerTips: [
        `Anchor recommendations around specific industry frameworks and standards applicable to ${normalizedTitle}.`,
        "Structure the response into clear phases: Listen & Diagnose (0-30d) -> Implement Quick Wins (30-60d) -> Scale & Measure (60-90d).",
        "Define both efficiency metrics (cost per unit, cycle time) and effectiveness metrics (quality, retention, NPS)."
      ]
    }
  };
}

/**
 * Evaluates candidate submission and issues cryptographic skill badge
 */
export function evaluateAssessmentSubmission(
  track: CareerAssessmentTrack,
  submission: AssessmentSubmission
): AssessmentEvaluationResult {
  // 1. Grade Situational Questions
  let totalWeight = 0;
  let earnedWeight = 0;
  const competencyTotals: Record<string, { earned: number; total: number }> = {};

  track.situationalQuestions.forEach((q) => {
    const chosenOptionId = submission.selectedAnswers[q.id];
    const option = q.options.find((o) => o.id === chosenOptionId);
    const weight = option ? option.scoreWeight : 0;

    totalWeight += 1;
    earnedWeight += weight;

    if (!competencyTotals[q.competency]) {
      competencyTotals[q.competency] = { earned: 0, total: 0 };
    }
    competencyTotals[q.competency].total += 1;
    competencyTotals[q.competency].earned += weight;
  });

  const situationalPercentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 80;

  // 2. Grade Case Study (heuristic length + structure validation)
  const caseWords = submission.caseStudyAnswer.trim().split(/\s+/).filter(Boolean).length;
  let caseScore = 40;
  const strengths: string[] = [];
  const growthAreas: string[] = [];

  if (caseWords > 120) caseScore += 25;
  if (caseWords > 250) caseScore += 20;
  if (submission.caseStudyAnswer.toLowerCase().includes("phase") || submission.caseStudyAnswer.toLowerCase().includes("step") || submission.caseStudyAnswer.toLowerCase().includes("plan")) {
    caseScore += 10;
  }
  if (submission.caseStudyAnswer.toLowerCase().includes("metric") || submission.caseStudyAnswer.toLowerCase().includes("kpi") || submission.caseStudyAnswer.toLowerCase().includes("%")) {
    caseScore += 5;
  }
  caseScore = Math.min(100, Math.max(30, caseScore));

  // Determine overall score: 50% Situational, 50% Applied Case Study
  const overallScore = Math.round((situationalPercentage * 0.5) + (caseScore * 0.5));
  const passed = overallScore >= 70;

  // Compile Competency Breakdown
  const competencyBreakdown = Object.entries(competencyTotals).map(([name, stat]) => ({
    name,
    score: Math.round((stat.earned / Math.max(1, stat.total)) * 100)
  }));

  if (competencyBreakdown.length === 0) {
    track.keyCompetencies.forEach((comp) => {
      competencyBreakdown.push({
        name: comp,
        score: Math.min(100, Math.max(65, overallScore + Math.floor(Math.random() * 11) - 5))
      });
    });
  }

  // Derive Strengths & Growth Areas
  if (situationalPercentage >= 80) {
    strengths.push("Exemplary situational judgment in high-pressure scenarios.");
  } else {
    growthAreas.push("Review prioritization frameworks when arbitrating competing operational demands.");
  }

  if (caseScore >= 80) {
    strengths.push("Thorough case-study synthesis with structured execution phases and KPI awareness.");
  } else {
    growthAreas.push("Deepen quantitative KPI definitions and risk mitigation plans in applied case responses.");
  }

  strengths.push(`Strong alignment with ${track.careerField} core standards and ethical mandates.`);

  let performanceTier: MultiCareerBadge["performanceTier"] = "Certified Practitioner";
  if (overallScore >= 92) performanceTier = "Distinguished Fellow";
  else if (overallScore >= 84) performanceTier = "Senior Master";
  else if (overallScore >= 70) performanceTier = "Certified Practitioner";
  else performanceTier = "Foundational Associate";

  let badge: MultiCareerBadge | undefined;
  if (passed) {
    const issuedAt = new Date().toISOString();
    const candidateName = submission.candidateName.trim() || "Verified Professional";

    const { hash, payload } = generateCryptographicBadgeSignature({
      candidateName,
      challengeId: track.id,
      score: overallScore,
      issuedAt
    });

    badge = {
      badgeId: `badge-${track.id}-${Date.now().toString(36)}`,
      candidateName,
      careerField: track.careerField,
      trackTitle: track.title,
      experienceLevel: track.experienceLevel,
      overallScore,
      performanceTier,
      competencies: competencyBreakdown,
      issuedAt,
      signatureAlgorithm: "HMAC-SHA256",
      signatureHash: hash,
      verifiablePayload: payload,
      explorerUrl: getBadgeVerificationUrl(hash)
    };
  }

  return {
    passed,
    overallScore,
    performanceTier,
    situationalScore: situationalPercentage,
    caseStudyScore: caseScore,
    competencyBreakdown,
    feedback: {
      strengths,
      growthAreas,
      caseStudyCritique: caseScore >= 80
        ? "Excellent strategic depth. Your proposal demonstrates comprehensive understanding of stakeholder trade-offs, resource constraints, and measurable business outcomes."
        : "Good foundational approach. Consider incorporating more specific phase-by-phase milestones and numerical KPIs to strengthen executive credibility."
    },
    badge
  };
}
