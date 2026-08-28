import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ExternalLink, Mail, User, Sparkles, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default async function AdminCandidatesPage({
    searchParams
}: {
    searchParams: Promise<{
        q?: string;
        location?: string;
        open_to_work?: string;
    }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/dashboard");
    }

    const { q, location, open_to_work } = await searchParams;

    // Build recruiter candidates list query
    let query = supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            email,
            location,
            is_pro,
            target_role,
            created_at,
            portfolios:portfolios(slug, is_public, open_to_work, skills)
        `)
        .order("created_at", { ascending: false });

    // Filter by name or target role or email
    if (q) {
        query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,target_role.ilike.%${q}%`);
    }

    // Filter by location
    if (location) {
        query = query.ilike("location", `%${location}%`);
    }

    const { data: candidates, error } = await query;

    if (error) {
        console.error("Error fetching candidates:", error);
    }

    // Apply client side or post-query filtering for portfolio attributes
    let filteredCandidates = candidates || [];
    if (open_to_work === "true") {
        filteredCandidates = filteredCandidates.filter(c => 
            c.portfolios && (c.portfolios as any).some((p: any) => p.open_to_work === true)
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-[#e9eee8] text-[#102b2b]">
            <div className="flex flex-col gap-3 border-b border-[#102b2b]/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0d8274]">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        Admin Workspace
                    </div>
                    <h2 className="text-3xl font-heading font-black tracking-[-0.03em] md:text-4xl mt-1">Recruiter Directory</h2>
                    <p className="mt-1 text-sm text-[#102b2b]/65">
                        Discover talent, view active candidate portfolios, and manage talent pools.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-none border-[#102b2b]/15 font-bold" asChild>
                        <Link href="/dashboard/admin">Admin Dashboard</Link>
                    </Button>
                </div>
            </div>

            {/* Filter controls */}
            <Card className="rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                <CardContent className="p-6">
                    <form className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 items-end" action="/dashboard/admin/candidates">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search Candidates</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0d8274]" />
                                <Input
                                    name="q"
                                    defaultValue={q}
                                    placeholder="Name, role, or email..."
                                    className="h-10 rounded-none border-[#102b2b]/15 bg-white pl-9 text-sm text-[#102b2b] placeholder:text-[#102b2b]/45"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0d8274]" />
                                <Input
                                    name="location"
                                    defaultValue={location}
                                    placeholder="City, Country..."
                                    className="h-10 rounded-none border-[#102b2b]/15 bg-white pl-9 text-sm text-[#102b2b] placeholder:text-[#102b2b]/45"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pb-3">
                            <input
                                type="checkbox"
                                id="open_to_work"
                                name="open_to_work"
                                value="true"
                                defaultChecked={open_to_work === "true"}
                                className="h-4 w-4 rounded border-[#102b2b]/15 text-[#0d8274] focus:ring-[#0d8274]"
                            />
                            <label htmlFor="open_to_work" className="text-sm font-semibold cursor-pointer">
                                Only Open to Work
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="h-10 flex-1 rounded-none bg-[#102b2b] font-bold text-[#d8f36b] hover:bg-[#0d8274]">
                                Apply Filters
                            </Button>
                            {(q || location || open_to_work) && (
                                <Button variant="outline" className="h-10 rounded-none border-[#102b2b]/15 font-bold" asChild>
                                    <Link href="/dashboard/admin/candidates">Clear</Link>
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Candidates Table */}
            <div className="rounded-none border border-[#102b2b]/15 bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#f5f7f2]">
                        <TableRow className="hover:bg-transparent border-[#102b2b]/10">
                            <TableHead className="font-bold text-[#102b2b]">Candidate</TableHead>
                            <TableHead className="font-bold text-[#102b2b]">Target Role</TableHead>
                            <TableHead className="font-bold text-[#102b2b]">Location</TableHead>
                            <TableHead className="font-bold text-[#102b2b]">Plan Status</TableHead>
                            <TableHead className="font-bold text-[#102b2b]">Skills / Badges</TableHead>
                            <TableHead className="text-right font-bold text-[#102b2b]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#102b2b]/10">
                        {filteredCandidates.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="h-32 text-center text-[#102b2b]/60 font-medium">
                                    No candidates match your current filter criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCandidates.map((candidate) => {
                                const portfolio = candidate.portfolios?.[0] as any;
                                const isAvailable = portfolio?.open_to_work;
                                const skills = portfolio?.skills || [];
                                const initials = (candidate.full_name || "C")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <TableRow key={candidate.id} className="hover:bg-[#e9eee8]/30 transition-colors border-[#102b2b]/10">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#d8f36b] font-black text-[#102b2b] text-sm">
                                                    {initials}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="font-bold block text-sm leading-none">{candidate.full_name || "N/A"}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{candidate.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-sm">
                                            {candidate.target_role || "Not Specified"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                {candidate.location || "N/A"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={candidate.is_pro ? "default" : "secondary"} className={candidate.is_pro ? "bg-green-100 text-green-800 hover:bg-green-100 border-none rounded-none font-bold" : "rounded-none border-none"}>
                                                {candidate.is_pro ? "Pro Plan" : "Free Starter"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                {isAvailable && (
                                                    <Badge className="bg-[#0d8274] text-white hover:bg-[#0d8274] border-none rounded-none text-[10px] font-bold">
                                                        Open To Work
                                                    </Badge>
                                                )}
                                                {skills.slice(0, 3).map((skill: string, idx: number) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] font-medium border-[#102b2b]/15 rounded-none text-[#102b2b]/70 bg-transparent">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {skills.length > 3 && (
                                                    <Badge variant="outline" className="text-[10px] border-[#102b2b]/10 rounded-none text-muted-foreground">
                                                        +{skills.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {portfolio?.slug && (
                                                    <Button size="sm" variant="outline" className="h-8 rounded-none border-[#102b2b]/15 gap-1.5 font-bold" asChild>
                                                        <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                                                            View Portfolio
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline" className="h-8 rounded-none border-[#102b2b]/15 gap-1.5 font-bold" asChild>
                                                    <a href={`mailto:${candidate.email}`}>
                                                        <Mail className="h-3.5 w-3.5" />
                                                        Contact
                                                    </a>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
