export interface Scholarship {
  id: string;
  title: string;
  organization: string;
  logo?: string;
  amount: number;
  formattedAmount: string;
  deadline: string; // YYYY-MM-DD
  daysLeft: number;
  category: "STEM" | "Healthcare" | "Business" | "Arts & Humanities" | "General" | "Leadership" | "First-Gen" | "Underrepresented";
  educationLevel: ("High School Senior" | "Undergraduate" | "Graduate" | "Transfer" | "PhD")[];
  minGpa?: number;
  majors: string[];
  states?: string[]; // Empty means all US states
  requirements: {
    essay: boolean;
    essayPrompt?: string;
    recommendationLetters: number;
    transcriptRequired: boolean;
    resumeRequired: boolean;
    portfolioRequired?: boolean;
    fafsaRequired?: boolean;
  };
  description: string;
  eligibility: string[];
  whyYouMatch: string[];
  potentialBlockers?: string[];
  matchScore: number;
  applicationUrl: string;
  verified: boolean;
  lastVerifiedDate: string;
  renewable: boolean;
  competitionLevel: "Low" | "Medium" | "High";
  awardsAvailable: number;
}

export const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch-1",
    title: "NextGen Tech Innovators Scholarship",
    organization: "National Science & Technology Foundation",
    amount: 15000,
    formattedAmount: "$15,000",
    deadline: "2026-10-15",
    daysLeft: 56,
    category: "STEM",
    educationLevel: ["Undergraduate", "Graduate"],
    minGpa: 3.2,
    majors: ["Computer Science", "Software Engineering", "Data Science", "Cybersecurity", "Electrical Engineering"],
    requirements: {
      essay: true,
      essayPrompt: "Describe an innovative technology solution you developed or plan to develop to solve a community challenge (500 words).",
      recommendationLetters: 1,
      transcriptRequired: true,
      resumeRequired: true,
      portfolioRequired: false,
    },
    description: "Designed for aspiring technologists and software innovators who demonstrate outstanding academic prowess and passion for creating impactful digital solutions.",
    eligibility: [
      "Enrolled full-time in an accredited US university",
      "Pursuing a degree in Computer Science, Software Engineering, or related STEM field",
      "Minimum 3.2 cumulative GPA",
      "US Citizen or Permanent Resident"
    ],
    whyYouMatch: [
      "Your 3.8 GPA exceeds the 3.2 minimum threshold",
      "STEM major aligns directly with foundation priorities",
      "Full-time enrolled status meets eligibility criteria",
      "Technical project experience matches evaluation rubric"
    ],
    potentialBlockers: [
      "Requires 1 academic or professional recommendation letter"
    ],
    matchScore: 98,
    applicationUrl: "https://example.com/apply/nextgen-tech-2026",
    verified: true,
    lastVerifiedDate: "2026-08-10",
    renewable: true,
    competitionLevel: "Medium",
    awardsAvailable: 10,
  },
  {
    id: "sch-2",
    title: "Future Business Leaders Excellence Award",
    organization: "American Enterprise Institute & Commerce Fund",
    amount: 10000,
    formattedAmount: "$10,000",
    deadline: "2026-09-30",
    daysLeft: 41,
    category: "Business",
    educationLevel: ["Undergraduate", "Transfer"],
    minGpa: 3.0,
    majors: ["Business Administration", "Finance", "Marketing", "Economics", "Management"],
    requirements: {
      essay: true,
      essayPrompt: "How will your ethical leadership contribute to sustainable economic growth in the next decade? (400 words)",
      recommendationLetters: 2,
      transcriptRequired: true,
      resumeRequired: true,
    },
    description: "Recognizing visionary undergraduate students who exhibit entrepreneurial drive, ethical decision making, and leadership within their campus or local community.",
    eligibility: [
      "Undergraduate sophomore, junior, or senior standing",
      "Declared major in Business, Finance, Economics, or related fields",
      "Minimum 3.0 cumulative GPA"
    ],
    whyYouMatch: [
      "Strong leadership and extracurricular track record",
      "Academic standing meets prerequisite guidelines",
      "Prior business coursework aligns with award goals"
    ],
    matchScore: 94,
    applicationUrl: "https://example.com/apply/future-business-2026",
    verified: true,
    lastVerifiedDate: "2026-08-12",
    renewable: false,
    competitionLevel: "High",
    awardsAvailable: 15,
  },
  {
    id: "sch-3",
    title: "First-Generation Trailblazer Scholarship",
    organization: "Pinnacle Education Foundation",
    amount: 12500,
    formattedAmount: "$12,500",
    deadline: "2026-11-01",
    daysLeft: 73,
    category: "First-Gen",
    educationLevel: ["High School Senior", "Undergraduate", "Transfer"],
    minGpa: 2.8,
    majors: ["All Majors"],
    requirements: {
      essay: true,
      essayPrompt: "Share your journey as a first-generation college student and how obtaining a degree will impact your family and community (600 words).",
      recommendationLetters: 1,
      transcriptRequired: true,
      resumeRequired: false,
      fafsaRequired: true,
    },
    description: "Empowering first-generation college students with tuition assistance, dedicated executive mentorship, and career placement support throughout their degree.",
    eligibility: [
      "Neither parent or guardian completed a 4-year bachelor's degree",
      "Enrolled or accepted at an accredited US non-profit college",
      "Demonstrated financial need via FAFSA Student Aid Index (SAI)"
    ],
    whyYouMatch: [
      "Matches first-generation background profile",
      "GPA is well above the 2.8 threshold",
      "FAFSA completion verification ready"
    ],
    matchScore: 96,
    applicationUrl: "https://example.com/apply/first-gen-trailblazer",
    verified: true,
    lastVerifiedDate: "2026-08-15",
    renewable: true,
    competitionLevel: "Low",
    awardsAvailable: 25,
  },
  {
    id: "sch-4",
    title: "Healthcare Pioneers & Nursing Grant",
    organization: "Horizon Health Alliance",
    amount: 8000,
    formattedAmount: "$8,000",
    deadline: "2026-09-15",
    daysLeft: 26,
    category: "Healthcare",
    educationLevel: ["Undergraduate", "Graduate"],
    minGpa: 3.3,
    majors: ["Nursing", "Pre-Med", "Public Health", "Biomedical Sciences", "Health Administration"],
    requirements: {
      essay: false,
      recommendationLetters: 1,
      transcriptRequired: true,
      resumeRequired: true,
    },
    description: "Dedicated funding for students dedicated to improving patient outcomes, healthcare accessibility, and community wellness in underserved regions.",
    eligibility: [
      "Enrolled in an accredited nursing, pre-med, or healthcare degree program",
      "Minimum 3.3 GPA in core science courses",
      "Commitment to 1 year of clinical service in designated health professional shortage area"
    ],
    whyYouMatch: [
      "No essay required — fast-track application",
      "Cumulative GPA satisfies science threshold",
      "Approaching deadline with high acceptance rate"
    ],
    matchScore: 91,
    applicationUrl: "https://example.com/apply/horizon-health-2026",
    verified: true,
    lastVerifiedDate: "2026-08-01",
    renewable: true,
    competitionLevel: "Medium",
    awardsAvailable: 20,
  },
  {
    id: "sch-5",
    title: "Women in STEM & Engineering Fellowship",
    organization: "Ada Lovelace Foundation",
    amount: 20000,
    formattedAmount: "$20,000",
    deadline: "2026-10-31",
    daysLeft: 72,
    category: "STEM",
    educationLevel: ["Undergraduate", "Graduate", "PhD"],
    minGpa: 3.4,
    majors: ["Computer Engineering", "Mechanical Engineering", "Civil Engineering", "Mathematics", "AI & Robotics"],
    requirements: {
      essay: true,
      essayPrompt: "How will your research or career goals advance female representation and breakthrough engineering solutions? (500 words)",
      recommendationLetters: 2,
      transcriptRequired: true,
      resumeRequired: true,
      portfolioRequired: true,
    },
    description: "Prestigious annual award providing up to $20,000 in tuition aid, an all-expenses-paid trip to the Women in Tech Summit, and mentorship from top industry engineers.",
    eligibility: [
      "Identify as female or non-binary pursuing an engineering or computing degree",
      "Minimum 3.4 GPA",
      "Demonstrated commitment to mentoring or promoting women in STEM"
    ],
    whyYouMatch: [
      "Engineering concentration directly aligns with foundation mission",
      "Outstanding academic performance meets fellowship criteria",
      "Includes summit access and 1:1 executive mentorship"
    ],
    matchScore: 97,
    applicationUrl: "https://example.com/apply/ada-lovelace-fellowship",
    verified: true,
    lastVerifiedDate: "2026-08-18",
    renewable: true,
    competitionLevel: "High",
    awardsAvailable: 5,
  },
  {
    id: "sch-6",
    title: "Creative Minds Arts & Digital Media Award",
    organization: "Alliance for Creative Arts & Design",
    amount: 6500,
    formattedAmount: "$6,500",
    deadline: "2026-11-15",
    daysLeft: 87,
    category: "Arts & Humanities",
    educationLevel: ["Undergraduate", "Graduate"],
    minGpa: 2.75,
    majors: ["Graphic Design", "Fine Arts", "Digital Media", "Film & Animation", "Communications"],
    requirements: {
      essay: false,
      recommendationLetters: 1,
      transcriptRequired: true,
      resumeRequired: true,
      portfolioRequired: true,
    },
    description: "Supporting visionaries in digital media, visual design, cinematic storytelling, and digital arts with flexible educational funds.",
    eligibility: [
      "Enrolled in visual arts, design, film, animation, or multimedia curriculum",
      "Submission of a portfolio of 3-5 original works"
    ],
    whyYouMatch: [
      "Portfolio-focused evaluation with zero essay requirements",
      "Open to broad digital media and design disciplines"
    ],
    matchScore: 89,
    applicationUrl: "https://example.com/apply/creative-minds-2026",
    verified: true,
    lastVerifiedDate: "2026-08-05",
    renewable: false,
    competitionLevel: "Low",
    awardsAvailable: 12,
  },
  {
    id: "sch-7",
    title: "Civic Leadership & Community Impact Grant",
    organization: "Public Service Leadership Trust",
    amount: 7500,
    formattedAmount: "$7,500",
    deadline: "2026-09-25",
    daysLeft: 36,
    category: "Leadership",
    educationLevel: ["High School Senior", "Undergraduate", "Graduate"],
    minGpa: 3.0,
    majors: ["All Majors"],
    requirements: {
      essay: true,
      essayPrompt: "Detail a volunteer initiative or community project where you mobilized others to create measurable local impact (450 words).",
      recommendationLetters: 1,
      transcriptRequired: true,
      resumeRequired: true,
    },
    description: "Honoring students who have demonstrated sustained volunteerism, public service, and active advocacy in their neighborhoods.",
    eligibility: [
      "At least 50 documented community service hours over the past 12 months",
      "Minimum 3.0 GPA",
      "Open to all majors and career aspirations"
    ],
    whyYouMatch: [
      "Community leadership hours fulfill prerequisites",
      "Flexible major requirements allow full qualification"
    ],
    matchScore: 92,
    applicationUrl: "https://example.com/apply/civic-leadership-2026",
    verified: true,
    lastVerifiedDate: "2026-08-14",
    renewable: false,
    competitionLevel: "Medium",
    awardsAvailable: 18,
  },
  {
    id: "sch-8",
    title: "Quick-Apply No-Essay Academic Booster",
    organization: "Premio Educational Partner Network",
    amount: 2500,
    formattedAmount: "$2,500",
    deadline: "2026-08-31",
    daysLeft: 11,
    category: "General",
    educationLevel: ["High School Senior", "Undergraduate", "Graduate", "Transfer"],
    majors: ["All Majors"],
    requirements: {
      essay: false,
      recommendationLetters: 0,
      transcriptRequired: false,
      resumeRequired: false,
    },
    description: "A streamlined monthly scholarship designed to alleviate textbook and supply costs. No essays, no GPA minimums, instant 60-second submission.",
    eligibility: [
      "Enrolled or planning to enroll in a 2-year or 4-year US college or trade school",
      "Age 16 or older"
    ],
    whyYouMatch: [
      "Instant 1-click submission",
      "No essay, no transcripts, no recommendation letters needed",
      "Approaching deadline in 11 days"
    ],
    matchScore: 99,
    applicationUrl: "https://example.com/apply/no-essay-booster",
    verified: true,
    lastVerifiedDate: "2026-08-20",
    renewable: false,
    competitionLevel: "High",
    awardsAvailable: 30,
  }
];
