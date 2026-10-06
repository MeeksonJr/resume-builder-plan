import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { detectSchoolFromEmail, isAcademicDomain } from "@/lib/university/detect";
import { getUniversityInsights } from "@/lib/rapidapi/google-search-master";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.email || "";
    const emailDomain = email.split("@")[1]?.toLowerCase().trim();

    // Check if academic email
    if (!emailDomain || !isAcademicDomain(emailDomain)) {
      return NextResponse.json({ detected: false, reason: "not_academic" });
    }

    // Try our high-accuracy known map & domain resolver first
    const detected = detectSchoolFromEmail(email);
    if (detected) {
      return NextResponse.json({
        detected: true,
        source: "known",
        email,
        domain: emailDomain,
        school: detected,
      });
    }

    // Fallback: check cached campus catalog
    try {
      const { getAllRegisteredCampuses } = await import("@/lib/rapidapi/google-search-master");
      const campuses = await getAllRegisteredCampuses();
      const matched = campuses.find(
        (c: any) =>
          c.domain === emailDomain ||
          (c.emailDomains && c.emailDomains.includes(emailDomain))
      );

      if (matched) {
        return NextResponse.json({
          detected: true,
          source: "cached",
          email,
          domain: emailDomain,
          school: {
            name: matched.name,
            slug: matched.slug,
            domain: matched.domain,
            location: matched.location || "United States",
            emailFormat: matched.emailFormat || `[username]@${matched.domain}`,
            sampleEmail: matched.sampleEmail || email,
            emailDomains: matched.emailDomains || [matched.domain],
          },
        });
      }
    } catch (catalogErr) {
      console.warn("[DETECT_SCHOOL] Catalog lookup fallback:", catalogErr);
    }

    // Fallback: Google Search API insights
    const domainRoot = emailDomain.split(".").slice(0, -1).join(".");
    const guessedName = domainRoot
      .split(".")
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

    let insights: any = null;
    try {
      insights = await getUniversityInsights(guessedName);
    } catch {
      // API fallback fail is non-fatal
    }

    const schoolName = insights?.school_name || guessedName;
    const slug = schoolName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    return NextResponse.json({
      detected: true,
      source: insights ? "api" : "domain_guess",
      email,
      domain: emailDomain,
      school: {
        name: schoolName,
        slug,
        domain: emailDomain,
        location: insights?.location || "United States",
        emailFormat: insights?.student_email_format || `[username]@${emailDomain}`,
        sampleEmail: email,
        emailDomains: insights?.email_domains || [emailDomain],
      },
    });
  } catch (err: any) {
    console.error("[DETECT_SCHOOL_ERROR]", err);
    return NextResponse.json({ error: err.message, detected: false }, { status: 500 });
  }
}
