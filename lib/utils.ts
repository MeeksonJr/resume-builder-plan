import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Helper to convert hex to HSL for dynamic theming
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse r, g, b
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Convert to HSL
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Return HSL string matching Tailwind's variable format (Channels Only)
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

/**
 * Cleans and parses university Canvas LMS course strings into human-readable code, title, and term.
 * e.g. "202420_SPRING_CS252_23245 INTRO TO UNIX FOR PROGRAMMERS"
 *   -> { shortCode: "CS 252", cleanTitle: "Intro to UNIX for Programmers", term: "Spring 2024" }
 */
export function formatCanvasCourseDisplay(course: { name?: string | null; course_code?: string | null }): {
  shortCode: string;
  cleanTitle: string;
  term?: string;
} {
  const rawName = (course?.name || "").trim();
  const rawCode = (course?.course_code || "").trim();
  const fullText = `${rawCode} ${rawName}`.trim();

  if (!fullText) {
    return { shortCode: "Course", cleanTitle: "Untitled Course" };
  }

  // 1. Extract term if available (e.g. 202420_SPRING -> Spring 2024)
  let term: string | undefined;
  const termMatch = fullText.match(/(?:^|[^A-Za-z0-9])(20\d{2})\d{0,2}[-_]?(SPRING|FALL|SUMMER|WINTER)(?![A-Za-z0-9])/i) ||
                    fullText.match(/(?:^|[^A-Za-z0-9])(SPRING|FALL|SUMMER|WINTER)[-_]?(20\d{2})(?![A-Za-z0-9])/i);
  if (termMatch) {
    const isFirstSeason = /^(SPRING|FALL|SUMMER|WINTER)$/i.test(termMatch[1]);
    const season = isFirstSeason ? termMatch[1] : termMatch[2];
    const year = isFirstSeason ? termMatch[2] : termMatch[1];
    term = `${season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()} ${year.slice(0, 4)}`;
  }

  // 2. Extract standard department + course number (e.g. CS252, CS 252, MATH 101, BIO_110)
  let shortCode = "";
  const codeMatch = fullText.match(/(?:^|[^A-Za-z0-9])(?!SPRING|FALL|SUMMER|WINTER)([A-Za-z]{2,5})[-_\s]?([0-9]{3,4}[A-Za-z]?)(?![A-Za-z0-9])/i);
  if (codeMatch) {
    shortCode = `${codeMatch[1].toUpperCase()} ${codeMatch[2].toUpperCase()}`;
  }

  // 3. Extract clean human title
  let cleanTitle = rawName;

  // Remove exact rawCode if it prefixes rawName
  if (rawCode && cleanTitle.toLowerCase().startsWith(rawCode.toLowerCase())) {
    cleanTitle = cleanTitle.slice(rawCode.length).trim();
  }

  // Remove long SIS term/CRN prefixes like "202420_SPRING_CS252_23245" or "2024_SP_CS101_01"
  cleanTitle = cleanTitle.replace(/^[0-9]{4,6}[A-Za-z0-9_]*[\s:\-_]+/i, "").trim();

  // Remove leading course code if it duplicates (e.g. "CS252: " or "CS 252 - ")
  cleanTitle = cleanTitle.replace(/^[A-Za-z]{2,5}[-_\s]?[0-9]{3,4}[A-Za-z]?[\s:\-_]+/i, "").trim();

  // Remove any remaining leading punctuation
  cleanTitle = cleanTitle.replace(/^[\s:\-_]+/, "").trim();

  // If title was somehow emptied, fallback to rawName
  if (!cleanTitle) {
    cleanTitle = rawName;
  }

  // Convert SHOUTING ALL-CAPS to readable Title Case (e.g. "INTRO TO UNIX FOR PROGRAMMERS" -> "Intro to UNIX for Programmers")
  if (cleanTitle === cleanTitle.toUpperCase() && cleanTitle.length > 3) {
    const minorWords = new Set(["to", "for", "and", "in", "on", "of", "a", "an", "the", "with", "at", "by"]);
    cleanTitle = cleanTitle
      .toLowerCase()
      .split(/\s+/)
      .map((word, idx) => {
        if (["unix", "ai", "sql", "html", "css", "api", "qa", "ml", "aws", "os"].includes(word)) {
          return word.toUpperCase();
        }
        if (word === "c++") return "C++";
        if (idx > 0 && minorWords.has(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  // Fallback for shortCode if regex didn't match
  if (!shortCode) {
    shortCode = rawCode && rawCode.length <= 10 ? rawCode : "Course";
  }

  return { shortCode, cleanTitle, term };
}
