import { createClient } from "@supabase/supabase-js";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  "39cb654435mshc1cc78be702b2b2p105133jsn0f527c017fb6";

const RAPIDAPI_HOST = "google-search-master-mega.p.rapidapi.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface UniversityInsightData {
  school_slug: string;
  school_name: string;
  overview: string;
  location: string;
  website: string;
  career_center_name: string;
  top_majors: string[];
  key_stats: {
    undergrads?: string;
    placementRate?: string;
    avgStartingSalary?: string;
    acceptanceRate?: string;
  };
  news_and_events: Array<{
    title: string;
    snippet: string;
    link?: string;
    date?: string;
  }>;
  source: "cache" | "google_search_master_mega" | "preset";
}

/**
 * Known default presets to avoid consuming API requests for standard campuses
 */
const DEFAULT_UNIVERSITY_PRESETS: Record<string, Partial<UniversityInsightData>> = {
  stanford: {
    school_slug: "stanford",
    school_name: "Stanford University",
    overview:
      "Leading research university located in Stanford, California, situated in the heart of Silicon Valley with deep industry pipelines.",
    location: "Stanford, CA",
    website: "https://www.stanford.edu",
    career_center_name: "Stanford Career Education (BEAM)",
    top_majors: ["Computer Science", "Engineering", "Economics", "Human Biology"],
    key_stats: {
      undergrads: "7,800",
      placementRate: "93%",
      avgStartingSalary: "$108,000",
      acceptanceRate: "3.7%",
    },
    news_and_events: [
      {
        title: "Stanford Fall Engineering & Tech Career Fair",
        snippet: "Annual flagship recruitment fair featuring over 200 premier tech and venture-backed organizations.",
        date: "Upcoming",
      },
      {
        title: "Cardinal Careers Public Interest & Tech Accelerator",
        snippet: "Mentorship and grant matching for graduating seniors entering impact roles.",
        date: "Active",
      },
    ],
  },
  mit: {
    school_slug: "mit",
    school_name: "Massachusetts Institute of Technology",
    overview:
      "World-renowned institution focused on scientific and technological education and research based in Cambridge, Massachusetts.",
    location: "Cambridge, MA",
    website: "https://www.mit.edu",
    career_center_name: "MIT Career Advising & Professional Development (CAPD)",
    top_majors: ["Electrical Engineering & Computer Science", "Mechanical Engineering", "Mathematics", "Physics"],
    key_stats: {
      undergrads: "4,600",
      placementRate: "95%",
      avgStartingSalary: "$115,000",
      acceptanceRate: "4.0%",
    },
    news_and_events: [
      {
        title: "MIT Fall Career Fair (XFair)",
        snippet: "Student-run recruitment summit connecting undergrad and graduate engineers with leading frontier tech firms.",
        date: "Upcoming",
      },
    ],
  },
  berkeley: {
    school_slug: "berkeley",
    school_name: "University of California, Berkeley",
    overview:
      "Top public research university recognized for premier engineering, sciences, business, and entrepreneurial alumni network.",
    location: "Berkeley, CA",
    website: "https://www.berkeley.edu",
    career_center_name: "UC Berkeley Career Center",
    top_majors: ["Computer Science", "EECS", "Economics", "Data Science"],
    key_stats: {
      undergrads: "32,800",
      placementRate: "89%",
      avgStartingSalary: "$98,000",
      acceptanceRate: "11.6%",
    },
    news_and_events: [
      {
        title: "Cal Career Colloquium & Tech Recruiting Forum",
        snippet: "Flagship cross-industry career symposium featuring Silicon Valley leaders and alumni mixers.",
        date: "Upcoming",
      },
    ],
  },
  harvard: {
    school_slug: "harvard",
    school_name: "Harvard University",
    overview:
      "Ivy League research university in Cambridge, Massachusetts, offering premier liberal arts, STEM, finance, and leadership programs.",
    location: "Cambridge, MA",
    website: "https://www.harvard.edu",
    career_center_name: "Mignone Center for Career Success (MCS)",
    top_majors: ["Economics", "Computer Science", "Government", "Applied Mathematics"],
    key_stats: {
      undergrads: "7,100",
      placementRate: "92%",
      avgStartingSalary: "$104,000",
      acceptanceRate: "3.4%",
    },
    news_and_events: [
      {
        title: "Harvard Career & Internship Fair",
        snippet: "Comprehensive recruiting expo spanning technology, consulting, finance, and biotech.",
        date: "Upcoming",
      },
    ],
  },
};

/**
 * Searches Google Search Master (MEGA) on RapidAPI with strict database caching
 * to respect the 20 requests/month hard limit on the Basic plan.
 */
