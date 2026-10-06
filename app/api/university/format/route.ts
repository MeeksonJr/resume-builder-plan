import { NextRequest, NextResponse } from "next/server";
import { withFallback } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { findVirginiaInstitution } from "@/lib/university/virginia-institutions";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  process.env.RAPID_API_KEY ||
  "";

const RAPIDAPI_HOST = "google-search-master-mega.p.rapidapi.com";

export interface EmailFormatItem {
  pattern: string;
  example: string;
  percentage: string;
}

export interface UniversityFormatResult {
  school_name: string;
  domain: string;
  allowed_domains: string[];
  formats: EmailFormatItem[];
  student_format?: string;
  sample_email?: string;
  found: boolean;
  source: "preset" | "rapidapi_ai" | "fallback";
}

/**
 * Pre-seeded RocketReach verified academic email formats
 */
const EMAIL_FORMAT_PRESETS: Record<string, UniversityFormatResult> = {
  "old-dominion-university": {
    school_name: "Old Dominion University",
    domain: "odu.edu",
    allowed_domains: ["odu.edu", "cs.odu.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@odu.edu", percentage: "84.4%" },
      { pattern: "[first][last]", example: "janedoe@odu.edu", percentage: "3.5%" },
      { pattern: "[first][last_initial]", example: "janed@odu.edu", percentage: "2.9%" },
      { pattern: "[last]", example: "doe@odu.edu", percentage: "2.7%" },
      { pattern: "[last][first_initial]", example: "doej@odu.edu", percentage: "2.4%" },
      { pattern: "[first]", example: "jane@odu.edu", percentage: "1.8%" },
      { pattern: "[first_initial_two][last]", example: "jadoe@odu.edu", percentage: "1.0%" },
      { pattern: "[first_initial]_[last]", example: "j_doe@odu.edu", percentage: "0.8%" },
      { pattern: "[first].[last]", example: "jane.doe@odu.edu", percentage: "0.5%" },
    ],
    student_format: "[username]@odu.edu",
    sample_email: "[username]@odu.edu",
    found: true,
    source: "preset",
  },
  "odu": {
    school_name: "Old Dominion University",
    domain: "odu.edu",
    allowed_domains: ["odu.edu", "cs.odu.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@odu.edu", percentage: "84.4%" },
      { pattern: "[first][last]", example: "janedoe@odu.edu", percentage: "3.5%" },
      { pattern: "[first][last_initial]", example: "janed@odu.edu", percentage: "2.9%" },
      { pattern: "[last]", example: "doe@odu.edu", percentage: "2.7%" },
      { pattern: "[last][first_initial]", example: "doej@odu.edu", percentage: "2.4%" },
      { pattern: "[first]", example: "jane@odu.edu", percentage: "1.8%" },
      { pattern: "[first_initial_two][last]", example: "jadoe@odu.edu", percentage: "1.0%" },
      { pattern: "[first_initial]_[last]", example: "j_doe@odu.edu", percentage: "0.8%" },
      { pattern: "[first].[last]", example: "jane.doe@odu.edu", percentage: "0.5%" },
    ],
    student_format: "[username]@odu.edu",
    sample_email: "[username]@odu.edu",
    found: true,
    source: "preset",
  },
  "tidewater-community-college": {
    school_name: "Tidewater Community College",
    domain: "tcc.edu",
    allowed_domains: ["tcc.edu", "email.vccs.edu", "vccs.edu", "email.tcc.edu", "tidewater-community-college.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@tcc.edu", percentage: "78.2%" },
      { pattern: "[first].[last]", example: "jane.doe@tcc.edu", percentage: "14.5%" },
      { pattern: "[username]@email.vccs.edu", example: "[username]@email.vccs.edu", percentage: "Student Portal" },
    ],
    student_format: "[username]@email.vccs.edu",
    sample_email: "[username]@email.vccs.edu",
    found: true,
    source: "preset",
  },
  "tcc": {
    school_name: "Tidewater Community College",
    domain: "tcc.edu",
    allowed_domains: ["tcc.edu", "email.vccs.edu", "vccs.edu", "email.tcc.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@tcc.edu", percentage: "78.2%" },
      { pattern: "[first].[last]", example: "jane.doe@tcc.edu", percentage: "14.5%" },
      { pattern: "[username]@email.vccs.edu", example: "[username]@email.vccs.edu", percentage: "Student Portal" },
    ],
    student_format: "[username]@email.vccs.edu",
    sample_email: "[username]@email.vccs.edu",
    found: true,
    source: "preset",
  },
  "stanford": {
    school_name: "Stanford University",
    domain: "stanford.edu",
    allowed_domains: ["stanford.edu", "cs.stanford.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@stanford.edu", percentage: "62.4%" },
      { pattern: "[first].[last]", example: "jane.doe@stanford.edu", percentage: "28.1%" },
      { pattern: "[first]", example: "jane@stanford.edu", percentage: "5.3%" },
    ],
    student_format: "[sunetid]@stanford.edu",
    sample_email: "student@stanford.edu",
    found: true,
    source: "preset",
  },
  "mit": {
    school_name: "Massachusetts Institute of Technology",
    domain: "mit.edu",
    allowed_domains: ["mit.edu", "csail.mit.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@mit.edu", percentage: "72.1%" },
      { pattern: "[last]", example: "doe@mit.edu", percentage: "15.4%" },
      { pattern: "[first]", example: "jane@mit.edu", percentage: "8.2%" },
    ],
    student_format: "[kerberos]@mit.edu",
    sample_email: "student@mit.edu",
    found: true,
    source: "preset",
  },
  "harvard": {
    school_name: "Harvard University",
    domain: "harvard.edu",
    allowed_domains: ["harvard.edu", "college.harvard.edu", "fas.harvard.edu"],
    formats: [
      { pattern: "[first]_[last]", example: "jane_doe@harvard.edu", percentage: "64.8%" },
      { pattern: "[first_initial][last]", example: "jdoe@harvard.edu", percentage: "25.2%" },
    ],
    student_format: "[college_id]@college.harvard.edu",
    sample_email: "student@college.harvard.edu",
    found: true,
    source: "preset",
  },
  "berkeley": {
    school_name: "University of California, Berkeley",
    domain: "berkeley.edu",
    allowed_domains: ["berkeley.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@berkeley.edu", percentage: "67.4%" },
      { pattern: "[first].[last]", example: "jane.doe@berkeley.edu", percentage: "21.6%" },
    ],
    student_format: "[calnet]@berkeley.edu",
    sample_email: "student@berkeley.edu",
    found: true,
    source: "preset",
  },
  "virginia-tech": {
    school_name: "Virginia Tech",
    domain: "vt.edu",
    allowed_domains: ["vt.edu", "cs.vt.edu"],
    formats: [
      { pattern: "[first_initial][last]", example: "jdoe@vt.edu", percentage: "81.0%" },
      { pattern: "[first].[last]", example: "jane.doe@vt.edu", percentage: "12.3%" },
    ],
    student_format: "[pid]@vt.edu",
    sample_email: "student@vt.edu",
    found: true,
    source: "preset",
  },
  "uva": {
    school_name: "University of Virginia",
    domain: "virginia.edu",
    allowed_domains: ["virginia.edu"],
    formats: [
      { pattern: "[computing_id]@virginia.edu", example: "mst3k@virginia.edu", percentage: "88.5%" },
      { pattern: "[first].[last]", example: "jane.doe@virginia.edu", percentage: "8.2%" },
    ],
    student_format: "[computing_id]@virginia.edu",
    sample_email: "computing_id@virginia.edu",
    found: true,
    source: "preset",
  },
};

