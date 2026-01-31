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
    Mail
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PortfolioManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [resumes, setResumes] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
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
                    is_public: true
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
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
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
            </Tabs>
        </div>
    );
}
