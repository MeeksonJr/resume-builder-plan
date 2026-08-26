import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized: Please log in first on the dashboard.", { status: 401 });
    }

    const rawFilePath = "/home/meeksonjr/.gemini/antigravity-ide/brain/6a13dc47-c7f3-40a9-b2ab-0924a4f5866c/.system_generated/steps/564/output.txt";

    if (!fs.existsSync(rawFilePath)) {
      return NextResponse.json({ error: `Could not locate raw output file at: ${rawFilePath}` }, { status: 404 });
    }

    const rawContent = fs.readFileSync(rawFilePath, "utf8");
    const parsedData = JSON.parse(rawContent);

    if (!parsedData.results || !Array.isArray(parsedData.results)) {
      return NextResponse.json({ error: "Invalid data format inside file." }, { status: 400 });
    }

    const rawListings = parsedData.results;
    console.log(`[API Seeder] Read ${rawListings.length} items from raw data.`);

    const seededOpportunities: any[] = [];

    for (const item of rawListings) {
      const id = `ra-${item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      
      // Determine deadline date
      let deadlineDate = null;
      if (item.deadline && item.deadline.date) {
        deadlineDate = item.deadline.date;
      } else {
        // Default to a future date (e.g. 90 days out)
        deadlineDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      // Map values
      seededOpportunities.push({
        id,
        kind: item.type === "grant" ? "grant" : (item.type === "fellowship" ? "fellowship" : "scholarship"),
        title: item.name,
        provider: item.sponsor || "RapidAPI Open Scholarships",
        description: item.summary || `A high-quality educational aid program sponsored by ${item.sponsor || "our providers"}.`,
        amount_min: item.award?.amount_min || null,
        amount_max: item.award?.amount_max || null,
        currency: item.award?.currency || "USD",
        deadline: deadlineDate,
        application_url: item.links?.apply_url || item.links?.info_url || "https://github.com/Grudged/open-scholarships",
        source_url: item.links?.info_url || "https://github.com/Grudged/open-scholarships",
        source_name: item.provenance?.source_name || "Open Scholarships API",
        education_levels: item.eligibility?.education_level || ["Undergraduate"],
        majors: item.eligibility?.fields_of_study && item.eligibility.fields_of_study.length > 0 
          ? item.eligibility.fields_of_study 
          : ["All Majors"],
        careers: ["All Careers"],
        keywords: item.eligibility?.tags || ["academic-aid"],
        year: 2026,
        eligibility: item.eligibility?.other || ["Check provider website for full eligibility details."],
        requirements: {
          essay: true,
          recommendation_letters: 1,
          transcript_required: true,
          resume_required: false,
          portfolio_required: false,
          fafsa_required: false
        },
        raw_data: { original_id: item.id },
        is_active: true,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (seededOpportunities.length > 0) {
      console.log(`[API Seeder] Upserting ${seededOpportunities.length} opportunities into Supabase...`);
      const { data, error } = await supabase
        .from("funding_opportunities")
        .upsert(seededOpportunities, { onConflict: "id" });

      if (error) {
        console.error("[API Seeder] Supabase upsert error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: seededOpportunities.length });
  } catch (err: any) {
    console.error("[API Seeder] Error during seed:", err.message || err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
