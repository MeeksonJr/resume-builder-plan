import { createClient } from "@/lib/supabase/server";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles, SlidersHorizontal } from "lucide-react";

export default async function PortfoliosDirectoryPage({
    searchParams
}: {
    searchParams: Promise<{
        q?: string;
        status?: string;
        sort?: string;
    }>
}) {
    const supabase = await createClient();
    const { q, status, sort = "recent" } = await searchParams;

    // 1. Fetch public portfolios with enhanced data
    let query = supabase
        .from("portfolios")
        .select(`
      *,
      profiles:user_id (full_name, location, avatar_url)
    `)
        .eq("is_public", true);

    // Apply search filter
    if (q) {
        query = query.or(`full_name.ilike.%${q}%,bio.ilike.%${q}%,tagline.ilike.%${q}%`);
    }

    // Apply status filter
    if (status === "open") {
        query = query.eq("open_to_work", true);
    }

    // Apply sorting
    switch (sort) {
        case "popular":
            query = query.order("view_count", { ascending: false });
            break;
        case "name":
            query = query.order("full_name", { ascending: true });
            break;
        case "recent":
        default:
            query = query.order("updated_at", { ascending: false });
            break;
    }

    const { data: portfolios, error } = await query;

    if (error) {
        console.error("Error fetching portfolios:", error);
    }

    // Separate featured portfolios
    const featuredPortfolios = portfolios?.filter((p) => p.featured) || [];
    const regularPortfolios = portfolios?.filter((p) => !p.featured) || [];

    return (

        <div className="min-h-full bg-[#e9eee8] text-[#102b2b]">
            <div className="container mx-auto max-w-7xl space-y-10 px-5 py-8 md:px-8 lg:py-12">
                <div className="flex flex-col gap-3 border-b border-[#102b2b]/15 pb-8">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0d8274]">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        Showcase / Discovery
                    </div>
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <h1 className="text-3xl font-heading font-black tracking-[-0.03em] md:text-5xl">
                                Professional directory
                            </h1>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-[#102b2b]/65">
                                Explore portfolios from talented professionals. Find your next hire or collaborator.
                            </p>
                        </div>
                        <div className="hidden items-center gap-2 border-l border-[#102b2b]/15 pl-5 text-xs font-bold uppercase tracking-widest text-[#102b2b]/50 md:flex">
                            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                            Curated profiles
                        </div>
                    </div>
                </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3 border border-[#102b2b]/15 bg-[#f5f7f2] p-3 lg:flex-row">
                <form className="relative flex-1" action="/dashboard/portfolios">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0d8274]" aria-hidden="true" />
                    <Input
                        name="q"
                        defaultValue={q}
                        placeholder="Search by name, role, or skills..."
                        className="h-12 rounded-none border-[#102b2b]/15 bg-transparent pl-12 text-base text-[#102b2b] placeholder:text-[#102b2b]/45 focus-visible:ring-[#0d8274]"
                    />
                    {sort && <input type="hidden" name="sort" value={sort} />}
                    {status && <input type="hidden" name="status" value={status} />}
                </form>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Select defaultValue={sort}>
                        <SelectTrigger className="h-12 w-full rounded-none border-[#102b2b]/15 bg-transparent text-[#102b2b] sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant={status === "open" ? "default" : "outline"}
                        className="h-12 rounded-none border-[#102b2b] px-5 font-bold"
                        asChild
                    >
                        <a href={`/dashboard/portfolios${status === "open" ? "" : "?status=open"}${q ? `&q=${q}` : ""}${sort && sort !== "recent" ? `&sort=${sort}` : ""}`}>
                            {status === "open" ? "Showing: " : ""}Open to work
                        </a>
                    </Button>

                    {(q || status || (sort && sort !== "recent")) && (
                        <Button
                            variant="ghost"
                            className="h-12 rounded-none font-bold text-[#102b2b]/65 hover:bg-[#d8f36b]/40 hover:text-[#102b2b]"
                            asChild
                        >
                            <a href="/dashboard/portfolios">Clear All</a>
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div role="alert" className="border border-red-900/20 bg-red-50 px-5 py-4 text-sm text-red-950">
                    We could not load the directory right now. Please try again shortly.
                </div>
            )}

            {/* Content Section */}
            <div className="space-y-12">
                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#102b2b]/55">
                        {featuredPortfolios.length + regularPortfolios.length === 0 ? (
                            "No portfolios found"
                        ) : (
                            <>
                                Showing <span className="font-bold text-foreground">{featuredPortfolios.length + regularPortfolios.length}</span> professional
                                {featuredPortfolios.length + regularPortfolios.length === 1 ? "" : "s"}
                            </>
                        )}
                    </p>
                </div>

                {/* Featured Portfolios */}
                {featuredPortfolios.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-heading font-black tracking-[-0.02em]">Featured professionals</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredPortfolios.map((portfolio) => (
                                <PortfolioCard key={portfolio.id} portfolio={portfolio} featured />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Portfolios */}
                {regularPortfolios.length > 0 && (
                    <div className="space-y-6">
                        {featuredPortfolios.length > 0 && (
                            <h2 className="text-xl font-heading font-black tracking-[-0.02em]">All portfolios</h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regularPortfolios.map((portfolio) => (
                                <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {portfolios?.length === 0 && (
                    <div className="py-20 text-center space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center border border-[#102b2b]/15 bg-[#f5f7f2] text-[#0d8274]">
                            <Search className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-heading font-black">No portfolios found</h3>
                            <p className="mx-auto max-w-md text-[#102b2b]/60">
                                Try adjusting your search filters or browse all available portfolios.
                            </p>
                        </div>
                        <Button className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274]" asChild>
                            <a href="/dashboard/portfolios">View All Portfolios</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}

