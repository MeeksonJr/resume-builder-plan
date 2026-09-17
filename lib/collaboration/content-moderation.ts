/**
 * ResumeForge Content Moderation & Professional Guidelines Engine
 * Screens user comments, peer reviews, and outreach messages for profanity,
 * hate speech, harassment, derogatory slurs, and inappropriate content.
 */

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  flaggedCategories?: string[];
}

const BLOCKED_PATTERNS: { category: string; regex: RegExp; message: string }[] = [
  {
    category: "Hate Speech & Harassment",
    regex: /\b(hate|kill yourself|kys|trash|garbage person|loser|scam artist|idiot|stupid|worthless)\b/i,
    message: "Harassment or disparaging remarks are not permitted.",
  },
  {
    category: "Profanity & Vulgarity",
    regex: /\b(fuck|shit|bitch|asshole|bastard|dick|pussy|cunt|slut|whore)\b/i,
    message: "Profanity or vulgar language is prohibited on professional reviews.",
  },
  {
    category: "Discriminatory Terms",
    regex: /\b(retard|faggot|nigger|nigga|chink|kike|spic)\b/i,
    message: "Discriminatory or hateful slurs violate community guidelines.",
  },
  {
    category: "Malicious URLs / Spam",
    regex: /\b(free crypto|telegram me|whatsapp me \+\d|cashapp me|buy followers)\b/i,
    message: "Spam and solicitation are not allowed.",
  },
];

/**
 * Screens text input against professional peer review guidelines.
 */
export function screenPeerReviewContent(text: string): ModerationResult {
  if (!text || !text.trim()) {
    return { allowed: true };
  }

  const flagged: string[] = [];
  let primaryReason: string | undefined;

  for (const rule of BLOCKED_PATTERNS) {
    if (rule.regex.test(text)) {
      flagged.push(rule.category);
      if (!primaryReason) {
        primaryReason = rule.message;
      }
    }
  }

  if (flagged.length > 0) {
    return {
      allowed: false,
      reason: primaryReason || "Content violates professional peer review community standards.",
      flaggedCategories: flagged,
    };
  }

  return { allowed: true };
}
