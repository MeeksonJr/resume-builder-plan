export interface ChecklistItem {
  id: string;
  category: "contact" | "summary" | "experience" | "skills" | "education";
  title: string;
  description: string;
  points: number;
  passed: boolean;
  targetTab: "personal" | "experience" | "education" | "projects" | "skills" | "certifications" | "languages";
  tip?: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ResumeStrengthReport {
  overallScore: number; // 0 - 100
  tier: "exceptional" | "strong" | "good" | "needs_work";
  tierLabel: string;
  tierColor: string;
  tierBg: string;
  categoryScores: {
    contact: CategoryScore;
    summary: CategoryScore;
    experience: CategoryScore;
    skills: CategoryScore;
    education: CategoryScore;
  };
  checklist: ChecklistItem[];
  missingCount: number;
  completedCount: number;
}

const ACTION_VERBS = [
  "accelerated", "achieved", "administered", "analyzed", "architected",
  "automated", "built", "championed", "collaborated", "constructed",
  "created", "delivered", "deployed", "designed", "developed",
  "directed", "drove", "engineered", "established", "executed",
  "expanded", "facilitated", "founded", "generated", "guided",
  "implemented", "improved", "increased", "initiated", "innovated",
  "instituted", "integrated", "launched", "lead", "led", "managed",
  "mentored", "negotiated", "optimized", "orchestrated", "organized",
  "oversaw", "pioneered", "planned", "produced", "programmed",
  "reduced", "refactored", "resolved", "revamped", "scaled",
  "spearheaded", "standardized", "streamlined", "supervised", "transformed"
];

const METRIC_REGEX = /(\b\d+(?:[\.,]\d+)?%|\$\d+(?:[\.,]\d+)?[kKmMbB]?|\b\d+[kKmMbB]\b|\b\d+\+\b|\b(?:saved|increased|reduced|grew|cut|scaled by)\s+\d+|\b\d+\s+(?:users|clients|customers|downloads|stars|commits|teams|dollars|revenue|hours|seconds|percent))/i;

export function calculateResumeStrength(data: {
  profile?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    website_url?: string | null;
    summary?: string | null;
  } | null;
  workExperiences?: Array<{
    company?: string | null;
    position?: string | null;
    description?: string | null;
    highlights?: string[] | null;
  }> | null;
  education?: Array<{
    institution?: string | null;
    degree?: string | null;
    field_of_study?: string | null;
    highlights?: string[] | null;
  }> | null;
  skills?: Array<{
    name?: string | null;
    proficiency_level?: number | null;
  }> | null;
  projects?: Array<{
    name?: string | null;
    description?: string | null;
    technologies?: string[] | null;
  }> | null;
  certifications?: Array<{
    name?: string | null;
    issuer?: string | null;
  }> | null;
}): ResumeStrengthReport {
  const profile = data.profile || {};
  const experiences = data.workExperiences || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  const checklist: ChecklistItem[] = [];

  // --- 1. Contact & Profile (20 pts max) ---
  const hasName = Boolean(profile.full_name && profile.full_name.trim().length > 1);
  checklist.push({
    id: "contact-name",
    category: "contact",
    title: "Full Name",
    description: "Provide your first and last name prominently at the top",
    points: 4,
    passed: hasName,
    targetTab: "personal",
    tip: "Include professional credentials if applicable (e.g., PMP, Ph.D.).",
  });

  const hasEmail = Boolean(profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()));
  checklist.push({
    id: "contact-email",
    category: "contact",
    title: "Professional Email Address",
    description: "Provide a valid, professional email for recruiter correspondence",
    points: 4,
    passed: hasEmail,
    targetTab: "personal",
    tip: "Use a clean email format like firstname.lastname@gmail.com.",
  });

  const hasPhone = Boolean(profile.phone && profile.phone.trim().length >= 7);
  checklist.push({
    id: "contact-phone",
    category: "contact",
    title: "Phone Number",
    description: "Add a reachable direct phone number",
    points: 4,
    passed: hasPhone,
    targetTab: "personal",
  });

  const hasLocation = Boolean(profile.location && profile.location.trim().length >= 2);
  checklist.push({
    id: "contact-location",
    category: "contact",
    title: "Location / Timezone",
    description: "Specify city and state/country for geographical filtering",
    points: 4,
    passed: hasLocation,
    targetTab: "personal",
    tip: "e.g. 'San Francisco, CA' or 'Remote (US)'.",
  });

  const hasLink = Boolean(
    (profile.linkedin_url && profile.linkedin_url.trim().length > 3) ||
    (profile.github_url && profile.github_url.trim().length > 3) ||
    (profile.website_url && profile.website_url.trim().length > 3)
  );
  checklist.push({
    id: "contact-link",
    category: "contact",
    title: "Professional Links",
    description: "Include a LinkedIn, GitHub, or portfolio website URL",
    points: 4,
    passed: hasLink,
    targetTab: "personal",
    tip: "Candidates with complete LinkedIn profiles receive 71% more interview callbacks.",
  });

  const contactScore = checklist
    .filter((item) => item.category === "contact" && item.passed)
    .reduce((acc, curr) => acc + curr.points, 0);

  // --- 2. Professional Summary (15 pts max) ---
  const cleanSummary = (profile.summary || "").replace(/<[^>]*>?/gm, "").trim();
  const hasSummary = cleanSummary.length > 20;
  checklist.push({
    id: "summary-present",
    category: "summary",
    title: "Executive Summary",
    description: "Introduce your value proposition in a tailored professional summary",
    points: 5,
    passed: hasSummary,
    targetTab: "personal",
  });

  const summaryLengthGood = cleanSummary.length >= 100;
  checklist.push({
    id: "summary-length",
    category: "summary",
    title: "Comprehensive Summary Depth",
    description: "Summary should be at least 2–3 sentences (100+ characters)",
    points: 5,
    passed: summaryLengthGood,
    targetTab: "personal",
    tip: "Highlight years of experience, core tech stack, and primary career achievements.",
  });

  const lowerSummary = cleanSummary.toLowerCase();
  const summaryHasImpact = ACTION_VERBS.some((verb) => lowerSummary.includes(verb)) ||
    lowerSummary.includes("experience") || lowerSummary.includes("specialist") ||
    lowerSummary.includes("engineer") || lowerSummary.includes("developer") || lowerSummary.includes("proven");
  checklist.push({
    id: "summary-impact",
    category: "summary",
    title: "Summary Action Keywords",
    description: "Include targeted role terminology and career action keywords",
    points: 5,
    passed: Boolean(hasSummary && summaryHasImpact),
    targetTab: "personal",
  });

  const summaryScore = checklist
    .filter((item) => item.category === "summary" && item.passed)
    .reduce((acc, curr) => acc + curr.points, 0);

  // --- 3. Work Experience & Metrics (30 pts max) ---
  const validExperiences = experiences.filter((e) => Boolean(e.company?.trim() || e.position?.trim()));
  const hasMinExperience = validExperiences.length >= 1;
  checklist.push({
    id: "exp-present",
    category: "experience",
    title: "Work Experience Entry",
    description: "Add at least one professional position with title and company",
    points: 8,
    passed: hasMinExperience,
    targetTab: "experience",
  });

  const hasMultipleExp = validExperiences.length >= 2 || (hasMinExperience && cleanSummary.length > 150);
  checklist.push({
    id: "exp-depth",
    category: "experience",
    title: "Demonstrated Career Progression",
    description: "Include at least two professional positions or comprehensive role history",
    points: 7,
    passed: Boolean(hasMultipleExp),
    targetTab: "experience",
  });

  // Check descriptions
  const allExpText = validExperiences.map((e) => {
    const desc = (e.description || "").replace(/<[^>]*>?/gm, " ");
    const highlights = (e.highlights || []).join(" ");
    return `${desc} ${highlights}`;
  }).join(" ");

  const hasDetailedExp = allExpText.trim().length >= 120;
  checklist.push({
    id: "exp-details",
    category: "experience",
    title: "Detailed Role Responsibilities",
    description: "Ensure experience entries have descriptive achievement bullets",
    points: 5,
    passed: hasDetailedExp,
    targetTab: "experience",
  });

  const hasMetrics = METRIC_REGEX.test(allExpText);
  checklist.push({
    id: "exp-metrics",
    category: "experience",
    title: "Quantifiable Impact & Metrics",
    description: "Use numbers, percentages, and metrics to prove business results ($50k, 25%, 10x)",
    points: 5,
    passed: hasMetrics,
    targetTab: "experience",
    tip: "Recruiters favor measurable outcomes: 'Improved page load speed by 42%' vs 'Optimized website'.",
  });

  const lowerExpText = allExpText.toLowerCase();
  const verbCount = ACTION_VERBS.filter((verb) => lowerExpText.includes(verb)).length;
  const hasStrongVerbs = verbCount >= 2;
  checklist.push({
    id: "exp-verbs",
    category: "experience",
    title: "Dynamic Action Verbs",
    description: "Start achievement statements with punchy action verbs (e.g., Spearheaded, Automated, Delivered)",
    points: 5,
    passed: hasStrongVerbs,
    targetTab: "experience",
  });

  const experienceScore = checklist
    .filter((item) => item.category === "experience" && item.passed)
    .reduce((acc, curr) => acc + curr.points, 0);

  // --- 4. Skills (20 pts max) ---
  const validSkills = skills.filter((s) => Boolean(s.name && s.name.trim().length > 0));
  const hasThreeSkills = validSkills.length >= 3;
  checklist.push({
    id: "skills-min",
    category: "skills",
    title: "Core Skills Baseline",
    description: "List at least 3 core technical or domain competencies",
    points: 8,
    passed: hasThreeSkills,
    targetTab: "skills",
  });

  const hasSixSkills = validSkills.length >= 6;
  checklist.push({
    id: "skills-six",
    category: "skills",
    title: "Diverse Skill Portfolio",
    description: "List at least 6 relevant skills to maximize ATS keyword matches",
    points: 7,
    passed: hasSixSkills,
    targetTab: "skills",
    tip: "A mix of hard tools, frameworks, and domain expertise ranks highest in ATS scanners.",
  });

  const hasTenSkills = validSkills.length >= 8;
  checklist.push({
    id: "skills-ten",
    category: "skills",
    title: "Comprehensive Skill Matrix",
    description: "Include 8+ skills covering tools, languages, and methodologies",
    points: 5,
    passed: hasTenSkills,
    targetTab: "skills",
  });

  const skillsScore = checklist
    .filter((item) => item.category === "skills" && item.passed)
    .reduce((acc, curr) => acc + curr.points, 0);

  // --- 5. Education & Credentials (15 pts max) ---
  const validEducation = education.filter((e) => Boolean(e.institution?.trim() || e.degree?.trim()));
  const hasEducation = validEducation.length >= 1;
  checklist.push({
    id: "edu-present",
    category: "education",
    title: "Educational Background",
    description: "Add your highest degree, university, bootcamp, or school",
    points: 8,
    passed: hasEducation,
    targetTab: "education",
  });

  const hasDegree = validEducation.some((e) => Boolean(e.degree?.trim()));
  checklist.push({
    id: "edu-degree",
    category: "education",
    title: "Specific Degree or Program",
    description: "State your field of study or specific credential name",
    points: 4,
    passed: hasDegree,
    targetTab: "education",
  });

  const hasCredsOrProjects = certifications.length > 0 || projects.length > 0;
  checklist.push({
    id: "edu-creds",
    category: "education",
    title: "Projects or Certifications",
    description: "Bolster your credentials with verified licenses, certifications, or portfolio projects",
    points: 3,
    passed: hasCredsOrProjects,
    targetTab: certifications.length === 0 && projects.length === 0 ? "projects" : "certifications",
  });

  const educationScore = checklist
    .filter((item) => item.category === "education" && item.passed)
    .reduce((acc, curr) => acc + curr.points, 0);

  // Calculate totals
  const overallScore = Math.min(100, Math.max(0, contactScore + summaryScore + experienceScore + skillsScore + educationScore));

  let tier: ResumeStrengthReport["tier"] = "needs_work";
  let tierLabel = "Needs Attention";
  let tierColor = "text-rose-600";
  let tierBg = "bg-rose-50 border-rose-200";

  if (overallScore >= 90) {
    tier = "exceptional";
    tierLabel = "Top Tier (ATS Ready)";
    tierColor = "text-[#0d8274]";
    tierBg = "bg-[#0d8274]/10 border-[#0d8274]/30";
  } else if (overallScore >= 75) {
    tier = "strong";
    tierLabel = "Strong Candidate";
    tierColor = "text-[#102b2b]";
    tierBg = "bg-[#d8f36b]/30 border-[#102b2b]/20";
  } else if (overallScore >= 50) {
    tier = "good";
    tierLabel = "Good Foundation";
    tierColor = "text-amber-700";
    tierBg = "bg-amber-50 border-amber-200";
  }

  const missingCount = checklist.filter((i) => !i.passed).length;
  const completedCount = checklist.filter((i) => i.passed).length;

  return {
    overallScore,
    tier,
    tierLabel,
    tierColor,
    tierBg,
    categoryScores: {
      contact: {
        name: "Contact & Profile",
        score: contactScore,
        maxScore: 20,
        percentage: Math.round((contactScore / 20) * 100),
      },
      summary: {
        name: "Professional Summary",
        score: summaryScore,
        maxScore: 15,
        percentage: Math.round((summaryScore / 15) * 100),
      },
      experience: {
        name: "Work Experience & Impact",
        score: experienceScore,
        maxScore: 30,
        percentage: Math.round((experienceScore / 30) * 100),
      },
      skills: {
        name: "Skills & Core Competencies",
        score: skillsScore,
        maxScore: 20,
        percentage: Math.round((skillsScore / 20) * 100),
      },
      education: {
        name: "Education & Credentials",
        score: educationScore,
        maxScore: 15,
        percentage: Math.round((educationScore / 15) * 100),
      },
    },
    checklist,
    missingCount,
    completedCount,
  };
}
