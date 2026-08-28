import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeSalaryInsights } from "@/lib/ai/index";
import { ResumeData } from "@/lib/ai/index";
import { NextResponse } from "next/server";
import { scrapeAndAggregateSalaries } from "@/lib/scrapers/salary-scraper";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Create admin Supabase client to bypass row RLS constraints for writing/updating cache
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

export async function POST(req: Request) {
    try {
        const supabase = await createServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check plan-wise daily rate limits
        const { allowed, isPro } = await checkRateLimit("salary_insights");
        if (!allowed) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "LIMIT_EXCEEDED", 
                    message: isPro 
                        ? "You have reached your daily limit for Salary Insights." 
                        : "Free users can only run 1 Salary Insights check per day. Please upgrade to Pro for unlimited access." 
                }), 
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        const { resumeId, targetRole, location } = await req.json();

        if (!resumeId || !targetRole) {
            return new NextResponse("Missing required fields (resumeId, targetRole)", { status: 400 });
        }

        // 1. Fetch resume and related data
        const { data: resume } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", resumeId)
            .eq("user_id", user.id)
            .single();

        if (!resume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        const [
            { data: personalInfo },
            { data: workExperiences },
            { data: education },
            { data: skills },
            { data: projects },
            { data: certifications },
            { data: languages },
        ] = await Promise.all([
            supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
            supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
            supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
        ]);

        // 2. Format as ResumeData for lib/ai
        const resumeData: ResumeData = {
            personalInfo: {
                fullName: personalInfo?.full_name || undefined,
                email: personalInfo?.email || undefined,
                phone: personalInfo?.phone || undefined,
                location: personalInfo?.location || undefined,
                linkedin: personalInfo?.linkedin || undefined,
                website: personalInfo?.website || undefined,
                github: personalInfo?.github || undefined,
                summary: personalInfo?.summary || undefined,
            },
            workExperience: (workExperiences || []).map(exp => ({
                company: exp.company || "",
                position: exp.position || "",
                location: exp.location || undefined,
                startDate: exp.start_date || undefined,
                endDate: exp.end_date || undefined,
                current: exp.is_current || false,
                description: exp.description || "",
            })),
            education: (education || []).map(edu => ({
                institution: edu.institution || "",
                degree: edu.degree || undefined,
                field: edu.field_of_study || undefined,
                location: edu.location || undefined,
                startDate: edu.start_date || undefined,
                endDate: edu.end_date || undefined,
            })),
            skills: (skills || []).map(s => ({
                items: s.skills || [],
                category: s.name || "Skills",
            })),
            projects: (projects || []).map(p => ({
                name: p.name || "",
                description: p.description || "",
                technologies: p.technologies || [],
                url: p.url || undefined,
            })),
            certifications: (certifications || []).map(c => ({
                name: c.name || "",
                issuer: c.issuer || "",
                date: c.date || undefined,
                url: c.url || undefined,
            })),
            languages: (languages || []).map(l => ({
                language: l.language || "",
                proficiency: l.proficiency || "",
            })),
        };

        // 3. Normalize inputs for database matching
        const normalizedRole = targetRole.trim().toLowerCase();
        const normalizedLocation = (location || "remote").trim().toLowerCase();

        // 4. Query DB cache first using admin Supabase client
        const { data: cachedBenchmark } = await supabaseAdmin
            .from("salary_benchmarks")
            .select("*")
            .eq("role", normalizedRole)
            .eq("location", normalizedLocation)
            .maybeSingle();

        // Check if cache is valid (not expired)
        const isCacheValid = cachedBenchmark && (
            !cachedBenchmark.expires_at || 
            new Date(cachedBenchmark.expires_at) > new Date()
        );

        let insights;
        if (isCacheValid) {
            console.log(`[SALARY_INSIGHTS] Found cached benchmarks for "${normalizedRole}" in "${normalizedLocation}" (source: ${cachedBenchmark.source || 'unknown'}).`);
            
            // Call AI using the verified cached numbers to build customized negotiation and skill lists
            insights = await analyzeSalaryInsights(resumeData, targetRole, location || "Remote", {
                low: Number(cachedBenchmark.low),
                median: Number(cachedBenchmark.median),
                high: Number(cachedBenchmark.high),
                marketDemand: cachedBenchmark.market_demand as "High" | "Moderate" | "Steady",
                locationMultiplier: Number(cachedBenchmark.location_multiplier),
                currency: cachedBenchmark.currency,
                source: cachedBenchmark.source || "cached",
            });
        } else {
            console.log(`[SALARY_INSIGHTS] No valid cache. Scraping real salary data from RapidAPI...`);
            
            // ── Step A: Scrape real data from RapidAPI ──
            const scrapedData = await scrapeAndAggregateSalaries(normalizedRole, normalizedLocation);

            if (scrapedData) {
                console.log(`[SALARY_INSIGHTS] Scraped successfully from ${scrapedData.source}. Saving to DB and feeding to AI...`);

                // ── Step B: Save scraped data to DB ──
                try {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 30); // Cache for 30 days

                    const { error: upsertErr } = await supabaseAdmin
                        .from("salary_benchmarks")
                        .upsert({
                            role: normalizedRole,
                            location: normalizedLocation,
                            currency: scrapedData.currency,
                            low: scrapedData.low,
                            median: scrapedData.median,
                            high: scrapedData.high,
                            market_demand: scrapedData.marketDemand,
                            location_multiplier: scrapedData.locationMultiplier,
                            source: scrapedData.source,
                            scrape_count: scrapedData.scrapeCount,
                            raw_data: scrapedData.rawData,
                            scraped_at: new Date().toISOString(),
                            expires_at: expiresAt.toISOString(),
                        }, {
                            onConflict: "role,location"
                        });

                    if (upsertErr) {
                        console.error("[SALARY_INSIGHTS_CACHE_WRITE_ERROR]", upsertErr);
                    } else {
                        console.log(`[SALARY_INSIGHTS] ✅ Cached scraped benchmarks for "${normalizedRole}" in "${normalizedLocation}" (expires: ${expiresAt.toISOString()}).`);
                    }
                } catch (cacheErr) {
                    console.error("[SALARY_INSIGHTS_CACHE_EXCEPTION]", cacheErr);
                }

                // ── Step C: Feed scraped numbers to AI for skills analysis ──
                insights = await analyzeSalaryInsights(resumeData, targetRole, location || "Remote", {
                    low: scrapedData.low,
                    median: scrapedData.median,
                    high: scrapedData.high,
                    marketDemand: scrapedData.marketDemand,
                    locationMultiplier: scrapedData.locationMultiplier,
                    currency: scrapedData.currency,
                    source: scrapedData.source,
                });
            } else {
                // ── Fallback: AI-only estimation (no real data available) ──
                console.warn(`[SALARY_INSIGHTS] Scraping failed. Falling back to AI-only estimation...`);
                insights = await analyzeSalaryInsights(resumeData, targetRole, location || "Remote");

                // Still cache the AI-estimated data (marked as 'ai' source)
                try {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7); // AI estimates expire faster (7 days)

                    const { error: insertErr } = await supabaseAdmin
                        .from("salary_benchmarks")
                        .upsert({
                            role: normalizedRole,
                            location: normalizedLocation,
                            currency: insights.currency,
                            low: insights.low,
                            median: insights.median,
                            high: insights.high,
                            market_demand: insights.marketDemand,
                            location_multiplier: insights.locationMultiplier,
                            source: "ai",
                            scrape_count: 0,
                            raw_data: { aiEstimate: insights, scrapedAt: new Date().toISOString() },
                            scraped_at: new Date().toISOString(),
                            expires_at: expiresAt.toISOString(),
                        }, {
                            onConflict: "role,location"
                        });

                    if (insertErr) {
                        console.error("[SALARY_INSIGHTS_CACHE_WRITE_ERROR]", insertErr);
                    }
                } catch (cacheErr) {
                    console.error("[SALARY_INSIGHTS_CACHE_EXCEPTION]", cacheErr);
                }
            }
        }

        return NextResponse.json(insights);
    } catch (error) {
        console.error("[SALARY_INSIGHTS_ANALYSIS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
