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
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Career Portfolio</h1>
                    <p className="text-muted-foreground">Customize your public professional presence and showcase your best work.</p>
                </div>
                <div className="flex items-center gap-3">
                    {portfolio.slug && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Portfolio
                            </a>
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-7 lg:w-[950px]">
                    <TabsTrigger value="general" className="gap-2">
                        <Settings2 className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="social" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Social
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Visuals
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-2">
                        <Layout className="h-4 w-4" />
                        Gallery
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Messages
                        {messages.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {messages.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="testimonials" className="gap-2">
                        <Trophy className="h-4 w-4" />
                        Social Proof
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>This information will be displayed at the top of your portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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

                <TabsContent value="social" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Social & Professional Links</CardTitle>
                            <CardDescription>Connect your professional profiles to help recruiters find you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4 text-blue-600" />
                                        LinkedIn URL
                                    </Label>
                                    <Input
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

                <TabsContent value="appearance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Branding & Visuals</CardTitle>
                            <CardDescription>Choose how your portfolio looks to the world.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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

                            <div className="space-y-4 pt-4 border-t">
                                <Label>Layout Style</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: "professional", label: "Professional", desc: "Clean and standard" },
                                        { id: "creative", label: "Creative", desc: "Bold and expressive" },
                                        { id: "minimal", label: "Minimalist", desc: "For the minimalist" },
                                    ].map((s) => (
                                        <div
                                            key={s.id}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${portfolio.theme_settings?.style === s.id
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-muted hover:border-muted-foreground/30"
                                                }`}
                                            onClick={() => setPortfolio({
                                                ...portfolio,
                                                theme_settings: { ...portfolio.theme_settings, style: s.id }
                                            })}
                                        >
                                            <p className="font-bold mb-1">{s.label}</p>
                                            <p className="text-xs text-muted-foreground">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <Label className="text-base">Portfolio Template</Label>
                                    <p className="text-sm text-muted-foreground mt-1">Choose the layout and design for your public portfolio</p>
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
                                                className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                                                    : "border-muted hover:border-primary/50"
                                                    }`}
                                                onClick={() => setPortfolio({
                                                    ...portfolio,
                                                    template: template.id
                                                })}
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                                                            <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                                        </div>
                                                        {isSelected && (
                                                            <Badge variant="default" className="text-xs">Active</Badge>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold mb-1">{template.label}</p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{template.desc}</p>
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

                <TabsContent value="content" className="mt-6 space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Featured Resumes</h3>
                                <p className="text-sm text-muted-foreground">Select resumes to showcase.</p>
                            </div>
                            <Badge variant="outline">{portfolio.featured_resumes?.length || 0} selected</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resumes.map((r) => {
                                const isFeatured = portfolio.featured_resumes?.includes(r.id);
                                return (
                                    <div
                                        key={r.id}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-32 ${isFeatured ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:bg-muted/30"
                                            }`}
                                        onClick={() => {
                                            const current = portfolio.featured_resumes || [];
                                            const updated = isFeatured
                                                ? current.filter((id: string) => id !== r.id)
                                                : [...current, r.id];
                                            setPortfolio({ ...portfolio, featured_resumes: updated });
                                        }}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="font-semibold truncate">{r.title}</p>
                                            <p className="text-[10px] text-muted-foreground">Updated {format(new Date(r.updated_at), 'MMM d, yyyy')}</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <Badge variant={isFeatured ? "default" : "outline"}>
                                                {isFeatured ? "Featured" : "Add to Gallery"}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Featured Projects</h3>
                                <p className="text-sm text-muted-foreground">Showcase your best engineering work.</p>
                            </div>
                            <Badge variant="outline">{portfolio.featured_projects?.length || 0} selected</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((p) => {
                                const isFeatured = portfolio.featured_projects?.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-40 ${isFeatured ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:bg-muted/30"
                                            }`}
                                        onClick={() => {
                                            const current = portfolio.featured_projects || [];
                                            const updated = isFeatured
                                                ? current.filter((id: string) => id !== p.id)
                                                : [...current, p.id];
                                            setPortfolio({ ...portfolio, featured_projects: updated });
                                        }}
                                    >
                                        <div className="overflow-hidden space-y-1">
                                            <p className="font-semibold truncate">{p.name}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <Badge variant={isFeatured ? "default" : "outline"}>
                                                {isFeatured ? "Featured" : "Add to Gallery"}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                            {projects.length === 0 && (
                                <div className="col-span-full py-10 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                                    <p>No projects found. Add projects to your resumes to see them here.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="messages" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inbound Messages</CardTitle>
                            <CardDescription>Messages received through your public portfolio contact form.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow space-y-3">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {msg.sender_name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{msg.sender_name}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {msg.sender_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(msg.created_at), 'MMM d, yyyy HH:mm')}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t mt-2">
                                            {msg.subject && <p className="text-sm font-semibold mb-1">Sub: {msg.subject}</p>}
                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                {msg.message}
                                            </p>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                                                <a href={`mailto:${msg.sender_email}?subject=RE: ${msg.subject || 'Portfolio Inquiry'}`}>
                                                    Reply via Email
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {messages.length === 0 && (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold">No messages yet</h4>
                                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                When visitors contact you through your portfolio, their messages will appear here.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="insights" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.totalVisits}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    Cumulative visits
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.uniqueVisitors}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Users className="h-3 w-3" />
                                    Estimated reach
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Inquiries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{messages.length}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <MessageSquare className="h-3 w-3 text-primary" />
                                    Contact requests
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {analytics.totalVisits > 0
                                        ? ((messages.length / analytics.totalVisits) * 100).toFixed(1)
                                        : "0.0"}%
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="h-3 w-3 text-primary" />
                                    Visits to inquiries
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-6">Traffic Trends (Last 7 Days)</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.dailyStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="visits"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-6">Top Referral Sources</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.referrers} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                                            {analytics.referrers.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - (index * 0.15)})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="testimonials" className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Recommendations & Social Proof</h2>
                            <p className="text-sm text-muted-foreground">Manage testimonials from colleagues and clients.</p>
                        </div>
                        <Button className="gap-2" onClick={async () => {
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
                            <TrendingUp className="h-4 w-4 rotate-45" />
                            Add Testimonial
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {testimonials.map((t) => (
                            <Card key={t.id} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input
                                                    value={t.name}
                                                    onChange={(e) => {
                                                        const updated = testimonials.map(item => item.id === t.id ? { ...item, name: e.target.value } : item);
                                                        setTestimonials(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Title/Company</Label>
                                                <Input
                                                    value={t.title || ""}
                                                    onChange={(e) => {
                                                        const updated = testimonials.map(item => item.id === t.id ? { ...item, title: e.target.value } : item);
                                                        setTestimonials(updated);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Content</Label>
                                            <Textarea
                                                rows={3}
                                                value={t.content}
                                                onChange={(e) => {
                                                    const updated = testimonials.map(item => item.id === t.id ? { ...item, content: e.target.value } : item);
                                                    setTestimonials(updated);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between border-l pl-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Active Status</Label>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={t.is_active}
                                                    onChange={(e) => {
                                                        const updated = testimonials.map(item => item.id === t.id ? { ...item, is_active: e.target.checked } : item);
                                                        setTestimonials(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Avatar URL (Optional)</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={t.avatar_url || ""}
                                                    onChange={(e) => {
                                                        const updated = testimonials.map(item => item.id === t.id ? { ...item, avatar_url: e.target.value } : item);
                                                        setTestimonials(updated);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={async () => {
                                                const { error } = await supabase.from("portfolio_testimonials").update(t).eq("id", t.id);
                                                if (error) toast.error("Failed to update");
                                                else toast.success("Updated!");
                                            }}>Save</Button>
                                            <Button variant="destructive" size="sm" onClick={async () => {
                                                const { error } = await supabase.from("portfolio_testimonials").delete().eq("id", t.id);
                                                if (error) toast.error("Failed to delete");
                                                else {
                                                    setTestimonials(testimonials.filter(item => item.id !== t.id));
                                                    toast.success("Deleted");
                                                }
                                            }}>Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
