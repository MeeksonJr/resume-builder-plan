// Standalone script: scripts/seed_rapidapi.js
// Reads the fetched RapidAPI Open Scholarships results and seeds them to Supabase
// Usage: node scripts/seed_rapidapi.js

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

// Load env variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("ENV.NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "present" : "missing");
console.log("ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `present (len: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})` : "missing");
console.log("ENV.SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? `present (len: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})` : "missing");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Resolved URL:", supabaseUrl);
console.log("Resolved Key (len):", supabaseKey ? supabaseKey.length : "null");

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env files.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedRapidAPIOpportunities() {
  console.log("[RapidAPI Seeder] Starting database seed...");

  const rawFilePath = "/home/meeksonjr/.gemini/antigravity-ide/brain/6a13dc47-c7f3-40a9-b2ab-0924a4f5866c/.system_generated/steps/564/output.txt";
  
  if (!fs.existsSync(rawFilePath)) {
    console.error(`Could not locate raw output file at: ${rawFilePath}`);
    process.exit(1);
  }

  try {
    const rawContent = fs.readFileSync(rawFilePath, "utf8");
    const parsedData = JSON.parse(rawContent);

    if (!parsedData.results || !Array.isArray(parsedData.results)) {
      throw new Error("Invalid schema inside the raw file output; no results array found.");
    }

    const rawListings = parsedData.results;
    console.log(`[RapidAPI Seeder] Read ${rawListings.length} items from raw data.`);

    const seededOpportunities = [];

    for (const item of rawListings) {
      const id = `ra-${item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      
      // Determine deadline date
      let deadlineDate = null;
      if (item.deadline && item.deadline.date) {
        deadlineDate = item.deadline.date;
      } else {
        // Default to a future date (e.g. 90 days out) or null
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
      console.log(`[RapidAPI Seeder] Upserting ${seededOpportunities.length} opportunities into Supabase...`);
      const { error } = await supabase
        .from("funding_opportunities")
        .upsert(seededOpportunities, { onConflict: "id" });

      if (error) {
        console.error("[RapidAPI Seeder] Supabase upsert error:", error.message);
        process.exit(1);
      } else {
        console.log("[RapidAPI Seeder] Database seeded successfully!");
        process.exit(0);
      }
    } else {
      console.log("[RapidAPI Seeder] No opportunities found to seed.");
      process.exit(0);
    }
  } catch (err) {
    console.error("[RapidAPI Seeder] Seed run failed:", err.message || err);
    process.exit(1);
  }
}

seedRapidAPIOpportunities();
