import { NextRequest, NextResponse } from "next/server";
import { getSyndicatedCampusIntel } from "@/lib/university/collegiate-intel-service";
import { resolveUniversityTenant } from "@/lib/tenant/university-portal";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message query" }, { status: 400 });
    }

    const tenant = resolveUniversityTenant(slug);
    const intel = await getSyndicatedCampusIntel(slug, tenant.name, false);

    const q = message.toLowerCase();

    // Contextual intelligent responses grounded in the 3 syndicated APIs
    let responseText = "";
    let suggestedLinks: { label: string; url: string; badge?: string }[] = [];

    if (q.includes("research") || q.includes("paper") || q.includes("faculty") || q.includes("scholar") || q.includes("professor") || q.includes("lab")) {
      const topPapers = intel.researchPublications.slice(0, 3);
      responseText = `Here are active faculty and departmental research initiatives indexed for **${intel.schoolName}**:\n\n` +
        topPapers.map((p, i) =>
          `**${i + 1}. ${p.title}** (${p.year})\n` +
          `- **Field**: ${p.field}\n` +
          `- **Faculty Lead**: ${p.facultyLead || p.authors.join(", ")}\n` +
          `- **Impact**: ${p.citations} citations (${p.journal || "Indexed in Google Scholar"})\n` +
          `- *Overview*: ${p.snippet}\n`
        ).join("\n") +
        `\n💡 *Tip: You can cite these faculty publications in your capstone project or reach out to the lead professor during office hours for undergraduate research opportunities.*`;

      suggestedLinks = topPapers.map((p) => ({
        label: `View Paper: ${p.title.slice(0, 40)}...`,
        url: p.url,
        badge: `${p.citations} citations`,
      }));
    } else if (q.includes("transfer") || q.includes("articulation") || q.includes("odu") || q.includes("uva") || q.includes("tech") || q.includes("gmu") || q.includes("vcu") || q.includes("4-year") || q.includes("credit")) {
      const partners = intel.transferPartners.slice(0, 3);
      responseText = `**${intel.schoolName}** maintains direct Guaranteed Admission Agreements (GAA) and formal articulation pathways with Virginia 4-year research universities:\n\n` +
        partners.map((tp, i) =>
          `**${i + 1}. ${tp.name} (${tp.shortName})**\n` +
          `- **Type & Campus**: ${tp.type} • ${tp.setting}\n` +
          `- **Acceptance Rate / Net Price**: ${tp.acceptanceRate} • ${tp.avgNetPrice}\n` +
          `- **Transfer Policy**: ${tp.articulationNotes}\n`
        ).join("\n") +
        `\n🎓 *Tip: Students completing an Associate of Science (A.S.) or Associate of Arts (A.A.) with a cumulative 2.5–3.4 GPA receive guaranteed junior standing.*`;

      suggestedLinks = partners.map((tp) => ({
        label: `Transfer Portal: ${tp.shortName}`,
        url: tp.website,
        badge: "Guaranteed Agreement",
      }));
    } else if (q.includes("high school") || q.includes("feeder") || q.includes("dual") || q.includes("enrollment") || q.includes("schooldigger") || q.includes("district")) {
      const feeders = intel.feederHighSchools.slice(0, 4);
      responseText = `Regional high schools in the **${intel.collegeProfile.city || "local"} area** participating in dual-enrollment and Early College Scholar programs with **${intel.schoolName}** include:\n\n` +
        feeders.map((f, i) =>
          `**${i + 1}. ${f.schoolName}** (${f.city}, ${f.state})\n` +
          `- **SchoolDigger Rating**: ${"★".repeat(f.rankStars || 4)}${"☆".repeat(5 - (f.rankStars || 4))} (State Rank #${f.rank} of ${f.rankOf})\n` +
          `- **Student Body**: ${f.studentCount?.toLocaleString()} students • ${f.pupilTeacherRatio}:1 ratio\n` +
          `- **Program**: ${f.notes}\n`
        ).join("\n") +
        `\nDual-enrollment credits earned during high school transfer directly toward your Associate degree here!`;

      suggestedLinks = feeders.map((f) => ({
        label: `SchoolDigger Profile: ${f.schoolName}`,
        url: f.url,
        badge: `★ ${f.rankStars} Stars`,
      }));
    } else if (q.includes("mentor") || q.includes("alumni") || q.includes("advisor") || q.includes("book")) {
      responseText = `You can connect directly with verified **${intel.schoolName}** alumni working at employers like Amazon Web Services, Sentara Healthcare, Newport News Shipbuilding, and Dominion Energy.\n\n` +
        `Head over to the **Alumni Mentorship Mesh** tab right here in the portal to schedule a 1-on-1 career navigation session or resume critique!`;
      suggestedLinks = [
        { label: "Book Mentorship Session", url: "#mentorship", badge: "Free for Students" },
        { label: "Submit Resume for Review", url: "#review", badge: "Career Center" },
      ];
    } else {
      responseText = `Welcome to the **${intel.schoolName}** Campus Intelligence Hub!\n\n` +
        `I am your institutional academic and career co-pilot, connected directly to our real-time academic records:\n` +
        `- 🏛️ **Institutional Profile**: ${intel.collegeProfile.schoolTypeByDesignation} ${intel.collegeProfile.schoolTypeByYears}-year institution in a ${intel.collegeProfile.schoolSetting} setting with AP credit acceptance.\n` +
        `- 📚 **Research Hub (Google Scholar)**: ${intel.researchPublications.length} indexed faculty papers across ${intel.synergySummary.activeResearchFields.join(", ")}.\n` +
        `- 🎓 **Transfer Pathways (Colleges & Universities API)**: Direct GAA agreements to ${intel.transferPartners.map((t) => t.shortName).join(", ")}.\n` +
        `- 🏫 **Regional Feeder Pipelines (SchoolDigger API)**: ${intel.feederHighSchools.length} partner high schools in ${intel.collegeProfile.city}.\n\n` +
        `How can I assist your degree plan or career search today?`;
      suggestedLinks = [
        { label: "Explore Research Publications", url: "#research", badge: "Google Scholar" },
        { label: "View Transfer Agreements", url: "#transfer", badge: "Colleges API" },
        { label: "Inspect Feeder High Schools", url: "#feeders", badge: "SchoolDigger" },
      ];
    }

    return NextResponse.json({
      answer: responseText,
      suggestedLinks,
      schoolSlug: slug,
      schoolName: intel.schoolName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CAMPUS_ASSISTANT_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate campus assistant reply" },
      { status: 500 }
    );
  }
}
