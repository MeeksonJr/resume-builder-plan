"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
    Settings2,
    Palette,
    MessageSquare,
    User,
    Calendar,
    Mail,
    Trophy,
    Sparkles,
    Briefcase
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

export default function PortfolioManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
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
    const supabase = createClient();

    const fetchPortfolio = async () => {
        setIsLoading(true);
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
                    template: "modern"
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight uppercase">Career Portfolio</h1>
                    <p className="text-muted-foreground font-medium">Customize your public professional presence and showcase your best work.</p>
                </div>
                <div className="flex items-center gap-4">
                    {portfolio.slug && (
                        <Button variant="outline" size="lg" className="rounded-2xl border-primary/20 hover:bg-primary/5 font-bold h-12" asChild>
                            <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-5 w-5" />
                                Preview
                            </a>
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2 rounded-2xl h-12 font-black px-8 shadow-xl shadow-primary/20">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="flex w-full overflow-x-auto h-14 bg-slate-950/40 p-1.5 rounded-2xl border border-primary/5 backdrop-blur-md mb-8 scrollbar-hide">
                    <TabsTrigger value="general" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <Settings2 className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="social" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <Globe className="h-4 w-4" />
                        Social
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <Palette className="h-4 w-4" />
                        Visuals
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <Layout className="h-4 w-4" />
                        Gallery
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <MessageSquare className="h-4 w-4" />
                        Messages
                        {messages.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-primary text-white border-none font-black">
                                {messages.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="testimonials" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <Trophy className="h-4 w-4" />
                        Proof
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="gap-2 rounded-xl transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold px-6 shrink-0 h-full">
                        <BarChart3 className="h-4 w-4" />
                        Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl group overflow-hidden">
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
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={5}
                                    placeholder="Write a brief introduction about yourself and your career goals..."
                                    value={portfolio.bio}
                                    onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
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
                    <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden">
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

                <TabsContent value="appearance" className="mt-0 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden">
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
                            <div className="space-y-4">
                                <Label>Color Theme</Label>
                                <div className="flex flex-wrap gap-3">
                                    {["primary", "blue", "purple", "emerald", "rose", "slate"].map((c) => (
                                        <Button
                                            key={c}
                                            variant={portfolio.theme_settings?.color === c ? "default" : "outline"}
                                            className="h-10 w-24 capitalize"
                                            onClick={() => setPortfolio({
                                                ...portfolio,
                                                theme_settings: { ...portfolio.theme_settings, color: c }
                                            })}
                                        >
                                            <div className={cn("h-3 w-3 rounded-full mr-2",
                                                c === "primary" ? "bg-primary" : `bg-${c}-500`
                                            )} />
                                            {c}
                                        </Button>
                                    ))}
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
                                                "p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300",
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
                                        { id: "modern", label: "Modern", desc: "Bold gradients and contemporary design", icon: Sparkles },
                                        { id: "minimal", label: "Minimalist", desc: "Clean, simple, and focused", icon: Layout },
                                        { id: "corporate", label: "Corporate", desc: "Professional and traditional", icon: Briefcase },
                                        { id: "creative", label: "Creative", desc: "Unique and expressive design", icon: Palette },
                                    ].map((template) => {
                                        const Icon = template.icon;
                                        const isSelected = (portfolio.template || "modern") === template.id;
                                        return (
                                            <div
                                                key={template.id}
                                                className={cn(
                                                    "p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl group",
                                                    isSelected
                                                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)] ring-1 ring-primary/30"
                                                        : "border-primary/5 bg-slate-900/40 hover:border-primary/40"
                                                )}
                                                onClick={() => setPortfolio({
                                                    ...portfolio,
                                                    template: template.id
                                                })}
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className={cn(
                                                            "p-2.5 rounded-xl transition-colors",
                                                            isSelected ? "bg-primary/20 text-primary" : "bg-slate-800 text-muted-foreground group-hover:bg-slate-700"
                                                        )}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        {isSelected && (
                                                            <Badge variant="default" className="text-[10px] font-black uppercase tracking-widest bg-primary text-white border-none">Active</Badge>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black uppercase tracking-tight text-sm mb-1">{template.label}</p>
                                                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{template.desc}</p>
                                                    </div>
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
                    <Card className="bg-slate-950/40 border-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden">
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
                                                    "p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between h-36 group",
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
                                                    "p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between h-44 group",
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
                                        <div className="col-span-full py-20 text-center border-2 border-dashed border-primary/10 rounded-2xl bg-slate-900/20 text-muted-foreground">
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
                                            contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', borderShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '12px' }}
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
    );
}