const formatOutputSchema = z.object({
  school_name: z.string(),
  domain: z.string().describe("Primary academic domain, e.g. odu.edu"),
  allowed_domains: z.array(z.string()).describe("List of valid email domain extensions"),
  formats: z.array(
    z.object({
      pattern: z.string().describe("e.g. [first_initial][last]"),
      example: z.string().describe("e.g. jdoe@odu.edu"),
      percentage: z.string().describe("e.g. 84.4%"),
    })
  ),
  student_format: z.string().optional().describe("Student email structure"),
  sample_email: z.string().optional().describe("Example student email"),
  found: z.boolean().describe("Whether a confirmed academic email format was discovered"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schoolName = (body.schoolName || body.name || "").trim();
    return await resolveUniversityFormat(schoolName);
  } catch (err: any) {
    console.error("[UNIVERSITY_FORMAT_ERROR]", err);
    return NextResponse.json({ error: err.message || "Failed to parse request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolName = (searchParams.get("schoolName") || searchParams.get("name") || "").trim();
    return await resolveUniversityFormat(schoolName);
  } catch (err: any) {
    console.error("[UNIVERSITY_FORMAT_ERROR]", err);
    return NextResponse.json({ error: err.message || "Failed to parse request" }, { status: 500 });
  }
}

async function resolveUniversityFormat(schoolName: string) {
  if (!schoolName) {
    return NextResponse.json({ error: "schoolName parameter is required" }, { status: 400 });
  }

  const slug = schoolName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // 1. Check comprehensive Virginia Institutions catalog (All 50 Virginia universities & VCCS colleges)
  const vaMatch = findVirginiaInstitution(schoolName);
  if (vaMatch) {
    return NextResponse.json({
      school_name: vaMatch.name,
      domain: vaMatch.domain,
      allowed_domains: vaMatch.emailDomains,
      formats: vaMatch.formats,
      student_format: vaMatch.emailFormat,
      sample_email: vaMatch.sampleEmail,
      found: true,
      source: "preset",
      category: vaMatch.category,
      canvas_url: vaMatch.canvasUrl,
    });
  }

  // 2. Check exact preset matches
  if (EMAIL_FORMAT_PRESETS[slug]) {
    return NextResponse.json(EMAIL_FORMAT_PRESETS[slug]);
  }

  // 2. Check partial/fuzzy preset matches
  const normalized = schoolName.toLowerCase();
  for (const [key, preset] of Object.entries(EMAIL_FORMAT_PRESETS)) {
    if (
      normalized.includes(preset.school_name.toLowerCase()) ||
      preset.school_name.toLowerCase().includes(normalized) ||
      (normalized.includes("dominion") && key.includes("dominion")) ||
      (normalized.includes("tidewater") && key.includes("tidewater"))
    ) {
      return NextResponse.json(preset);
    }
  }

  // 3. Search RapidAPI Google Search Master for RocketReach email format
  let searchSnippets = "";
  if (RAPIDAPI_KEY) {
    try {
      const query = encodeURIComponent(`"${schoolName}" email format site:rocketreach.co OR "${schoolName}" email format percentage`);
      const url = `https://${RAPIDAPI_HOST}/web-search?query=${query}&limit=6`;

      const res = await fetch(url, {
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
        next: { revalidate: 60 * 60 * 24 * 7 }, // 7-day cache
      });

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data?.data) ? data.data : [];
        searchSnippets = items
          .map((item: any) => `${item.title || ""}: ${item.snippet || item.description || ""}`)
          .join("\n\n");
      }
    } catch (rapidErr) {
      console.warn("[RAPIDAPI_FORMAT_SEARCH] Search fetch failed:", rapidErr);
    }
  }

  // 4. Use AI to parse search results into strict JSON format
  if (searchSnippets && searchSnippets.trim().length > 30) {
    try {
      const aiResult = await withFallback(async (model) => {
        return generateObject({
          model,
          schema: formatOutputSchema,
          prompt: `You are an expert in academic university email structures.
Extract the email formats and percentage distributions for "${schoolName}" from the RocketReach search data below.

School Name: ${schoolName}

Search Results:
${searchSnippets}

Instructions:
1. If the results contain email patterns (e.g. "[first_initial][last]", "[first].[last]") and percentages (e.g. 84.4%), populate "formats" with pattern, example, and percentage.
2. Identify the primary university domain (e.g. .edu) and allowed domains.
3. If this institution clearly does NOT have email patterns in the text, set found: false.
4. Provide realistic example student email and format if mentioned.`,
        });
      });

      if (aiResult.object && aiResult.object.found && aiResult.object.formats.length > 0) {
        return NextResponse.json({
          ...aiResult.object,
          source: "rapidapi_ai",
        });
      }
    } catch (aiErr: any) {
      console.warn("[AI_FORMAT_PARSING] Extraction failed:", aiErr?.message);
    }
  }

  // 5. Fallback: If not found, return found: false with school_name so client shows Canvas token or professional skip option
  return NextResponse.json({
    school_name: schoolName,
    domain: "",
    allowed_domains: [],
    formats: [],
    found: false,
    source: "fallback",
  });
}
