/**
 * Salary Scraper Module
 * 
 * Fetches real salary data from RapidAPI endpoints (Glassdoor via Job Salary Data API,
 * and Jobs API salary ranges), then aggregates them into a single benchmark.
 * 
 * Free plan limits: 50 requests/month per API — all results are cached in DB.
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GlassdoorSalaryData {
  location: string;
  job_title: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  min_base_salary: number;
  max_base_salary: number;
  median_base_salary: number;
  min_additional_pay: number;
  max_additional_pay: number;
  median_additional_pay: number;
  salary_period: string;
  salary_currency: string;
  salary_count: number;
  salaries_updated_at: string;
  publisher_name: string;
  publisher_link: string;
  confidence: string;
}

export interface JobsAPISalaryData {
  country: string;
  countryCode: string;
  currency: string;
  yearlySalary: { min: number; median: number; max: number; mean: number };
  monthlySalary: { min: number; median: number; max: number; mean: number };
  weeklySalary: { min: number; median: number; max: number; mean: number };
  dailySalary: { min: number; median: number; max: number; mean: number };
  hourlySalary: { min: number; median: number; max: number; mean: number };
  lastUpdatedTimestamp: number;
}

export interface ScrapedSalaryResult {
  low: number;
  median: number;
  high: number;
  currency: string;
  locationMultiplier: number;
  marketDemand: "High" | "Moderate" | "Steady";
  source: string;
  scrapeCount: number;
  rawData: {
    glassdoor?: GlassdoorSalaryData | null;
    jobsApi?: JobsAPISalaryData | null;
    scrapedAt: string;
    apiVersions: string[];
  };
}

// ─── Location Helpers ────────────────────────────────────────────────────────

/**
 * Maps common US state abbreviations and names to a recognizable location string
 * for the Glassdoor API (which expects readable location names).
 */
const US_STATE_MAP: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas",
  ca: "California", co: "Colorado", ct: "Connecticut", de: "Delaware",
  fl: "Florida", ga: "Georgia", hi: "Hawaii", id: "Idaho",
  il: "Illinois", in: "Indiana", ia: "Iowa", ks: "Kansas",
  ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
  ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi",
  mo: "Missouri", mt: "Montana", ne: "Nebraska", nv: "Nevada",
  nh: "New Hampshire", nj: "New Jersey", nm: "New Mexico", ny: "New York",
  nc: "North Carolina", nd: "North Dakota", oh: "Ohio", ok: "Oklahoma",
  or: "Oregon", pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina",
  sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah",
  vt: "Vermont", va: "Virginia", wa: "Washington", wv: "West Virginia",
  wi: "Wisconsin", wy: "Wyoming", dc: "Washington DC",
};

/**
 * Expand a short location string to a full name for better API results.
 * e.g. "va" → "Virginia, US" | "new york" → "New York, US"
 */
function expandLocation(location: string): string {
  const normalized = location.trim().toLowerCase();
  
  // Direct state abbreviation match
  if (US_STATE_MAP[normalized]) {
    return `${US_STATE_MAP[normalized]}, US`;
  }
  
  // Already a full name or city — return as-is with US suffix if it looks domestic
  const isUSState = Object.values(US_STATE_MAP).some(
    s => s.toLowerCase() === normalized
  );
  if (isUSState) {
    return `${location}, US`;
  }
  
  return location;
}

/**
 * Extract a 2-letter country code from a location string.
 * Defaults to "us" for US-centric locations.
 */
