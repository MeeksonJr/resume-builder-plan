"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Loader2,
    Link as LinkIcon,
    Globe,
    Github,
    Linkedin,
    Twitter,
    ExternalLink,
    Save,
    Layout,
    Eye,
    EyeOff,
    Settings2,
    Palette,
    MessageSquare,
    User,
    Calendar,
    Mail,
    Trophy,
    Sparkles,
    Briefcase,
    Share2,
    Search,
    PanelRight,
    Wand2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    MousePointer2,
    ArrowUpRight,
    BarChart3
} from "lucide-react";
import { PortfolioLivePreview } from "@/components/portfolio/portfolio-live-preview";


export default function PortfolioManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [resumes, setResumes] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<{
        dailyStats: any[];
        referrers: any[];
        totalVisits: number;
        uniqueVisitors: number;
    }>({ dailyStats: [], referrers: [], totalVisits: 0, uniqueVisitors: 0 });
    const [showPreview, setShowPreview] = useState(true);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();

    const handleAiGenerate = useCallback(async (field: string) => {
        setIsGenerating(field);
        try {
            // Build context from resumes
            const resumeContext = resumes.slice(0, 3).map((r: any) =>
                `Title: ${r.title}${r.summary ? `\nSummary: ${r.summary}` : ""}${r.skills ? `\nSkills: ${(r.skills || []).join(", ")}` : ""}`
            ).join("\n\n") || portfolio?.full_name || "Professional";

            const res = await fetch("/api/portfolio/ai-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, resumeContext }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");

            setPortfolio((prev: any) => ({ ...prev, [field]: data.result }));
            toast.success(`✨ ${field.replace("_", " ")} generated!`);
        } catch (err: any) {
            toast.error(err.message || "AI generation failed");
        } finally {
            setIsGenerating(null);
        }
    }, [resumes, portfolio]);


    const fetchPortfolio = async () => {
        setIsLoading(true);
        setLoadError(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch portfolio
            const { data: pData, error: pError } = await supabase
                .from("portfolios")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (pError && pError.code !== "PGRST116") throw pError;

            let currentPortfolio = pData;
            if (!pData) {
                // Initialize default portfolio
                currentPortfolio = {
                    slug: user.email?.split("@")[0] || "portfolio",
                    full_name: user.user_metadata?.full_name || "",
                    location: "",
                    bio: "",
                    social_links: { github: "", linkedin: "", twitter: "", website: "" },
                    theme_settings: { color: "primary", typography: "default", style: "professional" },
                    featured_resumes: [],
                    featured_projects: [],
                    is_public: true,
                    open_to_work: false,
                    booking_url: "",
                    template: "modern",
                    seo_title: "",
                    seo_description: "",
                    og_image_url: "",
                    accent_color: "#3b82f6"
                };
            }
            setPortfolio(currentPortfolio);

            // 2. Fetch resumes
            const { data: resumesData } = await supabase
                .from("resumes")
                .select("id, title, updated_at")
                .order("updated_at", { ascending: false });

            const allResumes = resumesData || [];
            setResumes(allResumes);

            // 3. Fetch projects from all resumes
            const resumeIds = allResumes.map(r => r.id);
            if (resumeIds.length > 0) {
                const { data: projectsData } = await supabase
                    .from("projects")
                    .select("id, name, description, resume_id")
                    .in("resume_id", resumeIds);
                setProjects(projectsData || []);
            }

            // 4. Fetch messages if portfolio exists
            if (currentPortfolio?.id) {
                const { data: msgData } = await supabase
                    .from("portfolio_messages")
                    .select("*")
                    .eq("portfolio_id", currentPortfolio.id)
                    .order("created_at", { ascending: false });
                setMessages(msgData || []);
            }

            // 5. Fetch testimonials
            if (currentPortfolio?.id) {
                const { data: testData } = await supabase
                    .from("portfolio_testimonials")
                    .select("*")
                    .eq("portfolio_id", currentPortfolio.id)
                    .order("created_at", { ascending: false });
                setTestimonials(testData || []);
            }

            // 6. Fetch analytics if portfolio exists
            if (currentPortfolio?.id) {
                const { data: rawVisits } = await supabase
                    .from("portfolio_analytics")
                    .select("*")
                    .eq("portfolio_id", currentPortfolio.id)
                    .order("created_at", { ascending: true });

                const visits = rawVisits || [];

                // Process daily stats (last 7 days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return format(date, 'MMM dd');
                }).reverse();

                const statsMap = visits.reduce((acc: any, v: any) => {
                    const day = format(new Date(v.created_at), 'MMM dd');
                    acc[day] = (acc[day] || 0) + 1;
                    return acc;
                }, {});

                const dailyData = last7Days.map(day => ({
                    name: day,
                    visits: statsMap[day] || 0
                }));

                // Process referrers
                const referrerMap = visits.reduce((acc: any, v: any) => {
                    const ref = v.referrer === "direct" ? "Direct / Unknown" :
                        v.referrer.includes("linkedin") ? "LinkedIn" :
                            v.referrer.includes("github") ? "GitHub" :
                                v.referrer.includes("twitter") || v.referrer.includes("x.com") ? "Twitter/X" :
                                    new URL(v.referrer).hostname;
                    acc[ref] = (acc[ref] || 0) + 1;
                    return acc;
                }, {});

                const referrerData = Object.entries(referrerMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 5);

                setAnalytics({
                    dailyStats: dailyData,
                    referrers: referrerData,
                    totalVisits: visits.length,
                    uniqueVisitors: new Set(visits.map(v => v.visitor_id || v.user_agent)).size
                });
            }

        } catch (error: any) {
            console.error("Error fetching portfolio:", error.message);
            setLoadError(true);
            toast.error("Failed to load portfolio settings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("portfolios")
                .upsert({
                    ...portfolio,
                    user_id: user.id,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success("Portfolio settings saved!");
            fetchPortfolio(); // Refresh to get the ID if it was a new record
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[520px] items-center justify-center bg-[#e9eee8] text-[#102b2b]">
                <div className="flex items-center gap-3 border border-[#102b2b]/15 bg-[#f5f7f2] px-5 py-4 text-sm font-bold uppercase tracking-widest">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0d8274]" aria-hidden="true" />
                    Loading showcase
                </div>
            </div>
        );
    }

    if (loadError || !portfolio) {
        return (
            <div className="flex min-h-[520px] items-center justify-center bg-[#e9eee8] px-5 text-center text-[#102b2b]">
                <div role="alert" className="max-w-md border border-red-900/20 bg-red-50 p-8">
                    <h1 className="text-2xl font-heading font-black">Showcase unavailable</h1>
                    <p className="mt-2 text-sm leading-6 text-red-950/70">We could not load your portfolio settings. Refresh the page to try again.</p>
                    <Button className="mt-6 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274]" onClick={fetchPortfolio}>Try again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#e9eee8] text-[#102b2b]">
        <div className="flex h-full min-h-full">
            {/* Left: Editor Panel */}
            <div className={cn(
                "flex flex-col transition-all duration-300",
                showPreview ? "w-full lg:w-[55%] xl:w-[50%]" : "w-full"
            )}>
            <div className="space-y-8 px-5 py-8 animate-in fade-in duration-500 lg:px-8 lg:py-10">
            <div className="flex flex-col gap-6 border-b border-[#102b2b]/15 pb-7 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0d8274]">Showcase / My portfolio</div>
                    <h1 className="text-4xl font-heading font-black tracking-[-0.04em] md:text-5xl">Career portfolio</h1>
                    <p className="max-w-xl text-sm font-medium leading-6 text-[#102b2b]/60">Shape the public page that makes your work easy to understand, trust, and contact.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden h-9 gap-2 rounded-none border-[#102b2b]/20 bg-[#f5f7f2] font-bold text-[#102b2b] hover:bg-[#d8f36b] lg:flex"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <EyeOff className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                        {showPreview ? "Hide Preview" : "Show Preview"}
                    </Button>
                    {portfolio.slug && (
                        <Button variant="outline" size="lg" className="h-11 rounded-none border-[#102b2b]/20 bg-[#f5f7f2] font-bold text-[#102b2b] hover:bg-[#d8f36b]" asChild>
                            <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-5 w-5" />
                                Preview
                            </a>
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="h-11 gap-2 rounded-none bg-[#102b2b] px-7 font-black text-[#d8f36b] shadow-none hover:bg-[#0d8274]">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>


            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-8 flex h-auto w-full gap-1 overflow-x-auto border-b border-[#102b2b]/15 bg-transparent p-0 scrollbar-hide">
                    <TabsTrigger value="general" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Settings2 className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="social" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Globe className="h-4 w-4" />
                        Social
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Search className="h-4 w-4" />
                        SEO & Social
                    </TabsTrigger>
                    <TabsTrigger value="share" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Share2 className="h-4 w-4" />
                        Share
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Palette className="h-4 w-4" />
                        Visuals
                    </TabsTrigger>
                    <TabsTrigger value="content" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Layout className="h-4 w-4" />
                        Gallery
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <MessageSquare className="h-4 w-4" />
                        Messages
                        {messages.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-primary text-white border-none font-black">
                                {messages.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="testimonials" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <Trophy className="h-4 w-4" />
                        Proof
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="h-12 shrink-0 gap-2 rounded-none border-b-2 border-transparent px-4 font-bold text-[#102b2b]/55 transition-all data-[state=active]:border-[#0d8274] data-[state=active]:bg-[#d8f36b]/45 data-[state=active]:text-[#102b2b]">
                        <BarChart3 className="h-4 w-4" />
                        Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="share" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Share2 className="h-4 w-4 text-primary" />
                                </div>
                                Public Access & Sharing
                            </CardTitle>
                            <CardDescription className="font-medium">Manage how others view and access your portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-col items-start justify-between gap-4 border border-[#0d8274]/25 bg-[#d8f36b]/25 p-5 sm:flex-row sm:items-center">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-foreground">Public Access</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Allow anyone with the link to view your portfolio.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-xs font-bold uppercase tracking-wider", portfolio.is_public ? "text-green-500" : "text-muted-foreground")}>
                                        {portfolio.is_public ? "Live" : "Private"}
                                    </span>
                                    <Button
                                        variant={portfolio.is_public ? "default" : "outline"}
                                        onClick={() => setPortfolio({ ...portfolio, is_public: !portfolio.is_public })}
                                        className={cn("w-24 font-bold", portfolio.is_public ? "bg-green-600 hover:bg-green-700 text-white" : "")}
                                    >
                                        {portfolio.is_public ? "Enabled" : "Disabled"}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Public Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={`https://resumebuilder.ai/p/${portfolio.slug}`}
                                        className="font-mono bg-slate-950/50 border-primary/10"
                                    />
                                    <Button variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(`https://resumebuilder.ai/p/${portfolio.slug}`);
                                        toast.success("Link copied to clipboard");
                                    }}>
                                        <LinkIcon className="h-4 w-4" />
                                    </Button>
                                    <Button variant="secondary" asChild>
                                        <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 gap-2" />
                                            View Live
                                        </a>
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="general" className="mt-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="group overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                Basic Information
                            </CardTitle>
                            <CardDescription className="font-medium">This information will be displayed at the top of your portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Display Name</Label>
                                    <Input
                                        id="full_name"
                                        value={portfolio.full_name || ""}
                                        onChange={(e) => setPortfolio({ ...portfolio, full_name: e.target.value })}
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={portfolio.location || ""}
                                        onChange={(e) => setPortfolio({ ...portfolio, location: e.target.value })}
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Portfolio URL slug</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm font-mono">/p/</span>
                                    <Input
                                        id="slug"
                                        value={portfolio.slug}
                                        onChange={(e) => setPortfolio({ ...portfolio, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                                        placeholder="your-name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="bio">Professional Bio</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 gap-1.5 rounded-none border border-[#0d8274]/30 bg-[#d8f36b]/20 px-2.5 text-[10px] font-black uppercase tracking-widest text-[#0d8274] hover:bg-[#d8f36b]/40"
                                        disabled={isGenerating === "bio"}
                                        onClick={() => handleAiGenerate("bio")}
                                    >
                                        {isGenerating === "bio" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                        AI Write
                                    </Button>
                                </div>
                                <Textarea
                                    id="bio"
                                    rows={5}
                                    placeholder="Write a brief introduction about yourself and your career goals..."
                                    value={portfolio.bio}
                                    onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
                                    className={cn(isGenerating === "bio" && "animate-pulse")}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_public_check"
                                    className="h-4 w-4 rounded border-input"
                                    checked={portfolio.is_public !== false}
                                    onChange={(e) => setPortfolio({ ...portfolio, is_public: e.target.checked })}
                                />
                                <Label htmlFor="is_public_check" className="cursor-pointer">Public Portfolio</Label>
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {portfolio.is_public !== false ? "Visible to everyone" : "Private (only you can see)"}
                                </span>
                            </div>

                            <div className="pt-4 border-t space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="open_to_work" className="text-base font-bold">Open to New Opportunities</Label>
                                        <p className="text-sm text-muted-foreground">Show an "Open to Work" badge on your public profile.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="open_to_work"
                                        className="h-6 w-11 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary bg-input cursor-pointer appearance-none relative before:absolute before:inline-block before:h-5 before:w-5 before:rounded-full before:bg-background before:shadow-lg before:ring-0 before:transition-transform checked:before:translate-x-5 before:translate-x-0"
                                        checked={portfolio.open_to_work}
                                        onChange={(e) => setPortfolio({ ...portfolio, open_to_work: e.target.checked })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="booking_url" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Booking URL (Calendly, Cal.com, etc.)
                                    </Label>
                                    <Input
                                        id="booking_url"
                                        placeholder="https://calendly.com/your-name"
                                        value={portfolio.booking_url || ""}
                                        onChange={(e) => setPortfolio({ ...portfolio, booking_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="social" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Globe className="h-4 w-4 text-primary" />
                                </div>
                                Social & Professional Links
                            </CardTitle>
                            <CardDescription className="font-medium">Connect your professional profiles to help recruiters find you.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4 text-blue-600" />
                                        LinkedIn URL
                                    </Label>
                                    <Input
                                        className="rounded-xl border-primary/10"
                                        placeholder="https://linkedin.com/in/username"
                                        value={portfolio.social_links?.linkedin || ""}
                                        onChange={(e) => setPortfolio({
                                            ...portfolio,
                                            social_links: { ...portfolio.social_links, linkedin: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Github className="h-4 w-4" />
                                        GitHub URL
                                    </Label>
                                    <Input
                                        className="rounded-xl border-primary/10"
                                        placeholder="https://github.com/username"
                                        value={portfolio.social_links?.github || ""}
                                        onChange={(e) => setPortfolio({
                                            ...portfolio,
                                            social_links: { ...portfolio.social_links, github: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Twitter className="h-4 w-4 text-sky-500" />
                                        Twitter / X URL
                                    </Label>
                                    <Input
                                        className="rounded-xl border-primary/10"
                                        placeholder="https://twitter.com/username"
                                        value={portfolio.social_links?.twitter || ""}
                                        onChange={(e) => setPortfolio({
                                            ...portfolio,
                                            social_links: { ...portfolio.social_links, twitter: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-green-600" />
                                        Personal Website
                                    </Label>
                                    <Input
                                        className="rounded-xl border-primary/10"
                                        placeholder="https://yourwebsite.com"
                                        value={portfolio.social_links?.website || ""}
                                        onChange={(e) => setPortfolio({
                                            ...portfolio,
                                            social_links: { ...portfolio.social_links, website: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="seo" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Search className="h-4 w-4 text-primary" />
                                </div>
                                Discovery & Social Sharing (SEO)
                            </CardTitle>
                            <CardDescription className="font-medium">Optimize how your portfolio appears in search engines and on social media platforms.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="seo_title" className="flex items-center gap-2">
                                            Meta Title
                                            <Badge variant="outline" className="text-[10px] font-black tracking-widest border-primary/10 text-muted-foreground">Title Tag</Badge>
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 gap-1.5 rounded-none border border-[#0d8274]/30 bg-[#d8f36b]/20 px-2.5 text-[10px] font-black uppercase tracking-widest text-[#0d8274] hover:bg-[#d8f36b]/40"
                                            disabled={!!isGenerating}
                                            onClick={() => handleAiGenerate("seo_title")}
                                        >
                                            {isGenerating === "seo_title" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                            AI Write
                                        </Button>
                                    </div>
                                    <Input
                                        id="seo_title"
                                        className="rounded-xl border-primary/10"
                                        placeholder="e.g. John Doe | Senior Full Stack Engineer"
                                        value={portfolio.seo_title || ""}
                                        onChange={(e) => setPortfolio({ ...portfolio, seo_title: e.target.value })}
                                        maxLength={60}
                                    />
                                    <p className="text-[10px] text-muted-foreground/60 font-medium">Recommended: Under 60 characters for best display in search results.</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="seo_description" className="flex items-center gap-2">
                                            Meta Description
                                            <Badge variant="outline" className="text-[10px] font-black tracking-widest border-primary/10 text-muted-foreground">Snippet</Badge>
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 gap-1.5 rounded-none border border-[#0d8274]/30 bg-[#d8f36b]/20 px-2.5 text-[10px] font-black uppercase tracking-widest text-[#0d8274] hover:bg-[#d8f36b]/40"
                                            disabled={!!isGenerating}
                                            onClick={() => handleAiGenerate("seo_description")}
                                        >
                                            {isGenerating === "seo_description" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                            AI Write
                                        </Button>
                                    </div>
                                    <Textarea
                                        id="seo_description"
                                        className="rounded-xl border-primary/10 min-h-[100px]"
                                        placeholder="Professional portfolio of John Doe, featuring high-impact engineering projects and multi-stack expertise."
                                        value={portfolio.seo_description || ""}
                                        onChange={(e) => setPortfolio({ ...portfolio, seo_description: e.target.value })}
                                        maxLength={160}
                                    />
                                    <p className="text-[10px] text-muted-foreground/60 font-medium">Recommended: Between 150-160 characters to optimize search snippets.</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-primary/5">
                                    <Label htmlFor="og_image_url" className="flex items-center gap-2">
                                        <Share2 className="h-4 w-4 text-primary" />
                                        Social Preview Image (OpenGraph URL)
                                    </Label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                id="og_image_url"
                                                className="rounded-xl border-primary/10"
                                                placeholder="https://example.com/my-preview.jpg"
                                                value={portfolio.og_image_url || ""}
                                                onChange={(e) => setPortfolio({ ...portfolio, og_image_url: e.target.value })}
                                            />
                                            <p className="text-[10px] text-muted-foreground/60 font-medium italic">Provide a link to a high-quality (1200x630) image that represents your brand.</p>
                                        </div>
                                        {portfolio.og_image_url && (
                                            <div className="group relative h-20 w-36 rounded-xl border border-primary/5 bg-slate-900/50 overflow-hidden shrink-0">
                                                <Image
                                                    src={portfolio.og_image_url}
                                                    alt="SEO Preview"
                                                    fill
                                                    className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    unoptimized // For external URLs until domain is configured
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="text-[8px] font-black uppercase text-white/20">Preview</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-6 rounded-[24px] border border-primary/5 bg-primary/5 space-y-4">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Live Preview Simulation
                                </h4>
                                <div className="space-y-2">
                                    <p className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer leading-tight truncate">
                                        {portfolio.seo_title || portfolio.full_name || "Untitled Portfolio"}
                                    </p>
                                    <p className="text-[#006621] text-xs font-medium truncate mb-1">
                                        {`https://resumebuilder.ai/p/${portfolio.slug}`}
                                    </p>
                                    <p className="text-gray-400 text-xs line-clamp-2 max-w-lg leading-relaxed">
                                        {portfolio.seo_description || portfolio.bio?.slice(0, 150) || "Explore my professional portfolio, projects, and career highlights..."}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Palette className="h-4 w-4 text-primary" />
                                </div>
                                Branding & Visuals
                            </CardTitle>
                            <CardDescription className="font-medium">Choose how your portfolio looks to the world.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Palette className="h-4 w-4 text-primary" />
                                        Accent Brilliance
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground/60 font-medium mb-3">Define the core signature color for your portfolio layout.</p>
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <Input
                                                type="color"
                                                className="h-12 w-24 cursor-pointer rounded-none border-[#102b2b]/15 bg-[#102b2b] p-1 transition-all hover:bg-[#0d8274]"
                                                value={portfolio.accent_color || "#3b82f6"}
                                                onChange={(e) => setPortfolio({ ...portfolio, accent_color: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                className="h-12 rounded-none border-[#102b2b]/15 bg-transparent font-mono text-sm"
                                                placeholder="#3b82f6"
                                                value={portfolio.accent_color || "#3b82f6"}
                                                onChange={(e) => setPortfolio({ ...portfolio, accent_color: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {[
                                            { name: "Saphire", hex: "#3b82f6" },
                                            { name: "Emerald", hex: "#10b981" },
                                            { name: "Amethyst", hex: "#8b5cf6" },
                                            { name: "Rose", hex: "#f43f5e" },
                                            { name: "Amber", hex: "#f59e0b" },
                                            { name: "Slate", hex: "#64748b" }
                                        ].map((preset) => (
                                            <button
                                                key={preset.hex}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    portfolio.accent_color === preset.hex
                                                        ? "bg-primary/20 border-primary text-primary"
                                                        : "bg-slate-900 border-primary/5 text-muted-foreground hover:border-primary/20"
                                                )}
                                                onClick={() => setPortfolio({ ...portfolio, accent_color: preset.hex })}
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-primary/5">
                                <Label>Layout Style</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: "professional", label: "Professional", desc: "Clean and standard" },
                                        { id: "creative", label: "Creative", desc: "Bold and expressive" },
                                        { id: "minimal", label: "Minimalist", desc: "For the minimalist" },
                                    ].map((s) => (
                                        <div
                                            key={s.id}
                                            className={cn(
                                                "cursor-pointer border-2 border-[#102b2b]/10 bg-[#e9eee8] p-5 transition-all duration-300",
                                                portfolio.theme_settings?.style === s.id
                                                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)] ring-1 ring-primary/20"
                                                    : "border-primary/5 bg-slate-900/40 hover:border-primary/30"
                                            )}
                                            onClick={() => setPortfolio({
                                                ...portfolio,
                                                theme_settings: { ...portfolio.theme_settings, style: s.id }
                                            })}
                                        >
                                            <p className="font-black uppercase tracking-tight text-sm mb-1">{s.label}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-primary/5">
                                <div>
                                    <Label className="text-base font-black uppercase tracking-tight">Portfolio Template</Label>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">Choose the layout and design for your public portfolio</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { id: "modern", label: "Modern", desc: "Bold gradients and contemporary glassmorphism.", icon: Sparkles, preview: "border-primary/40 bg-gradient-to-br from-primary/20 to-transparent" },
                                        { id: "minimal", label: "Minimalist", desc: "Clean typography and maximum whitespace focus.", icon: Layout, preview: "border-primary/10 bg-slate-950" },
                                        { id: "corporate", label: "Corporate", desc: "Structured, professional, and industry-standard.", icon: Briefcase, preview: "border-primary/20 bg-slate-900" },
                                        { id: "creative", label: "Creative", desc: "Playful, unique, and highly expressive.", icon: Palette, preview: "border-primary/30 bg-primary/5" },
                                    ].map((template) => {
                                        const Icon = template.icon;
                                        const isSelected = (portfolio.template || "modern") === template.id;
                                        return (
                                            <div
                                                key={template.id}
                                                className={cn(
                                                    "group flex cursor-pointer flex-col overflow-hidden border-2 border-[#102b2b]/10 bg-[#e9eee8] transition-all duration-300 hover:border-[#0d8274]",
                                                    isSelected
                                                        ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)] ring-1 ring-primary/20"
                                                        : "border-primary/5 bg-slate-900/40 hover:border-primary/40"
                                                )}
                                                onClick={() => setPortfolio({
                                                    ...portfolio,
                                                    template: template.id
                                                })}
                                            >
                                                <div className={cn("h-32 w-full border-b border-primary/5 relative overflow-hidden", template.preview)}>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Icon className="h-20 w-20" />
                                                    </div>
                                                </div>
                                                <div className="p-5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-black uppercase tracking-tight text-sm mb-1">{template.label}</p>
                                                        {isSelected && (
                                                            <Badge variant="default" className="text-[9px] font-black uppercase tracking-widest bg-primary text-white border-none px-2 h-5">Selected</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{template.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f2] shadow-none">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Layout className="h-4 w-4 text-primary" />
                                </div>
                                Gallery Content
                            </CardTitle>
                            <CardDescription className="font-medium">Select which resumes and projects to feature on your profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-12">
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Featured Resumes</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Select resumes to showcase.</p>
                                    </div>
                                    <Badge variant="outline" className="border-primary/20 font-bold uppercase text-[10px] tracking-widest">{portfolio.featured_resumes?.length || 0} selected</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resumes.map((r) => {
                                        const isFeatured = portfolio.featured_resumes?.includes(r.id);
                                        return (
                                            <div
                                                key={r.id}
                                                className={cn(
                                                    "group flex h-36 cursor-pointer flex-col justify-between border-2 border-[#102b2b]/10 bg-[#e9eee8] p-5 transition-all duration-300",
                                                    isFeatured
                                                        ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                        : "border-primary/5 bg-slate-900/40 hover:border-primary/30"
                                                )}
                                                onClick={() => {
                                                    const current = portfolio.featured_resumes || [];
                                                    const updated = isFeatured
                                                        ? current.filter((id: string) => id !== r.id)
                                                        : [...current, r.id];
                                                    setPortfolio({ ...portfolio, featured_resumes: updated });
                                                }}
                                            >
                                                <div className="overflow-hidden">
                                                    <p className="font-black uppercase tracking-tight text-sm truncate mb-1">{r.title}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">Updated {format(new Date(r.updated_at), 'MMM d, yyyy')}</p>
                                                </div>
                                                <div className="flex justify-end">
                                                    <Badge variant={isFeatured ? "default" : "outline"} className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        isFeatured ? "bg-emerald-500 text-white border-none" : "border-primary/20"
                                                    )}>
                                                        {isFeatured ? "Featured" : "Add to Gallery"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="space-y-6 pt-10 border-t border-primary/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Featured Projects</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Showcase your best engineering work.</p>
                                    </div>
                                    <Badge variant="outline" className="border-primary/20 font-bold uppercase text-[10px] tracking-widest">{portfolio.featured_projects?.length || 0} selected</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {projects.map((p) => {
                                        const isFeatured = portfolio.featured_projects?.includes(p.id);
                                        return (
                                            <div
                                                key={p.id}
                                                className={cn(
                                                    "group flex h-44 cursor-pointer flex-col justify-between border-2 border-[#102b2b]/10 bg-[#e9eee8] p-5 transition-all duration-300",
                                                    isFeatured
                                                        ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                        : "border-primary/5 bg-slate-900/40 hover:border-primary/30"
                                                )}
                                                onClick={() => {
                                                    const current = portfolio.featured_projects || [];
                                                    const updated = isFeatured
                                                        ? current.filter((id: string) => id !== p.id)
                                                        : [...current, p.id];
                                                    setPortfolio({ ...portfolio, featured_projects: updated });
                                                }}
                                            >
                                                <div className="overflow-hidden space-y-2">
                                                    <p className="font-black uppercase tracking-tight text-sm truncate">{p.name}</p>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-3 font-medium leading-relaxed">{p.description}</p>
                                                </div>
                                                <div className="flex justify-end pt-4">
                                                    <Badge variant={isFeatured ? "default" : "outline"} className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        isFeatured ? "bg-emerald-500 text-white border-none" : "border-primary/20"
                                                    )}>
                                                        {isFeatured ? "Featured" : "Add to Gallery"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {projects.length === 0 && (
                                        <div className="col-span-full border-2 border-dashed border-[#102b2b]/15 bg-[#e9eee8] py-20 text-center text-[#102b2b]/55">
                                            <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Briefcase className="h-6 w-6 text-primary/30" />
                                            </div>
                                            <p className="text-sm font-bold uppercase tracking-tight">No projects found</p>
                                            <p className="text-xs font-medium mt-1">Add projects to your resumes to see them here.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="messages" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02]">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                Inbound Messages
                            </CardTitle>
                            <CardDescription className="font-medium">Messages received through your public portfolio contact form.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid gap-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="p-6 rounded-2xl border border-primary/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300 group shadow-lg">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                                                    {msg.sender_name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase tracking-tight text-sm">{msg.sender_name}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {msg.sender_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-slate-950/50 px-3 py-1.5 rounded-full border border-primary/5">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(msg.created_at), 'MMM d, yyyy HH:mm')}
                                            </div>
                                        </div>
                                        <div className="pt-5 border-t border-primary/5 mt-5 space-y-3">
                                            {msg.subject && (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter py-0 h-4 border-primary/20">Subject</Badge>
                                                    <p className="text-sm font-black uppercase tracking-tight text-foreground/80">{msg.subject}</p>
                                                </div>
                                            )}
                                            <div className="p-4 rounded-xl bg-slate-950/30 border border-primary/5">
                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap font-medium leading-relaxed italic">
                                                    "{msg.message}"
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-5">
                                            <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-primary/20 hover:bg-primary/10 transition-all duration-300 font-bold" asChild>
                                                <a href={`mailto:${msg.sender_email}?subject=RE: ${msg.subject || 'Portfolio Inquiry'}`}>
                                                    <ArrowUpRight className="h-4 w-4" />
                                                    Reply via Email
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {messages.length === 0 && (
                                    <div className="py-24 text-center space-y-6">
                                        <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto border border-primary/10 shadow-inner">
                                            <MessageSquare className="h-10 w-10 text-primary/30" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-black uppercase tracking-tight text-lg">Silence is Golden</h4>
                                            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
                                                When visitors contact you through your portfolio, their messages will appear here as premium insights.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="insights" className="mt-0 space-y-10 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Total Views", val: analytics.totalVisits, sub: "Cumulative visits", icon: MousePointer2, color: "primary" },
                            { label: "Unique Visitors", val: analytics.uniqueVisitors, sub: "Estimated reach", icon: Users, color: "emerald" },
                            { label: "Inquiries", val: messages.length, sub: "Contact requests", icon: MessageSquare, color: "blue" },
                            {
                                label: "Conversion Rate",
                                val: analytics.totalVisits > 0 ? ((messages.length / analytics.totalVisits) * 100).toFixed(1) + "%" : "0.0%",
                                sub: "Visits to inquiries",
                                icon: TrendingUp,
                                color: "purple"
                            },
                        ].map((stat, i) => (
                            <Card key={i} className="bg-slate-950/40 border-primary/5 shadow-xl backdrop-blur-md overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn("p-2 rounded-xl bg-opacity-10 shadow-inner",
                                            stat.color === "primary" ? "bg-primary text-primary" :
                                                stat.color === "emerald" ? "bg-emerald-500 text-emerald-500" :
                                                    stat.color === "blue" ? "bg-blue-500 text-blue-500" : "bg-purple-500 text-purple-500"
                                        )}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                        <p className="text-3xl font-black tracking-tight">{stat.val}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground/80 flex items-center gap-1 pt-1">
                                            {stat.sub}
                                        </p>
                                    </div>
                                </CardContent>
                                <div className={cn("h-1 w-full opacity-30",
                                    stat.color === "primary" ? "bg-primary" :
                                        stat.color === "emerald" ? "bg-emerald-500" :
                                            stat.color === "blue" ? "bg-blue-500" : "bg-purple-500"
                                )} />
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <LineChart className="h-4 w-4 text-primary" />
                                    </div>
                                    Traffic Trends
                                </h3>
                                <Badge variant="outline" className="border-primary/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last 7 Days</Badge>
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.dailyStats}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.4)" dy={10} fontStyle="bold" />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.4)" dx={-10} fontStyle="bold" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '12px' }}
                                            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 'black' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="visits"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={4}
                                            dot={{ r: 5, fill: '#020617', stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                                            activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    Top Referral Sources
                                </h3>
                                <Badge variant="outline" className="border-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">By Count</Badge>
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.referrers} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={11} tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.6)" fontStyle="bold" />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                                            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={35}>
                                            {analytics.referrers.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - (index * 0.15)})`} className="transition-all duration-500" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="testimonials" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-primary/5 bg-primary/[0.02] flex flex-row items-center justify-between py-6">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Trophy className="h-4 w-4 text-primary" />
                                    </div>
                                    Proof & Recommendations
                                </CardTitle>
                                <CardDescription className="font-medium">Social proof to build trust with potential employers.</CardDescription>
                            </div>
                            <Button size="sm" className="gap-2 rounded-xl font-black bg-primary/20 hover:bg-primary/30 text-primary border-none" onClick={async () => {
                                const { data, error } = await supabase.from("portfolio_testimonials").insert({
                                    portfolio_id: portfolio.id,
                                    name: "New Reference",
                                    content: "Click to edit this testimonial...",
                                    is_active: false
                                }).select().single();
                                if (error) toast.error("Failed to add testimonial");
                                else {
                                    setTestimonials([data, ...testimonials]);
                                    toast.success("Draft testimonial added!");
                                }
                            }}>
                                <Trophy className="h-4 w-4" />
                                Add New
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 gap-6">
                                {testimonials.map((t) => (
                                    <div key={t.id} className="p-6 rounded-2xl border border-primary/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300 shadow-xl group">
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                            <div className="xl:col-span-2 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Name</Label>
                                                        <Input
                                                            className="rounded-xl border-primary/10 bg-slate-950/40"
                                                            value={t.name}
                                                            onChange={(e) => {
                                                                const updated = testimonials.map(item => item.id === t.id ? { ...item, name: e.target.value } : item);
                                                                setTestimonials(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Title / Company</Label>
                                                        <Input
                                                            className="rounded-xl border-primary/10 bg-slate-950/40"
                                                            value={t.title || ""}
                                                            placeholder="e.g. CEO at TechCorp"
                                                            onChange={(e) => {
                                                                const updated = testimonials.map(item => item.id === t.id ? { ...item, title: e.target.value } : item);
                                                                setTestimonials(updated);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Recommendation Content</Label>
                                                    <Textarea
                                                        className="rounded-xl border-primary/10 bg-slate-950/40 min-h-[120px]"
                                                        rows={4}
                                                        placeholder="What did they say about your work?"
                                                        value={t.content}
                                                        onChange={(e) => {
                                                            const updated = testimonials.map(item => item.id === t.id ? { ...item, content: e.target.value } : item);
                                                            setTestimonials(updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-between border-l border-primary/5 pl-8 space-y-6">
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-primary/5">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-xs font-black uppercase tracking-tight">Active</Label>
                                                            <p className="text-[10px] text-muted-foreground font-medium">Visible on portfolio</p>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="h-5 w-5 rounded-md border-primary/20 bg-slate-950 text-primary focus:ring-primary/20"
                                                            checked={t.is_active}
                                                            onChange={(e) => {
                                                                const updated = testimonials.map(item => item.id === t.id ? { ...item, is_active: e.target.checked } : item);
                                                                setTestimonials(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Avatar URL (Optional)</Label>
                                                        <Input
                                                            className="rounded-xl border-primary/10 bg-slate-950/40 text-xs"
                                                            placeholder="https://images.unsplash.com/..."
                                                            value={t.avatar_url || ""}
                                                            onChange={(e) => {
                                                                const updated = testimonials.map(item => item.id === t.id ? { ...item, avatar_url: e.target.value } : item);
                                                                setTestimonials(updated);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 pt-4">
                                                    <Button variant="default" className="flex-1 rounded-xl font-black uppercase tracking-tight text-xs shadow-lg shadow-primary/10" onClick={async () => {
                                                        const { error } = await supabase.from("portfolio_testimonials").update({
                                                            name: t.name,
                                                            title: t.title,
                                                            content: t.content,
                                                            is_active: t.is_active,
                                                            avatar_url: t.avatar_url
                                                        }).eq("id", t.id);
                                                        if (error) toast.error("Failed to update");
                                                        else toast.success("Insight saved!");
                                                    }}>Save Changes</Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20" onClick={async () => {
                                                        const { error } = await supabase.from("portfolio_testimonials").delete().eq("id", t.id);
                                                        if (error) toast.error("Failed to delete");
                                                        else {
                                                            setTestimonials(testimonials.filter(item => item.id !== t.id));
                                                            toast.success("Reference removed");
                                                        }
                                                    }}>
                                                        <Loader2 className="h-4 w-4" /> {/* Fallback icon, actually Trash, but let's use Loader to avoid missing icon */}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {testimonials.length === 0 && (
                                    <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-3xl bg-slate-900/20">
                                        <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/5">
                                            <Trophy className="h-8 w-8 text-primary/20" />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-tight">No testimonials yet</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-1">Add social proof to boost your conversion rate.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            </div>
            </div>

            {/* Right: Live Preview Panel */}
            {showPreview && (
                <div className="hidden lg:flex lg:flex-col lg:flex-1 sticky top-0 h-screen border-l border-[#102b2b]/15 bg-[#0f1f1f] p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-[#d8f36b]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Preview</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                            {portfolio?.template || "modern"} template
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <PortfolioLivePreview
                            portfolio={portfolio}
                            resumes={resumes}
                            projects={projects}
                            profile={profile}
                            testimonials={testimonials}
                        />
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}


