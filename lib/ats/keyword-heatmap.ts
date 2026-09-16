/**
 * ResumeForge ATS Keyword Density & Match Heatmap Engine (Phase 48)
 * Evaluates resume content against ATS parser standards, keyword saturation,
 * and target job descriptions to maximize recruiter searchability.
 */

export interface KeywordMatch {
  term: string;
  category: "hard_skill" | "framework_tool" | "soft_skill" | "cloud_devops" | "other";
  occurrences: number;
  densityPercent: number; // e.g. 1.8%
  status: "matched" | "missing" | "overused";
  suggestedAction?: string;
}

export interface KeywordDensityReport {
  totalWordCount: number;
  uniqueWordCount: number;
  matchScore: number; // 0 - 100
  matchedCount: number;
  missingCount: number;
  overusedCount: number;
  stuffingRisk: boolean;
  keywords: KeywordMatch[];
  densitySummary: {
    topMatched: KeywordMatch[];
    highPriorityMissing: KeywordMatch[];
    overusedTerms: KeywordMatch[];
  };
}

const COMMON_TECH_DICTIONARY: Record<string, "hard_skill" | "framework_tool" | "soft_skill" | "cloud_devops"> = {
  // Hard skills & languages
  python: "hard_skill",
  javascript: "hard_skill",
  typescript: "hard_skill",
  java: "hard_skill",
  csharp: "hard_skill",
  golang: "hard_skill",
  go: "hard_skill",
  rust: "hard_skill",
  sql: "hard_skill",
  html: "hard_skill",
  css: "hard_skill",
  graphql: "hard_skill",
  nosql: "hard_skill",

  // Frameworks & tools
  react: "framework_tool",
  nextjs: "framework_tool",
  vue: "framework_tool",
  angular: "framework_tool",
  node: "framework_tool",
  express: "framework_tool",
  fastapi: "framework_tool",
  django: "framework_tool",
  spring: "framework_tool",
  tailwind: "framework_tool",
  redux: "framework_tool",
  zustand: "framework_tool",
  prisma: "framework_tool",
  git: "framework_tool",

  // Cloud & DevOps
  aws: "cloud_devops",
  azure: "cloud_devops",
  gcp: "cloud_devops",
  docker: "cloud_devops",
  kubernetes: "cloud_devops",
  ci_cd: "cloud_devops",
  terraform: "cloud_devops",
  linux: "cloud_devops",
  microservices: "cloud_devops",

  // Soft skills
  leadership: "soft_skill",
  communication: "soft_skill",
  mentorship: "soft_skill",
  collaboration: "soft_skill",
  agile: "soft_skill",
  scrum: "soft_skill",
  architecture: "soft_skill",
  problem_solving: "soft_skill",
};

/**
 * Normalizes a text string into clean searchable tokens.
 */
export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#_ -]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2);
}

/**
 * Extracts all searchable text from a standardized Resume object or state.
 */
export function extractResumeText(resumeData: any): string {
  if (!resumeData) return "";
  const parts: string[] = [];

  if (typeof resumeData === "string") return resumeData;

  // Profile / Contact
  const profile = resumeData.profile || resumeData.contact || {};
  if (profile.full_name || profile.name) parts.push(profile.full_name || profile.name);
  if (profile.title || profile.headline) parts.push(profile.title || profile.headline);
  if (profile.summary || profile.bio) parts.push(profile.summary || profile.bio);

  // Work Experiences
  const experiences = resumeData.workExperiences || resumeData.work_experience || resumeData.experience || [];
  if (Array.isArray(experiences)) {
    for (const exp of experiences) {
      if (exp.company) parts.push(exp.company);
      if (exp.role || exp.position || exp.title) parts.push(exp.role || exp.position || exp.title);
      if (exp.description) parts.push(exp.description);
      if (Array.isArray(exp.highlights)) parts.push(exp.highlights.join(" "));
      if (Array.isArray(exp.bullets)) parts.push(exp.bullets.join(" "));
    }
  }

  // Skills
  const skills = resumeData.skills || [];
  if (Array.isArray(skills)) {
    for (const sk of skills) {
      if (typeof sk === "string") parts.push(sk);
      else if (sk.name) parts.push(sk.name);
      else if (Array.isArray(sk.skills)) parts.push(sk.skills.join(" "));
    }
  }

  // Education
  const education = resumeData.education || [];
  if (Array.isArray(education)) {
    for (const edu of education) {
      if (edu.institution || edu.school) parts.push(edu.institution || edu.school);
      if (edu.degree) parts.push(edu.degree);
      if (edu.field_of_study || edu.field) parts.push(edu.field_of_study || edu.field);
    }
  }

  // Projects
  const projects = resumeData.projects || [];
  if (Array.isArray(projects)) {
    for (const proj of projects) {
      if (proj.name || proj.title) parts.push(proj.name || proj.title);
      if (proj.description) parts.push(proj.description);
      if (Array.isArray(proj.tech_stack)) parts.push(proj.tech_stack.join(" "));
      if (Array.isArray(proj.technologies)) parts.push(proj.technologies.join(" "));
    }
  }

  // Certifications
  const certs = resumeData.certifications || [];
  if (Array.isArray(certs)) {
    for (const cert of certs) {
      if (cert.name || cert.title) parts.push(cert.name || cert.title);
      if (cert.issuer) parts.push(cert.issuer);
    }
  }

  return parts.join(" ");
}

