export interface Grant {
  id: string;
  title: string;
  agency: string;
  grantType: "Federal" | "State" | "Institutional" | "Research" | "Emergency" | "Need-Based";
  maxAmount: number;
  formattedAmount: string;
  deadline: string;
  deadlineType: "Annual FAFSA Cycle" | "Rolling / Year-Round" | "Fixed Date" | "Emergency Open";
  repaymentRequired: boolean; // false for grants
  fafsaRequired: boolean;
  minSaiThreshold?: number; // Student Aid Index threshold
  eligibility: string[];
  description: string;
  stepsToClaim: string[];
  disbursementSchedule: string;
  averageAward: string;
  stateCode?: string;
  verified: boolean;
}

export const SAMPLE_GRANTS: Grant[] = [
  {
    id: "grant-1",
    title: "Federal Pell Grant (2026-2027 Award Year)",
    agency: "U.S. Department of Education",
    grantType: "Federal",
    maxAmount: 7395,
    formattedAmount: "Up to $7,395 / yr",
    deadline: "2026-06-30",
    deadlineType: "Annual FAFSA Cycle",
    repaymentRequired: false,
    fafsaRequired: true,
    eligibility: [
      "Undergraduate students with exceptional financial need",
      "Must have not earned a bachelor's or professional degree yet",
      "Enrolled in an eligible degree or certificate program",
      "US citizen or eligible non-citizen"
    ],
    description: "The cornerstone of federal student financial aid. Does not need to be repaid. Award amounts depend on Student Aid Index (SAI), cost of attendance, and enrollment status (full-time or part-time).",
    stepsToClaim: [
      "Complete the 2026-2027 Free Application for Federal Student Aid (FAFSA)",
      "List your college code(s) on your FAFSA submission",
      "Review your FAFSA Submission Summary (FSS) and Student Aid Index (SAI)",
      "Accept the Pell Grant in your university's official Financial Aid Portal"
    ],
    disbursementSchedule: "Disbursed directly to your student account per semester/term",
    averageAward: "$4,850 per academic year",
    verified: true,
  },
  {
    id: "grant-2",
    title: "Federal Supplemental Educational Opportunity Grant (FSEOG)",
    agency: "Campus-Based Federal Aid Program",
    grantType: "Federal",
    maxAmount: 4000,
    formattedAmount: "$100 - $4,000 / yr",
    deadline: "2026-10-01",
    deadlineType: "Annual FAFSA Cycle",
    repaymentRequired: false,
    fafsaRequired: true,
    eligibility: [
      "Undergraduate students with the lowest Student Aid Index (SAI)",
      "Priority given to Federal Pell Grant recipients",
      "Allocated directly through participating college financial aid offices"
    ],
    description: "Campus-based federal grant administered directly by college financial aid offices. Funds are limited per campus, so early FAFSA submission is critical.",
    stepsToClaim: [
      "Submit your FAFSA as early as possible after opening date",
      "Check your campus financial aid award letter in spring",
      "Confirm enrollment verification with financial aid officer"
    ],
    disbursementSchedule: "Credited automatically to tuition bill before term start",
    averageAward: "$2,200 / yr",
    verified: true,
  },
  {
    id: "grant-3",
    title: "Teacher Education Assistance for College and Higher Education (TEACH) Grant",
    agency: "Federal Student Aid",
    grantType: "Federal",
    maxAmount: 4000,
    formattedAmount: "Up to $4,000 / yr",
    deadline: "2026-12-31",
    deadlineType: "Rolling / Year-Round",
    repaymentRequired: false,
    fafsaRequired: true,
    eligibility: [
      "Enrolled in a TEACH-Grant-eligible educational program",
      "Maintain a cumulative GPA of at least 3.25",
      "Agree to serve as a full-time teacher in a high-need field at an elementary/secondary school serving low-income families for at least four academic years within eight years of completing course of study"
    ],
    description: "Federal grant providing up to $4,000 annually to students completing coursework to begin a career in teaching high-demand subjects in low-income schools.",
    stepsToClaim: [
      "Complete FAFSA and TEACH Grant Initial and Subsequent Counseling",
      "Sign an Agreement to Serve or Repay (Agreement) annually",
      "Verify course eligibility with university department of education"
    ],
    disbursementSchedule: "Split across fall and spring terms",
    averageAward: "$3,770 / yr",
    verified: true,
  },
  {
    id: "grant-4",
    title: "State Opportunity & Access Grant Program",
    agency: "State Higher Education Coordinating Board",
    grantType: "State",
    maxAmount: 6500,
    formattedAmount: "Up to $6,500 / yr",
    deadline: "2026-09-15",
    deadlineType: "Fixed Date",
    repaymentRequired: false,
    fafsaRequired: true,
    eligibility: [
      "State resident attending an in-state public or eligible private institution",
      "Demonstrated financial need based on state income thresholds",
      "Minimum 2.5 cumulative high school or college GPA"
    ],
    description: "State-funded grants designed to reduce out-of-pocket tuition costs for resident undergraduate students attending universities within their home state.",
    stepsToClaim: [
      "File FAFSA or State Alternative Aid Application before state priority deadline",
      "Submit state residency verification if prompted",
      "Maintain Satisfactory Academic Progress (SAP)"
    ],
    disbursementSchedule: "Applied directly to term tuition fees",
    averageAward: "$4,200 / yr",
    verified: true,
  },
  {
    id: "grant-5",
    title: "Undergraduate Research Fellowship & Innovation Grant",
    agency: "National Science & Research Consortium",
    grantType: "Research",
    maxAmount: 5000,
    formattedAmount: "$2,500 - $5,000",
    deadline: "2026-11-30",
    deadlineType: "Fixed Date",
    repaymentRequired: false,
    fafsaRequired: false,
    eligibility: [
      "Undergraduate student conducting independent or faculty-mentored research",
      "STEM, Social Sciences, or Humanities disciplines",
      "Submission of a 2-page project abstract and faculty endorsement"
    ],
    description: "Provides direct stipends and materials budgets for undergraduate researchers presenting original findings or building breakthrough technical prototypes.",
    stepsToClaim: [
      "Draft a 2-page research proposal detailing methodology and budget",
      "Obtain a faculty advisor sponsorship confirmation letter",
      "Submit online proposal before the fall review cycle"
    ],
    disbursementSchedule: "50% upfront for research supplies, 50% upon mid-project summary",
    averageAward: "$3,500 project grant",
    verified: true,
  },
  {
    id: "grant-6",
    title: "Student Emergency Relief & Basic Needs Assistance",
    agency: "Campus Dean of Students & Student Support Office",
    grantType: "Emergency",
    maxAmount: 1500,
    formattedAmount: "$500 - $1,500",
    deadline: "2026-12-31",
    deadlineType: "Emergency Open",
    repaymentRequired: false,
    fafsaRequired: false,
    eligibility: [
      "Currently enrolled students facing unforeseen financial hardship",
      "Covers emergency housing, medical expenses, food insecurity, or sudden technology loss",
      "No minimum GPA restriction"
    ],
    description: "Immediate zero-repayment emergency micro-grants distributed within 48 to 72 hours to prevent students from having to drop out due to urgent unexpected life emergencies.",
    stepsToClaim: [
      "Submit 1-page emergency assistance request form",
      "Upload supporting documentation (bill, receipt, or brief explanation)",
      "Direct deposit transferred within 2-3 business days upon review"
    ],
    disbursementSchedule: "Immediate direct deposit within 48-72 hours",
    averageAward: "$1,000 emergency relief",
    verified: true,
  }
];
