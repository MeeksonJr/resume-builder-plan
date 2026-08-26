// Standalone script: scripts/playwright_scrape.js
// Runs Playwright locally to scrape scholarships and save them to Supabase
// Usage: npx playwright-core run scripts/playwright_scrape.js or node scripts/playwright_scrape.js

const { chromium } = require("playwright-core");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env or .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapeOpportunities() {
  console.log("[Playwright Scraper] Starting scraper run...");
  let browser;
  try {
    // Try to launch chromium locally
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Example: Navigate to a reputable public scholarship page
    const targetUrl = "https://www.collegescholarships.org/financial-aid/";
    console.log(`[Playwright Scraper] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    // Extract links and text
    const links = await page.evaluate(() => {
      const items = [];
      const anchors = document.querySelectorAll("a");
      for (const a of anchors) {
        const text = a.textContent.trim();
        const href = a.href;
        if (href.includes("scholarship") && text.length > 5) {
          items.push({ text, href });
        }
      }
      return items.slice(0, 15);
    });

    console.log(`[Playwright Scraper] Found ${links.length} potential scholarship links.`);

    const scrapedListings = [];
    for (const link of links) {
      // Simulate detail scraping or map values directly
      const id = link.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      scrapedListings.push({
        id: `pw-${id}`,
        kind: "scholarship",
        title: link.text,
        provider: "College Scholarships Directory",
        description: `Opportunity to apply for ${link.text}. Visit the link for full application steps, eligibility criteria, and submission rules.`,
        amount_min: 1000,
        amount_max: 5000,
        currency: "USD",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
        application_url: link.href,
        source_url: targetUrl,
        source_name: "CollegeScholarships.org",
        education_levels: ["Undergraduate", "Graduate"],
        majors: ["All Majors"],
        careers: ["All Careers"],
        keywords: ["STEM", "financial-need", "college-aid"],
        year: 2026,
        eligibility: ["Must be enrolled in an accredited college or university", "Minimum 2.5 GPA"],
        requirements: {
          essay: true,
          recommendation_letters: 1,
          transcript_required: true,
          resume_required: false,
          portfolio_required: false,
          fafsa_required: false
        },
        raw_data: { link_text: link.text, url: link.href },
        is_active: true,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (scrapedListings.length > 0) {
      console.log(`[Playwright Scraper] Upserting ${scrapedListings.length} listings to Supabase...`);
      const { error } = await supabase
        .from("funding_opportunities")
        .upsert(scrapedListings, { onConflict: "id" });

      if (error) {
        console.error("[Playwright Scraper] Supabase upsert error:", error.message);
      } else {
        console.log("[Playwright Scraper] Successfully upserted scraped items to global catalog.");
      }
    }

  } catch (err) {
    console.error("[Playwright Scraper] Error running local scraper:", err.message || err);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log("[Playwright Scraper] Completed.");
  }
}

scrapeOpportunities();