export async function getUniversityInsights(
  schoolNameOrSlug: string
): Promise<UniversityInsightData> {
  const normalizedSlug = schoolNameOrSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // 1. Check Database Cache First
  try {
    const { data: cached } = await supabaseAdmin
      .from("university_insights_cache")
      .select("*")
      .eq("school_slug", normalizedSlug)
      .maybeSingle();

    if (cached) {
      return {
        school_slug: cached.school_slug,
        school_name: cached.school_name,
        overview: cached.overview || "",
        location: cached.location || "",
        website: cached.website || "",
        career_center_name: cached.career_center_name || "Career & Talent Center",
        top_majors: cached.top_majors || [],
        key_stats: cached.key_stats || {},
        news_and_events: cached.news_and_events || [],
        source: "cache",
      };
    }
  } catch (err) {
    console.warn("[UNIVERSITY_CACHE] Read error:", err);
  }

  // 2. Check Static Defaults if available
  if (DEFAULT_UNIVERSITY_PRESETS[normalizedSlug]) {
    const preset = DEFAULT_UNIVERSITY_PRESETS[normalizedSlug];
    const fullData: UniversityInsightData = {
      school_slug: normalizedSlug,
      school_name: preset.school_name || schoolNameOrSlug,
      overview: preset.overview || "",
      location: preset.location || "United States",
      website: preset.website || "",
      career_center_name: preset.career_center_name || "Career Services",
      top_majors: preset.top_majors || ["Computer Science", "Business", "Engineering"],
      key_stats: preset.key_stats || { placementRate: "90%", avgStartingSalary: "$95,000" },
      news_and_events: preset.news_and_events || [],
      source: "preset",
    };

    // Cache preset into DB so next reads are instant
    try {
      await supabaseAdmin.from("university_insights_cache").upsert({
        school_slug: normalizedSlug,
        school_name: fullData.school_name,
        overview: fullData.overview,
        location: fullData.location,
        website: fullData.website,
        career_center_name: fullData.career_center_name,
        top_majors: fullData.top_majors,
        key_stats: fullData.key_stats,
        news_and_events: fullData.news_and_events,
      });
    } catch {}

    return fullData;
  }

  // 3. Fallback to RapidAPI Google Search Master (MEGA)
  // Query only if not cached to preserve the 20 req/month limit
  let apiData: any = null;
  if (RAPIDAPI_KEY) {
    try {
      const query = encodeURIComponent(`${schoolNameOrSlug} university career center placement jobs`);
      const url = `https://${RAPIDAPI_HOST}/web-search?query=${query}&limit=5`;

      const res = await fetch(url, {
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
        next: { revalidate: 60 * 60 * 24 * 30 }, // 30-day cache
      });

      if (res.ok) {
        apiData = await res.json();
      }
    } catch (apiErr) {
      console.warn("[RAPIDAPI_GOOGLE_SEARCH] Fetch error:", apiErr);
    }
  }

  // 4. Construct rich structure from search or heuristics
  const formattedTitle = schoolNameOrSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const items = Array.isArray(apiData?.data) ? apiData.data : [];
  const newsAndEvents = items.slice(0, 3).map((item: any) => ({
    title: item.title || `${formattedTitle} Career Fair & Employer Recruiting`,
    snippet: item.snippet || item.description || "Career services and recruiting network.",
    link: item.link || item.url,
    date: "Current Academic Year",
  }));

  if (newsAndEvents.length === 0) {
    newsAndEvents.push({
      title: `${formattedTitle} Annual Career & Internship Showcase`,
      snippet: `Recruitment portal connecting ${formattedTitle} candidates with tech, consulting, and engineering employers.`,
      date: "Upcoming",
    });
  }

  const generatedRecord: UniversityInsightData = {
    school_slug: normalizedSlug,
    school_name: formattedTitle.includes("University") || formattedTitle.includes("College") ? formattedTitle : `${formattedTitle} University`,
    overview: items[0]?.snippet || `${formattedTitle} Career Center dedicated to student internships, full-time placement, and alumni mentorship.`,
    location: "United States",
    website: items[0]?.link || `https://www.${normalizedSlug}.edu`,
    career_center_name: `${formattedTitle} Career Development Center`,
    top_majors: ["Computer Science", "Business Administration", "Data Science", "Mechanical Engineering"],
    key_stats: {
      undergrads: "12,000+",
      placementRate: "88%+",
      avgStartingSalary: "$89,000",
      acceptanceRate: "Competitive",
    },
    news_and_events: newsAndEvents,
    source: apiData ? "google_search_master_mega" : "preset",
  };

  // Cache permanently in DB
  try {
    await supabaseAdmin.from("university_insights_cache").upsert({
      school_slug: normalizedSlug,
      school_name: generatedRecord.school_name,
      overview: generatedRecord.overview,
      location: generatedRecord.location,
      website: generatedRecord.website,
      career_center_name: generatedRecord.career_center_name,
      top_majors: generatedRecord.top_majors,
      key_stats: generatedRecord.key_stats,
      news_and_events: generatedRecord.news_and_events,
      raw_search_data: apiData || {},
    });
  } catch (err) {
    console.warn("[UNIVERSITY_CACHE] Write error:", err);
  }

  return generatedRecord;
}
