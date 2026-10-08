/**
 * Inbound Application Status & Email Parser
 * Parses notification emails from ATS systems (Greenhouse, Lever, Workday, SmartRecruiters).
 */

export interface ParsedEmailStatus {
  atsSystem: "Greenhouse" | "Lever" | "Workday" | "SmartRecruiters" | "Generic";
  companyName: string;
  detectedStatus: "Interview Scheduled" | "Online Assessment (OA)" | "Application Received" | "Rejected" | "Unknown";
  confidenceScore: number;
  actionRequiredDate?: string;
  snippet: string;
}

export function parseApplicationEmail(
  subject: string,
  bodyText: string
): ParsedEmailStatus {
  const combined = `${subject} ${bodyText}`.toLowerCase();

  let ats: ParsedEmailStatus["atsSystem"] = "Generic";
  if (combined.includes("greenhouse-mail") || combined.includes("greenhouse.io")) ats = "Greenhouse";
  else if (combined.includes("lever.co")) ats = "Lever";
  else if (combined.includes("myworkdayjobs") || combined.includes("workday")) ats = "Workday";
  else if (combined.includes("smartrecruiters")) ats = "SmartRecruiters";

  let status: ParsedEmailStatus["detectedStatus"] = "Application Received";
  let confidence = 85;

  if (
    combined.includes("invitation to interview") ||
    combined.includes("schedule your interview") ||
    combined.includes("phone screen") ||
    combined.includes("speak with our team")
  ) {
    status = "Interview Scheduled";
    confidence = 96;
  } else if (
    combined.includes("coding assessment") ||
    combined.includes("hackerrank") ||
    combined.includes("codesignal") ||
    combined.includes("online assessment")
  ) {
    status = "Online Assessment (OA)";
    confidence = 94;
  } else if (
    combined.includes("not moving forward") ||
    combined.includes("pursuing other candidates") ||
    combined.includes("unfortunately") ||
    combined.includes("at this time, we have decided")
  ) {
    status = "Rejected";
    confidence = 95;
  }

  // Extract company name heuristic
  const companyMatch = subject.match(/(?:at|with|from)\s+([A-Za-z0-9\s&]+?)(?:\s+for|\s+-|\s+!|\s*$)/i);
  const company = companyMatch ? companyMatch[1].trim() : "Target Company";

  return {
    atsSystem: ats,
    companyName: company,
    detectedStatus: status,
    confidenceScore: confidence,
    snippet: bodyText.slice(0, 160).trim() + "...",
  };
}
