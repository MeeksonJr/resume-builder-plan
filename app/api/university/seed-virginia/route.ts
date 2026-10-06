import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VIRGINIA_INSTITUTIONS } from "@/lib/university/virginia-institutions";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function seedVirginiaInstitutionsToDatabase(): Promise<{
  success: boolean;
  total: number;
  seededCount: number;
  errors: string[];
}> {
  const today = new Date().toISOString().slice(0, 10);
  let seededCount = 0;
  const errors: string[] = [];

  for (const inst of VIRGINIA_INSTITUTIONS) {
    try {
      const record = {
        school_slug: inst.slug,
        school_name: inst.name,
        overview: `${inst.name} (${inst.shortName}) is a ${
          inst.category === "vccs_community_college"
            ? "Virginia Community College System (VCCS) institution"
            : inst.category === "public_university"
            ? "public 4-year institution"
            : "private university"
        } located in ${inst.location}. Known for strong career outcomes in ${inst.topMajors.slice(0, 3).join(", ")}.`,
        location: inst.location,
        website: inst.website,
        career_center_name: `${inst.shortName} Career & Talent Development Center`,
        top_majors: inst.topMajors,
        key_stats: {
          undergrads: inst.undergrads,
          placementRate: inst.placementRate,
          avgStartingSalary: inst.avgStartingSalary,
          student_email_format: inst.emailFormat,
          sample_student_email: inst.sampleEmail,
          email_domains: inst.emailDomains,
          canvas_url: inst.canvasUrl,
          category: inst.category,
          short_name: inst.shortName,
          region: inst.region,
          state: "VA",
          transfer_partners: inst.transferPartners || [],
        },
        news_and_events: [
          {
            title: `${inst.shortName} Career & Industry Expo`,
            snippet: `Recruitment summit for ${inst.name} scholars, featuring regional tech, healthcare, and engineering leaders.`,
            date: "Active Academic Term",
          },
        ],
        departments: inst.topMajors.slice(0, 4).map((major) => ({
          name: `Department of ${major}`,
          slug: major.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          desc: `Undergraduate curricula and career pathways in ${major}.`,
        })),
        clubs: [
          {
            name: `${inst.shortName} Computing & Career Society`,
            category: "Technology",
            description: "Technical interview prep, resume workshops, and employer networking.",
          },
        ],
        professors: [],
        key_links: [
          { title: "Canvas LMS Portal", url: inst.canvasUrl, category: "LMS" },
          { title: "Official Website", url: inst.website, category: "Portal" },
        ],
        career_fairs: [
          {
            title: `${inst.shortName} Annual STEM & Business Recruiting Fair`,
            date: "Current Academic Year",
            location: `${inst.name} Campus Center`,
            description: `Connect directly with hiring managers across the Commonwealth of Virginia.`,
          },
        ],
        daily_routine_date: today,
        last_refreshed_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("university_insights_cache")
        .upsert(record, { onConflict: "school_slug" });

      if (error) {
        errors.push(`${inst.slug}: ${error.message}`);
      } else {
        seededCount++;
      }
    } catch (err: any) {
      errors.push(`${inst.slug}: ${err.message}`);
    }
  }

  return {
    success: errors.length === 0,
    total: VIRGINIA_INSTITUTIONS.length,
    seededCount,
    errors,
  };
}

export async function GET() {
  const result = await seedVirginiaInstitutionsToDatabase();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await seedVirginiaInstitutionsToDatabase();
  return NextResponse.json(result);
}
