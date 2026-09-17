/**
 * ResumeForge Cover Letter Formatting & Typography Normalizer
 * Formats unformatted or collapsed plain text into standard executive letter layout
 * with proper paragraph spacing, salutations, body flow, and formal sign-offs.
 */

export interface FormattedCoverLetter {
  salutation: string;
  paragraphs: string[];
  signOff: string;
  signerName: string;
  html: string;
}

export function formatCoverLetterText(
  rawText: string,
  candidateName: string = "Applicant",
  companyName: string = "Hiring Team"
): FormattedCoverLetter {
  if (!rawText || !rawText.trim()) {
    return {
      salutation: `Dear Hiring Team at ${companyName},`,
      paragraphs: [
        `I am writing to express my strong interest in joining ${companyName}. With my experience in executing technical projects and building scalable systems, I am eager to contribute to your team's ongoing success.`,
      ],
      signOff: "Sincerely,",
      signerName: candidateName,
      html: `<p class="mb-4 font-semibold text-gray-900">Dear Hiring Team at ${companyName},</p><p class="mb-4 leading-relaxed">I am writing to express my strong interest in joining ${companyName}. With my experience in executing technical projects and building scalable systems, I am eager to contribute to your team's ongoing success.</p><div class="mt-8 space-y-1"><p class="font-medium text-gray-800">Sincerely,</p><p class="font-bold text-gray-900 text-base mt-2">${candidateName}</p></div>`,
    };
  }

  // Strip existing HTML tags to get raw clean text
  let text = rawText
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .trim();

  // Strip leading accidental duplicated dates like "[Current Date]" or "September 17, 2026"
  text = text.replace(/^(?:\[current date\]|current date|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})[:\s,-]*/i, "");

  // Extract Salutation
  let salutation = `Dear Hiring Team at ${companyName},`;
  const salutationMatch = text.match(/^(dear\s+[^,\n]+[,:])/i);
  if (salutationMatch) {
    salutation = salutationMatch[1].trim();
    text = text.slice(salutationMatch[0].length).trim();
  } else if (text.toLowerCase().startsWith("to the hiring manager")) {
    salutation = "To the Hiring Manager,";
    text = text.replace(/^to the hiring manager[,:]?/i, "").trim();
  }

  // Extract Sign-Off and Signer Name at the end
  let signOff = "Sincerely,";
  let signerName = candidateName;

  const signOffRegex = /(sincerely|best regards|warm regards|warmly|respectfully|yours truly)[,:\s]+([^\n\r]*)$/i;
  const signOffMatch = text.match(signOffRegex);
  if (signOffMatch) {
    signOff = signOffMatch[1].trim() + ",";
    if (signOffMatch[2] && signOffMatch[2].trim()) {
      signerName = signOffMatch[2].trim();
    }
    text = text.slice(0, signOffMatch.index).trim();
  }

  // Split remaining body into paragraphs
  let rawParagraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  // If the text was one big clump without double newlines, split by strategic transitional sentences
  if (rawParagraphs.length <= 1 && text.length > 300) {
    // Look for sentence boundaries that introduce new themes (e.g. "My background as...", "Throughout my career...", "In my previous role...", "I am confident...", "Thank you for...")
    const sentenceSplitRegex = /(?<=[.!?])\s+(?=(?:My background|In my (?:previous|current) role|Throughout my|Furthermore|Additionally|Proficient in|I am (?:confident|particularly|eager)|Thank you for considering))/g;
    const pieces = text.split(sentenceSplitRegex);
    if (pieces.length > 1) {
      rawParagraphs = pieces.map((p) => p.trim()).filter(Boolean);
    }
  }

  // Fallback: if still 1 huge block (>600 chars), chunk by 3-4 sentences
  if (rawParagraphs.length === 1 && rawParagraphs[0].length > 500) {
    const sentences = rawParagraphs[0].match(/[^.!?]+[.!?]+/g) || [rawParagraphs[0]];
    if (sentences.length >= 4) {
      const p1 = sentences.slice(0, Math.ceil(sentences.length / 3)).join(" ").trim();
      const p2 = sentences.slice(Math.ceil(sentences.length / 3), Math.ceil((sentences.length * 2) / 3)).join(" ").trim();
      const p3 = sentences.slice(Math.ceil((sentences.length * 2) / 3)).join(" ").trim();
      rawParagraphs = [p1, p2, p3].filter(Boolean);
    }
  }

  // Build semantic, clean HTML for rendering
  const htmlParagraphs = rawParagraphs
    .map((p) => `<p class="mb-4 leading-relaxed text-gray-800 text-[11pt]">${p}</p>`)
    .join("");

  const html = `
    <p class="mb-4 font-semibold text-gray-900 text-[11.5pt]">${salutation}</p>
    ${htmlParagraphs}
    <div class="mt-8 pt-4 space-y-1">
      <p class="font-medium text-gray-800 text-[11pt]">${signOff}</p>
      <p class="font-bold text-gray-900 text-base mt-2">${signerName}</p>
    </div>
  `.trim();

  return {
    salutation,
    paragraphs: rawParagraphs,
    signOff,
    signerName,
    html,
  };
}
