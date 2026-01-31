import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    MapPin,
    ExternalLink,
    Briefcase,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

export default async function PortfoliosDirectoryPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; status?: string }>
}) {
    const supabase = await createClient();
    const { q, status } = await searchParams;

    // 1. Fetch public portfolios
    let query = supabase
        .from("portfolios")
        .select(`
            *,
            profiles:user_id (full_name, location)
        `)
    //  .eq("is_public", true);

    if (q) {
        query = query.or(`full_name.ilike.%${q}%,bio.ilike.%${q}%`);
    }

    if (status === "open") {
        query = query.eq("open_to_work", true);
    }

    const { data: portfolios } = await query.order("updated_at", { ascending: false });

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-muted/30 border-b">
                <div className="container max-w-6xl mx-auto px-6 py-20">
                    <div className="max-w-2xl space-y-4">
                        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                            Professional Directory
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Discover top talent and explore the professional portfolios of our community.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col md:flex-row gap-4">
                        <form className="relative flex-1" action="/portfolios">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="q"
                                defaultValue={q}
                                placeholder="Search by name, role, or skills..."
                                className="pl-10 h-12 rounded-xl"
                            />
                        </form>
                        <div className="flex gap-2">
                            <Button variant={status === "open" ? "default" : "outline"} className="h-12 rounded-xl" asChild>
                                <a href={`/portfolios${status === "open" ? "" : "?status=open"}${q ? `&q=${q}` : ""}`}>
                                    Open to Work
                                </a>
                            </Button>
                            <Button variant="outline" className="h-12 rounded-xl" asChild>
                                <a href="/portfolios">Clear</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="container max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-muted-foreground font-medium">
                        Showing {portfolios?.length || 0} professional profiles
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios?.map((p) => (
                        <Card key={p.id} className="group hover:border-primary/40 transition-all flex flex-col">
                            <CardHeader className="p-6">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                                        {p.full_name || p.profiles?.full_name || "Professional"}
                                    </h3>
                                    {p.open_to_work && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 whitespace-nowrap">
                                            Open to Work
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {p.location || p.profiles?.location || "Remote"}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                    {p.bio || "Crafting digital experiences and solving complex problems with code."}
                                </p>
                            </CardContent>
                            <CardFooter className="p-6 border-t bg-muted/5 group-hover:bg-muted/10 transition-colors">
                                <Button className="w-full gap-2 rounded-xl h-11" asChild>
                                    <Link href={`/p/${p.slug}`}>
                                        View Portfolio
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {portfolios?.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <Search className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold">No profiles found</h4>
                                <p className="text-muted-foreground">Try adjusting your search filters or browse all portfolios.</p>
                            </div>
                            <Button variant="outline" asChild>
                                <a href="/portfolios">View All Portfolios</a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
