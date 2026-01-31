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
import { Search, Sparkles } from "lucide-react";

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

    const { data: portfolios } = await query;

    // Separate featured portfolios
    const featuredPortfolios = portfolios?.filter((p) => p.featured) || [];
    const regularPortfolios = portfolios?.filter((p) => !p.featured) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b glass-border bg-background/60 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                <div className="container relative max-w-7xl mx-auto px-6 py-20">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-primary">Discover Talent</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tight gradient-text">
                            Professional Directory
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Explore portfolios from talented professionals. Find your next hire or collaborator.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-10 flex flex-col lg:flex-row gap-4">
                        <form className="relative flex-1" action="/portfolios">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                name="q"
                                defaultValue={q}
                                placeholder="Search by name, role, or skills..."
                                className="pl-12 h-14 rounded-2xl glass-border text-lg"
                            />
                            {sort && <input type="hidden" name="sort" value={sort} />}
                            {status && <input type="hidden" name="status" value={status} />}
                        </form>

                        <div className="flex gap-3">
                            <Select defaultValue={sort}>
                                <SelectTrigger className="w-[180px] h-14 rounded-2xl glass-border">
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
                                className="h-14 rounded-2xl font-bold px-6"
                                asChild
                            >
                                <a href={`/portfolios${status === "open" ? "" : "?status=open"}${q ? `&q=${q}` : ""}${sort && sort !== "recent" ? `&sort=${sort}` : ""}`}>
                                    {status === "open" ? "Showing: " : ""}Open to Work
                                </a>
                            </Button>

                            {(q || status || (sort && sort !== "recent")) && (
                                <Button
                                    variant="ghost"
                                    className="h-14 rounded-2xl font-bold"
                                    asChild
                                >
                                    <a href="/portfolios">Clear All</a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container max-w-7xl mx-auto px-6 py-12">
                {/* Results Count */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-muted-foreground font-medium">
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
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-heading font-black">Featured Professionals</h2>
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
                    <div>
                        {featuredPortfolios.length > 0 && (
                            <h2 className="text-xl font-heading font-black mb-6">All Portfolios</h2>
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
                        <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <Search className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-heading font-black">No portfolios found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Try adjusting your search filters or browse all available portfolios.
                            </p>
                        </div>
                        <Button variant="default" className="rounded-xl" asChild>
                            <a href="/portfolios">View All Portfolios</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