/**
 * Calculates keyword frequency, density, and comparative ATS match against target requirements.
 */
export function analyzeKeywordDensity(
  resumeInput: any,
  jobDescription: string = ""
): KeywordDensityReport {
  const resumeText = extractResumeText(resumeInput);
  const resumeTokens = tokenizeText(resumeText);
  const totalWordCount = resumeTokens.length;

  const frequencyMap = new Map<string, number>();
  for (const token of resumeTokens) {
    frequencyMap.set(token, (frequencyMap.get(token) || 0) + 1);
  }

  const uniqueWordCount = frequencyMap.size;

  // Determine target keywords from job description + common tech dictionary
  const targetKeywords = new Set<string>();

  if (jobDescription.trim()) {
    const jdTokens = tokenizeText(jobDescription);
    const jdFreq = new Map<string, number>();
    for (const token of jdTokens) {
      // Filter out stopwords
      if (token.length > 2 && !["and", "the", "for", "with", "that", "this", "from", "have", "will", "our", "you", "your", "are"].includes(token)) {
        jdFreq.set(token, (jdFreq.get(token) || 0) + 1);
      }
    }
    // Take top distinct terms from JD
    for (const [token, count] of jdFreq.entries()) {
      if (count >= 2 || COMMON_TECH_DICTIONARY[token]) {
        targetKeywords.add(token);
      }
    }
  }

  // If no target keywords extracted or no JD provided, use standard dictionary
  if (targetKeywords.size === 0) {
    for (const key of Object.keys(COMMON_TECH_DICTIONARY)) {
      targetKeywords.add(key);
    }
  }

  const matches: KeywordMatch[] = [];
  let matchedCount = 0;
  let missingCount = 0;
  let overusedCount = 0;

  for (const term of targetKeywords) {
    const occurrences = frequencyMap.get(term) || 0;
    const densityPercent = totalWordCount > 0 ? Number(((occurrences / totalWordCount) * 100).toFixed(2)) : 0;
    const category = COMMON_TECH_DICTIONARY[term] || "other";

    let status: "matched" | "missing" | "overused" = "matched";
    let suggestedAction: string | undefined;

    if (occurrences === 0) {
      status = "missing";
      missingCount++;
      suggestedAction = `Add '${term}' to Skills or Experience bullets to boost ATS relevance.`;
    } else if (densityPercent > 4.0 && occurrences >= 6) {
      status = "overused";
      overusedCount++;
      suggestedAction = `High density (${densityPercent}%). Reduce usage slightly to prevent keyword stuffing flags.`;
    } else {
      status = "matched";
      matchedCount++;
    }

    matches.push({
      term,
      category,
      occurrences,
      densityPercent,
      status,
      suggestedAction,
    });
  }

  // Sort: Overused and Missing first, then Matched descending by count
  matches.sort((a, b) => {
    if (a.status === "overused" && b.status !== "overused") return -1;
    if (b.status === "overused" && a.status !== "overused") return 1;
    if (a.status === "missing" && b.status === "matched") return 1;
    if (b.status === "missing" && a.status === "matched") return -1;
    return b.occurrences - a.occurrences;
  });

  const totalEvaluated = matchedCount + missingCount + overusedCount;
  const matchScore = totalEvaluated > 0
    ? Math.min(100, Math.round(((matchedCount + (overusedCount * 0.5)) / totalEvaluated) * 100))
    : 0;

  const stuffingRisk = overusedCount > 0;

  return {
    totalWordCount,
    uniqueWordCount,
    matchScore,
    matchedCount,
    missingCount,
    overusedCount,
    stuffingRisk,
    keywords: matches,
    densitySummary: {
      topMatched: matches.filter((m) => m.status === "matched").slice(0, 10),
      highPriorityMissing: matches.filter((m) => m.status === "missing").slice(0, 10),
      overusedTerms: matches.filter((m) => m.status === "overused"),
    },
  };
}