function extractCountryCode(location: string): string {
  const normalized = location.trim().toLowerCase();
  
  // If it's a US state abbreviation or name
  if (US_STATE_MAP[normalized] || Object.values(US_STATE_MAP).some(s => s.toLowerCase() === normalized)) {
    return "us";
  }
  
  // Check for explicit country codes at end (e.g. "London, UK")
  const parts = normalized.split(",").map(p => p.trim());
  const lastPart = parts[parts.length - 1];
  if (lastPart.length === 2 && /^[a-z]{2}$/.test(lastPart)) {
    return lastPart;
  }
  
  // Common country name mappings
  const countryMap: Record<string, string> = {
    "united states": "us", "usa": "us", "us": "us",
    "united kingdom": "uk", "england": "uk", "uk": "uk",
    "germany": "de", "france": "fr", "canada": "ca",
    "australia": "au", "india": "in", "japan": "jp",
    "remote": "us", // Default remote to US
  };
  
  for (const [name, code] of Object.entries(countryMap)) {
    if (normalized.includes(name)) return code;
  }
  
  // Default to US
  return "us";
}

// ─── Glassdoor Scraper (Job Salary Data API) ─────────────────────────────────

export async function scrapeGlassdoorSalary(
  role: string,
  location: string
): Promise<GlassdoorSalaryData | null> {
  if (!RAPIDAPI_KEY) {
    console.warn("[SCRAPER:GLASSDOOR] No RAPIDAPI_KEY found in environment variables.");
    return null;
  }

  try {
    const expandedLocation = expandLocation(location);
    const url = new URL("https://job-salary-data.p.rapidapi.com/job-salary");
    url.searchParams.set("job_title", role);
    url.searchParams.set("location", expandedLocation);
    url.searchParams.set("radius", "100");

    console.log(`[SCRAPER:GLASSDOOR] Fetching salary for "${role}" in "${expandedLocation}"...`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "job-salary-data.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.error(`[SCRAPER:GLASSDOOR] HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const json = await response.json();

    if (json.status !== "OK" || !json.data || json.data.length === 0) {
      console.warn("[SCRAPER:GLASSDOOR] No salary data returned.", json);
      return null;
    }

    // Take the first (best) result
    const data = json.data[0] as GlassdoorSalaryData;
    console.log(`[SCRAPER:GLASSDOOR] ✅ Got salary data — median base: $${data.median_base_salary?.toLocaleString()}, total comp median: $${data.median_salary?.toLocaleString()} (${data.salary_count} salaries, confidence: ${data.confidence})`);
    
    return data;
  } catch (error: any) {
    console.error("[SCRAPER:GLASSDOOR] Fetch error:", error.message);
    return null;
  }
}

// ─── Jobs API Scraper (Salary Range) ─────────────────────────────────────────

export async function scrapeJobsAPISalary(
  role: string,
  location: string
): Promise<JobsAPISalaryData | null> {
  if (!RAPIDAPI_KEY) {
    console.warn("[SCRAPER:JOBS_API] No RAPIDAPI_KEY found in environment variables.");
    return null;
  }

  try {
    const countryCode = extractCountryCode(location);
    const url = new URL("https://jobs-api14.p.rapidapi.com/v2/salary/range");
    url.searchParams.set("query", role);
    url.searchParams.set("countryCode", countryCode);

    console.log(`[SCRAPER:JOBS_API] Fetching salary range for "${role}" in country "${countryCode}"...`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "jobs-api14.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.error(`[SCRAPER:JOBS_API] HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const json = await response.json();

    if (json.hasError || !json.data) {
      console.warn("[SCRAPER:JOBS_API] API returned errors:", json.errors);
      return null;
    }

    const data = json.data as JobsAPISalaryData;
    console.log(`[SCRAPER:JOBS_API] ✅ Got salary range — yearly: $${Math.round(data.yearlySalary.min).toLocaleString()} – $${Math.round(data.yearlySalary.max).toLocaleString()}, median: $${Math.round(data.yearlySalary.median).toLocaleString()}`);
    
    return data;
  } catch (error: any) {
    console.error("[SCRAPER:JOBS_API] Fetch error:", error.message);
    return null;
  }
}

// ─── Aggregator ──────────────────────────────────────────────────────────────

/**
 * Calls both APIs in parallel, averages results, and returns structured data
 * with the full raw responses for database storage.
 */
export async function scrapeAndAggregateSalaries(
  role: string,
  location: string
): Promise<ScrapedSalaryResult | null> {
  console.log(`[SCRAPER] Starting salary scrape for "${role}" in "${location}"...`);

  // Call both APIs in parallel — if one fails, the other still works
  const [glassdoorResult, jobsApiResult] = await Promise.allSettled([
    scrapeGlassdoorSalary(role, location),
    scrapeJobsAPISalary(role, location),
  ]);

  const glassdoor = glassdoorResult.status === "fulfilled" ? glassdoorResult.value : null;
  const jobsApi = jobsApiResult.status === "fulfilled" ? jobsApiResult.value : null;

  // If both failed, return null — caller will fall back to AI-only
  if (!glassdoor && !jobsApi) {
    console.warn("[SCRAPER] Both APIs failed or returned no data. Falling back to AI estimation.");
    return null;
  }

  // Collect salary values from each source
  const salaryPoints: { low: number; median: number; high: number }[] = [];
  const sources: string[] = [];

  if (glassdoor) {
    salaryPoints.push({
      low: glassdoor.min_base_salary || glassdoor.min_salary,
      median: glassdoor.median_base_salary || glassdoor.median_salary,
      high: glassdoor.max_base_salary || glassdoor.max_salary,
    });
    sources.push("glassdoor");
  }

  if (jobsApi?.yearlySalary) {
    salaryPoints.push({
      low: jobsApi.yearlySalary.min,
      median: jobsApi.yearlySalary.median,
      high: jobsApi.yearlySalary.max,
    });
    sources.push("jobs_api");
  }

  // Average across available sources
  const avgLow = Math.round(salaryPoints.reduce((s, p) => s + p.low, 0) / salaryPoints.length);
  const avgMedian = Math.round(salaryPoints.reduce((s, p) => s + p.median, 0) / salaryPoints.length);
  const avgHigh = Math.round(salaryPoints.reduce((s, p) => s + p.high, 0) / salaryPoints.length);

  // Determine currency (prefer Glassdoor's since it's location-specific)
  const currency = glassdoor?.salary_currency || jobsApi?.currency || "USD";

  // Compute a rough location multiplier
  // National median for Software Engineer ≈ $120k. If our scraped median differs, compute the ratio.
  const nationalMedianEstimate = 120000;
  const locationMultiplier = parseFloat((avgMedian / nationalMedianEstimate).toFixed(2));

  // Determine market demand based on salary count or general heuristics
  let marketDemand: "High" | "Moderate" | "Steady" = "Moderate";
  if (glassdoor) {
    if (glassdoor.salary_count > 10000) marketDemand = "High";
    else if (glassdoor.salary_count > 3000) marketDemand = "Moderate";
    else marketDemand = "Steady";
  } else if (avgMedian > 130000) {
    marketDemand = "High";
  }

  const source = sources.length > 1 ? "aggregated" : sources[0] || "unknown";

  const result: ScrapedSalaryResult = {
    low: avgLow,
    median: avgMedian,
    high: avgHigh,
    currency,
    locationMultiplier,
    marketDemand,
    source,
    scrapeCount: sources.length,
    rawData: {
      glassdoor: glassdoor || null,
      jobsApi: jobsApi || null,
      scrapedAt: new Date().toISOString(),
      apiVersions: [
        ...(glassdoor ? ["job-salary-data/v1"] : []),
        ...(jobsApi ? ["jobs-api14/v2"] : []),
      ],
    },
  };

  console.log(`[SCRAPER] ✅ Aggregated from ${sources.length} source(s) [${source}]: low=$${avgLow.toLocaleString()}, median=$${avgMedian.toLocaleString()}, high=$${avgHigh.toLocaleString()}, currency=${currency}, multiplier=${locationMultiplier}`);

  return result;
}
