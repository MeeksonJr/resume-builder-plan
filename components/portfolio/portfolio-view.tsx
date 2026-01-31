"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Github,
    Linkedin,
    Twitter,
    Globe,
    Mail,
    FileText,
    ExternalLink,
    Briefcase,
    GraduationCap,
    Trophy,
    User,
    ChevronRight,
    MapPin,
    Send,
    CheckCircle,
    Loader2,
    Eye
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PortfolioViewProps {
    portfolio: any;
    resumes: any[];
    projects: any[];
    profile: any;
}

export function PortfolioView({ portfolio, resumes, projects, profile }: PortfolioViewProps) {
    const theme = portfolio.theme_settings || {};

    // Theme mapping
    const themeColors: Record<string, string> = {
        primary: "text-primary",
        blue: "text-blue-500",
        purple: "text-purple-500",
        emerald: "text-emerald-500",
        rose: "text-rose-500",
        slate: "text-slate-500",
    };

    const accentColor = themeColors[theme.color] || "text-primary";
    const bgAccent = accentColor.replace("text-", "bg-") + "/10";
    const borderAccent = accentColor.replace("text-", "border-") + "/20";

    const featuredResumes = resumes.filter(r => portfolio.featured_resumes?.includes(r.id));
    const featuredProjects = projects.filter(p => portfolio.featured_projects?.includes(p.id));

    return (
        <div className={cn(
            "min-h-screen bg-background text-foreground pb-20",
            theme.typography === "serif" ? "font-serif" : "font-sans"
        )}>
            {/* Header Section */}
            <div className="relative h-64 md:h-80 bg-muted/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />
                <div className="container max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                                {portfolio?.full_name || profile?.full_name || "Professional Portfolio"}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
                                {(portfolio?.location || profile?.location) && (
                                    <div className="flex items-center gap-1.5 text-sm md:text-base">
                                        <MapPin className="h-4 w-4" />
                                        {portfolio?.location || profile.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-sm md:text-base">
                                    <Mail className="h-4 w-4" />
                                    {profile?.email}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex gap-3">
                                {portfolio.social_links?.linkedin && (
                                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12" asChild>
                                        <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                    </Button>
                                )}
                                {portfolio.social_links?.github && (
                                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12" asChild>
                                        <a href={portfolio.social_links.github} target="_blank" rel="noopener noreferrer">
                                            <Github className="h-5 w-5" />
                                        </a>
                                    </Button>
                                )}
                                {portfolio.social_links?.website && (
                                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12" asChild>
                                        <a href={portfolio.social_links.website} target="_blank" rel="noopener noreferrer">
                                            <Globe className="h-5 w-5" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                            <Button
                                size="lg"
                                className={cn("rounded-full px-8 font-bold", theme.style === 'creative' ? "bg-primary hover:bg-primary/90" : "")}
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Briefcase className="mr-2 h-4 w-4" />
                                Hire Me
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-6 pt-12 space-y-20">
                {/* About Me */}
                {portfolio.bio && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", bgAccent)}>
                                <User className={cn("h-6 w-6", accentColor)} />
                            </div>
                            <h2 className="text-2xl font-bold">About Me</h2>
                        </div>
                        <p className={cn(
                            "text-lg text-muted-foreground leading-relaxed",
                            theme.style === 'minimal' ? "max-w-2xl" : "max-w-3xl"
                        )}>
                            {portfolio.bio}
                        </p>
                    </section>
                )}

                {/* Content Grid - Handles different styles */}
                <div className={cn(
                    "grid gap-20",
                    theme.style === 'creative' ? "lg:grid-cols-[1fr,300px]" : "grid-cols-1"
                )}>
                    <div className="space-y-20">
                        {/* Featured Resumes */}
                        {featuredResumes.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", bgAccent)}>
                                            <FileText className={cn("h-6 w-6", accentColor)} />
                                        </div>
                                        <h2 className="text-2xl font-bold">Resumes</h2>
                                    </div>
                                </div>
                                <div className={cn(
                                    "grid gap-6",
                                    theme.style === 'minimal' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                                )}>
                                    {featuredResumes.map((resume) => (
                                        <Card key={resume.id} className={cn(
                                            "group transition-all border-2",
                                            theme.style === 'minimal' ? "border-none shadow-none bg-transparent px-0" : "hover:border-primary/50"
                                        )}>
                                            <CardHeader className={cn(theme.style === 'minimal' ? "px-0" : "")}>
                                                <CardTitle className="flex items-center justify-between">
                                                    {resume.title}
                                                    <Badge variant="secondary">Public</Badge>
                                                </CardTitle>
                                                <CardDescription>
                                                    Last updated {new Date(resume.updated_at).toLocaleDateString()}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className={cn(theme.style === 'minimal' ? "px-0 pb-0" : "")}>
                                                <Button className={cn("gap-2", theme.style === 'minimal' ? "h-auto p-0 text-primary hover:bg-transparent" : "w-full")} variant={theme.style === 'minimal' ? "link" : "outline"} asChild>
                                                    <Link href={`/r/${resume.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        View Full Resume
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects Section */}
                        {featuredProjects.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", bgAccent)}>
                                        <Briefcase className={cn("h-6 w-6", accentColor)} />
                                    </div>
                                    <h2 className="text-2xl font-bold">Selected Projects</h2>
                                </div>
                                <div className={cn(
                                    "grid gap-6",
                                    theme.style === 'minimal' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                                )}>
                                    {featuredProjects.map((project) => (
                                        <Card key={project.id} className={cn(
                                            "flex flex-col h-full transition-colors",
                                            theme.style === 'minimal' ? "border-none shadow-none bg-transparent px-0" : "bg-card/50 hover:bg-card"
                                        )}>
                                            <CardHeader className={cn(theme.style === 'minimal' ? "px-0" : "")}>
                                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className={cn("flex-1", theme.style === 'minimal' ? "px-0" : "")}>
                                                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            </CardContent>
                                            <div className={cn("p-6 pt-0 mt-auto", theme.style === 'minimal' ? "px-0" : "")}>
                                                {project.url && (
                                                    <Button variant="link" className="px-0 h-auto text-primary gap-1 group/btn" asChild>
                                                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                            View Details
                                                            <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar for Creative Style */}
                    {theme.style === 'creative' && (
                        <aside className="space-y-10">
                            <div className="sticky top-24 space-y-10">
                                <div className="p-6 rounded-3xl bg-primary text-primary-foreground space-y-4">
                                    <h4 className="text-xl font-bold">Let's Connect!</h4>
                                    <p className="text-sm opacity-90 leading-relaxed">
                                        Looking for your next star developer or collaborator?
                                    </p>
                                    <Button
                                        variant="secondary"
                                        className="w-full rounded-full"
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Send Message
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Socials</p>
                                    <div className="flex flex-col gap-2">
                                        {portfolio.social_links?.linkedin && (
                                            <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                                                <Linkedin className="h-5 w-5 text-blue-500" />
                                                <span className="text-sm font-medium">LinkedIn</span>
                                            </a>
                                        )}
                                        {portfolio.social_links?.github && (
                                            <a href={portfolio.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                                                <Github className="h-5 w-5" />
                                                <span className="text-sm font-medium">GitHub</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Contact Section */}
                <section id="contact" className="space-y-10 py-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">Get In Touch</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Have a job opportunity or just want to say hi? Feel free to send me a message.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8">
                            <div className="flex gap-4 p-6 rounded-2xl bg-muted/30 border border-border/50">
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", bgAccent)}>
                                    <Mail className={cn("h-6 w-6", accentColor)} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Email</h4>
                                    <p className="text-muted-foreground">{profile?.email}</p>
                                </div>
                            </div>

                            {portfolio.social_links?.linkedin && (
                                <div className="flex gap-4 p-6 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Linkedin className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">LinkedIn</h4>
                                        <p className="text-muted-foreground">Connect with me professionally</p>
                                        <Button variant="link" className="p-0 h-auto text-blue-500 mt-1" asChild>
                                            <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer">View Profile</a>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="p-8 rounded-3xl bg-primary text-primary-foreground space-y-4">
                                <h4 className="text-xl font-bold">Open for Opportunities</h4>
                                <p className="text-sm opacity-90 leading-relaxed">
                                    I am currently looking for new challenges in software development.
                                    If you think I'd be a good fit for your team, don't hesitate to reach out!
                                </p>
                            </div>
                        </div>

                        <ContactForm portfolioId={portfolio.id} />
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="mt-20 border-t py-10 text-center">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} {profile?.full_name}. Powered by <span className="font-bold text-foreground">ResumeForge</span>.
                </p>
            </footer>
        </div>
    );
}

function ContactForm({ portfolioId }: { portfolioId: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.from("portfolio_messages").insert({
                portfolio_id: portfolioId,
                sender_name: form.name,
                sender_email: form.email,
                subject: form.subject,
                message: form.message
            });

            if (error) throw error;
            setIsSent(true);
            setForm({ name: "", email: "", subject: "", message: "" });
            toast.success("Message sent successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSent) {
        return (
            <div className="bg-muted/30 p-10 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">Thank You!</h3>
                <p className="text-muted-foreground">Your message has been sent. I'll get back to you soon.</p>
                <Button variant="outline" onClick={() => setIsSent(false)}>Send another message</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-8 md:p-10 rounded-3xl border border-border/50 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-background"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="bg-background"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                    id="subject"
                    placeholder="Project Inquiry"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="bg-background"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                    id="message"
                    rows={5}
                    placeholder="Tell me about your project..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="bg-background"
                    required
                />
            </div>
            <Button type="submit" className="w-full h-14 text-lg gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Send className="h-5 w-5" />
                )}
                Send Message
            </Button>
        </form>
    );
}
