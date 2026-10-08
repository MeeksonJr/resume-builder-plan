/**
 * AI Alumni Cover Letter Generator
 * Generates tailored cover letters highlighting shared university alma mater and campus coursework.
 */

export interface AlumniCoverLetterInput {
  candidateName: string;
  candidateUniversity: string;
  candidateMajor: string;
  targetCompany: string;
  targetRole: string;
  targetHiringManager?: string;
  alumniContactName?: string;
  keyProjects: string[];
}

export function generateAlumniCoverLetter(input: AlumniCoverLetterInput): string {
  const {
    candidateName,
    candidateUniversity,
    candidateMajor,
    targetCompany,
    targetRole,
    targetHiringManager = "Hiring Team",
    alumniContactName,
    keyProjects,
  } = input;

  const alumniReference = alumniContactName
    ? `Following an insightful conversation with ${alumniContactName}, a fellow ${candidateUniversity} alumnus who spoke highly of ${targetCompany}'s engineering culture, I was inspired to apply for the ${targetRole} opening.`
    : `As a graduating senior in ${candidateMajor} at ${candidateUniversity}, I have long admired ${targetCompany}'s pioneering work in scalable systems, and I am thrilled to apply for the ${targetRole} position.`;

  const projectHighlight = keyProjects.length > 0
    ? `During my capstone project at ${candidateUniversity}, I spearheaded the development of ${keyProjects[0]}, architecting resilient pipelines and optimizing real-time user latency.`
    : `Throughout my rigorous coursework at ${candidateUniversity}, I built end-to-end production-grade software applications emphasizing strict test-driven development and modern architectural hygiene.`;

  return `Dear ${targetHiringManager},

${alumniReference}

${projectHighlight} My technical foundation in systems programming, modern TypeScript frameworks, and distributed cloud services directly mirrors the core responsibilities outlined for the ${targetRole} role.

What draws me specifically to ${targetCompany} is your team's dedication to high-impact technical excellence. As someone trained in ${candidateUniversity}'s engineering and research labs, I bring a demonstrated habit of ownership, rigorous analytical problem-solving, and a fast feedback loop.

I welcome the opportunity to discuss how my hands-on technical experience and collegiate background can drive immediate velocity for ${targetCompany}'s upcoming initiatives. Thank you for your consideration.

Sincerely,

${candidateName}
${candidateUniversity} &bull; ${candidateMajor}`;
}
