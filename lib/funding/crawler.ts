import { createClient } from "@/lib/supabase/server";
import { FundingOpportunity } from "./types";

export interface SearchFilters {
  query: string;
  majors?: string[];
  educationLevels?: string[];
  keywords?: string[];
}

/**
 * Searches the local global catalog in Supabase.
 * Uses index-backed array intersections and text matches.
 */
export async function searchLocalCatalog(filters: SearchFilters): Promise<any[]> {
  try {
    const supabase = await createClient();
    
    let queryBuilder = supabase
      .from("funding_opportunities")
      .select("*")
      .eq("is_active", true);

    // Overlap filtering for arrays (majors, levels, keywords)
    if (filters.majors && filters.majors.length > 0) {
      queryBuilder = queryBuilder.overlaps("majors", filters.majors);
    }

    if (filters.educationLevels && filters.educationLevels.length > 0) {
      queryBuilder = queryBuilder.overlaps("education_levels", filters.educationLevels);
    }

    if (filters.keywords && filters.keywords.length > 0) {
      queryBuilder = queryBuilder.overlaps("keywords", filters.keywords);
    }

    // Text search if a search query string is provided
    if (filters.query && filters.query.trim()) {
      const text = filters.query.trim().toLowerCase();
      queryBuilder = queryBuilder.or(
        `title.ilike.%${text}%,description.ilike.%${text}%,provider.ilike.%${text}%`
      );
    }

    const { data, error } = await queryBuilder
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("[Crawler] searchLocalCatalog database error:", error);
      return [];
    }

    return data || [];
  } catch (err: any) {
    console.error("[Crawler] searchLocalCatalog error:", err.message || err);
    return [];
  }
}

/**
 * Runs Apify's Google Search Scraper to fetch organic search results.
 * Requires APIFY_TOKEN or APIFY_API_KEY environment variables.
 */
export async function runApifySearch(searchQuery: string): Promise<any[]> {
  const token = process.env.APIFY_TOKEN || process.env.APIFY_API_KEY;
  if (!token) {
    console.log("[Crawler] Apify token not configured, skipping Apify search.");
    return [];
  }

  try {
    console.log(`[Crawler] Starting Apify Google Scraper for: "${searchQuery}"`);
    
    // Start Apify Google Search Scraper run
    const runRes = await fetch("https://api.apify.com/v2/acts/apify~google-search-scraper/runs?token=" + token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queries: searchQuery,
        maxPagesPerQuery: 1,
        resultsPerPage: 10,
        countryCode: "US",
        languageCode: "en"
      })
    });

    if (!runRes.ok) {
      throw new Error(`Failed to run Apify actor: ${await runRes.text()}`);
    }

    const runJson = await runRes.json();
    const runId = runJson.data.id;
    const datasetId = runJson.data.defaultDatasetId;

    console.log(`[Crawler] Apify Run ID: ${runId}, Dataset ID: ${datasetId}. Polling for completion...`);

    // Poll for up to 45 seconds
    let isFinished = false;
    const start = Date.now();
    while (!isFinished && Date.now() - start < 45000) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      const pollRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
      if (pollRes.ok) {
        const pollJson = await pollRes.json();
        const status = pollJson.data.status;
        console.log(`[Crawler] Apify run status: ${status}`);
        if (status === "SUCCEEDED") {
          isFinished = true;
        } else if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
          throw new Error(`Apify run ended with status: ${status}`);
        }
      }
    }

    if (!isFinished) {
      throw new Error("Apify run timed out");
    }

    // Fetch scraped results
    const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    if (!datasetRes.ok) {
      throw new Error(`Failed to fetch dataset items: ${await datasetRes.text()}`);
    }

    const items = await datasetRes.json();
    console.log(`[Crawler] Apify run retrieved ${items.length} pages of results.`);
    return items;
  } catch (err: any) {
    console.error("[Crawler] runApifySearch failed:", err.message || err);
    return [];
  }
}
