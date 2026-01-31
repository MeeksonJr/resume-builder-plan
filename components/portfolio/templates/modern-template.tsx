"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Github,
    Linkedin,
    Twitter,
    Mail,
    ExternalLink,
    MapPin,
    Briefcase,
    Award,
    Code,
    MessageSquare,
    Download,
    Star,
    Calendar,
    FileText,
    Sparkles,
    Quote,
    Phone,
    Globe,
    GraduationCap,
    Target,
    Zap,
    TrendingUp,
    Send,
    CheckCircle,
    Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ModernTemplateProps {
    portfolio: any
    resumes: any[]
    projects: any[]
    profile: any
    testimonials: any[]
}

export function ModernTemplate({
    portfolio,
    resumes,
    projects,
    profile,
    testimonials,
}: ModernTemplateProps) {
    const [selectedResume, setSelectedResume] = React.useState<any>(null)
    const displayName = portfolio?.full_name || profile?.full_name || "Professional"
    const bio = portfolio?.bio || "Building amazing digital experiences."
    const skills = portfolio?.skills || []

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background relative">
            {/* Floating orbs background effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Enhanced Hero Section */}
            <section className="relative overflow-hidden border-b glass-border">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />

                <div className="container relative max-w-6xl mx-auto px-6 py-24 md:py-32">
                    <div className="space-y-8">
                        {/* Status Badge */}
                        {portfolio?.open_to_work && (
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm shadow-lg">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                                <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Available for New Opportunities
                                </span>
                            </div>
                        )}

                        {/* Name and Title */}
                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tight gradient-text animate-in fade-in slide-in-from-bottom-4 duration-700 leading-tight">
                                {displayName}
                            </h1>
                            {portfolio?.tagline && (
                                <p className="text-2xl md:text-4xl text-muted-foreground font-semibold animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 leading-snug">
                                    {portfolio.tagline}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <p className="text-xl text-muted-foreground/90 max-w-3xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            {bio}
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            {portfolio?.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="text-base font-medium">{portfolio.location}</span>
                                </div>
                            )}
                            {portfolio?.view_count > 0 && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <span className="text-base font-medium">{portfolio.view_count.toLocaleString()} views</span>
                                </div>
                            )}
                            {projects.length > 0 && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    <span className="text-base font-medium">{projects.length} projects</span>
                                </div>
                            )}
                        </div>

                        {/* Social Links & CTA */}
                        <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                            {portfolio?.email && (
                                <Button size="lg" className="rounded-2xl gap-2 bg-gradient-to-r from-primary via-primary to-primary/80 hover:shadow-2xl hover:shadow-primary/20 transition-all h-14 px-8 font-black text-base group" asChild>
                                    <a href={`mailto:${portfolio.email}`}>
                                        <Mail className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                        Get in Touch
                                    </a>
                                </Button>
                            )}

                            {portfolio?.social_links?.linkedin && (
                                <Button variant="outline" size="lg" className="rounded-2xl gap-2 h-14 px-6 font-bold hover:bg-primary/10 hover:border-primary/50 transition-all group" asChild>
                                    <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        LinkedIn
                                    </a>
                                </Button>
                            )}
                            {portfolio?.social_links?.github && (
                                <Button variant="outline" size="lg" className="rounded-2xl gap-2 h-14 px-6 font-bold hover:bg-primary/10 hover:border-primary/50 transition-all group" asChild>
                                    <a href={portfolio.social_links.github} target="_blank" rel="noopener noreferrer">
                                        <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        GitHub
                                    </a>
                                </Button>
                            )}
                            {portfolio?.social_links?.twitter && (
                                <Button variant="outline" size="lg" className="rounded-2xl gap-2 h-14 px-6 font-bold hover:bg-primary/10 hover:border-primary/50 transition-all group" asChild>
                                    <a href={portfolio.social_links.twitter} target="_blank" rel="noopener noreferrer">
                                        <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Twitter
                                    </a>
                                </Button>
                            )}
                            {portfolio?.social_links?.website && (
                                <Button variant="outline" size="lg" className="rounded-2xl gap-2 h-14 px-6 font-bold hover:bg-primary/10 hover:border-primary/50 transition-all group" asChild>
                                    <a href={portfolio.social_links.website} target="_blank" rel="noopener noreferrer">
                                        <Globe className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Website
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent" />
            </section>

            <div className="relative z-10">
                {/* Skills Section */}
                {skills.length > 0 && (
                    <section className="container max-w-6xl mx-auto px-6 py-20">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 shadow-lg">
                                    <Code className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-heading font-black">Skills & Expertise</h2>
                                    <p className="text-muted-foreground text-lg">Technologies I work with</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill: string, i: number) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="px-5 py-2.5 text-base font-bold bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 rounded-2xl transition-all hover:scale-110 hover:shadow-lg cursor-default"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Resumes Section */}
                {resumes && resumes.length > 0 && (
                    <section className="container max-w-6xl mx-auto px-6 py-20 border-t glass-border">
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 p-4 shadow-lg">
                                        <FileText className="h-7 w-7 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-heading font-black">Featured Resumes</h2>
                                        <p className="text-muted-foreground text-lg">Professional experience documents</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-base px-4 py-2 font-bold">
                                    {resumes.length} {resumes.length === 1 ? "Resume" : "Resumes"}
                                </Badge>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {resumes.slice(0, 6).map((resume: any) => (
                                    <Card
                                        key={resume.id}
                                        className="glass-card group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative"
                                        onClick={() => setSelectedResume(resume)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="p-7 space-y-5 relative">
                                            <div className="flex items-start justify-between">
                                                <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 p-4">
                                                    <FileText className="h-7 w-7 text-purple-600" />
                                                </div>
                                                <Sparkles className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-heading font-black group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                    {resume.title || "My Resume"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Updated {new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <Button variant="outline" className="w-full rounded-xl gap-2 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all" size="lg">
                                                <ExternalLink className="h-4 w-4" />
                                                View Full Resume
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {projects && projects.length > 0 && (
                    <section className="container max-w-6xl mx-auto px-6 py-20 border-t glass-border">
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 p-4 shadow-lg">
                                        <Briefcase className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-heading font-black">Featured Projects</h2>
                                        <p className="text-muted-foreground text-lg">Showcasing my best work</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                {projects.map((project: any, index: number) => (
                                    <Card
                                        key={project.id}
                                        className="glass-card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="p-8 space-y-6 relative">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="text-2xl font-heading font-black group-hover:text-primary transition-colors leading-tight">
                                                        {project.title || project.name}
                                                    </h3>
                                                    <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                                                        <Zap className="h-5 w-5 text-primary" />
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed text-base">
                                                    {project.description}
                                                </p>
                                            </div>

                                            {project.technologies && project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {project.technologies.map((tech: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="text-xs font-semibold px-3 py-1 rounded-lg">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {project.url && (
                                                <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 font-bold h-12 group-hover:shadow-lg transition-all" size="lg" asChild>
                                                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                        View Project
                                                        <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Experience Section */}
                {resumes && resumes.length > 0 && resumes[0]?.work_experiences && resumes[0].work_experiences.length > 0 && (
                    <section className="container max-w-6xl mx-auto px-6 py-20 border-t glass-border">
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 p-4 shadow-lg">
                                    <Award className="h-7 w-7 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-heading font-black">Work Experience</h2>
                                    <p className="text-muted-foreground text-lg">Professional journey</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {resumes[0].work_experiences.slice(0, 5).map((exp: any, index: number) => (
                                    <Card key={exp.id} className="glass-card p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex gap-8 relative">
                                            <div className="flex flex-col items-center">
                                                <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-4 border-2 border-primary/20 shadow-lg">
                                                    <Briefcase className="h-6 w-6 text-primary" />
                                                </div>
                                                {index < resumes[0].work_experiences.length - 1 && (
                                                    <div className="flex-1 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent mt-6 min-h-[60px]" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-4 pb-2">
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-heading font-black group-hover:text-primary transition-colors">{exp.job_title}</h3>
                                                    <p className="text-lg font-bold text-primary">{exp.company}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {exp.start_date} - {exp.end_date || "Present"}
                                                    </p>
                                                </div>
                                                {exp.description && (
                                                    <p className="text-base text-muted-foreground leading-relaxed">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Testimonials */}
                {testimonials && testimonials.length > 0 && (
                    <section className="container max-w-6xl mx-auto px-6 py-20 border-t glass-border">
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/10 p-4 shadow-lg">
                                    <MessageSquare className="h-7 w-7 text-pink-600" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-heading font-black">What People Say</h2>
                                    <p className="text-muted-foreground text-lg">Testimonials from colleagues and clients</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                {testimonials.map((testimonial: any) => (
                                    <Card key={testimonial.id} className="glass-card p-10 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                        <Quote className="absolute top-6 right-6 h-16 w-16 text-primary/10 group-hover:text-primary/20 group-hover:scale-110 transition-all" />
                                        <div className="space-y-6 relative">
                                            <div className="flex items-center gap-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <p className="text-lg text-foreground/90 italic leading-relaxed font-medium">
                                                "{testimonial.content}"
                                            </p>
                                            <div className="flex items-center gap-4 pt-6 border-t">
                                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-lg">
                                                    {testimonial.author_name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{testimonial.author_name}</p>
                                                    <p className="text-sm text-muted-foreground">{testimonial.author_title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Form Section */}
                <section className="container max-w-6xl mx-auto px-6 py-24 border-t glass-border">
                    <div className="grid gap-16 md:grid-cols-2">
                        {/* Left Side - Info */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-xl">
                                    <Sparkles className="h-10 w-10 text-primary" />
                                </div>
                                <h2 className="text-5xl font-heading font-black">Let's Work Together</h2>
                                <p className="text-muted-foreground text-xl leading-relaxed">
                                    Have an opportunity in mind? I'd love to hear from you. Send me a message and let's create something amazing together.
                                </p>
                            </div>

                            {/* Contact Info Cards */}
                            <div className="space-y-4">
                                {portfolio?.email && (
                                    <Card className="glass-card p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-xl bg-primary/10 p-3">
                                                <Mail className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-muted-foreground">Email</div>
                                                <a href={`mailto:${portfolio.email}`} className="text-base font-semibold hover:text-primary transition-colors">
                                                    {portfolio.email}
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {portfolio?.social_links?.linkedin && (
                                    <Card className="glass-card p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-xl bg-blue-500/10 p-3">
                                                <Linkedin className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-muted-foreground">LinkedIn</div>
                                                <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-base font-semibold hover:text-primary transition-colors">
                                                    Connect with me
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {portfolio?.booking_url && (
                                    <Card className="glass-card p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-xl bg-green-500/10 p-3">
                                                <Calendar className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-muted-foreground">Schedule a Call</div>
                                                <a href={portfolio.booking_url} target="_blank" rel="noopener noreferrer" className="text-base font-semibold hover:text-primary transition-colors">
                                                    Book a meeting
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* CTA Card */}
                            {portfolio?.open_to_work && (
                                <Card className="glass-card p-8 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
                                    <div className="relative space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                                            <span className="text-sm font-bold text-green-600">Available Now</span>
                                        </div>
                                        <h3 className="text-2xl font-heading font-black">Open for Opportunities</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            I'm currently looking for new challenges. If you think I'd be a good fit for your team, let's talk!
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Right Side - Contact Form */}
                        <ContactForm portfolioId={portfolio.id} />
                    </div>
                </section>
            </div>

            {/* Full Resume Preview Modal */}
            <Dialog open={!!selectedResume} onOpenChange={(open) => !open && setSelectedResume(null)}>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
                    {selectedResume && (
                        <div className="flex flex-col h-full">
                            {/* Modal Header */}
                            <DialogHeader className="px-8 pt-8 pb-6 border-b bg-gradient-to-br from-primary/5 to-transparent">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <DialogTitle className="text-3xl font-heading font-black">
                                            {selectedResume.title || "Resume"}
                                        </DialogTitle>
                                        <DialogDescription className="text-base">
                                            Last updated {new Date(selectedResume.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </DialogDescription>
                                    </div>
                                    <Button className="gap-2 rounded-xl font-bold h-11 px-6 bg-gradient-to-r from-primary to-primary/80">
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </Button>
                                </div>
                            </DialogHeader>

                            {/* Resume Content - Document Style */}
                            <div className="flex-1 overflow-y-auto px-8 py-6">
                                <div className="max-w-4xl mx-auto space-y-8 bg-white dark:bg-slate-950 shadow-2xl rounded-xl p-12 border">
                                    {/* Header */}
                                    <div className="text-center space-y-4 pb-6 border-b-2 border-primary/20">
                                        <h1 className="text-4xl font-heading font-black">
                                            {selectedResume.contact_info?.full_name || displayName}
                                        </h1>
                                        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                                            {selectedResume.contact_info?.email && (
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="h-4 w-4" />
                                                    {selectedResume.contact_info.email}
                                                </div>
                                            )}
                                            {selectedResume.contact_info?.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-4 w-4" />
                                                    {selectedResume.contact_info.phone}
                                                </div>
                                            )}
                                            {selectedResume.contact_info?.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {selectedResume.contact_info.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Professional Summary */}
                                    {selectedResume.professional_summary && (
                                        <div className="space-y-3">
                                            <h2 className="text-2xl font-heading font-black text-primary flex items-center gap-3">
                                                <Target className="h-6 w-6" />
                                                Professional Summary
                                            </h2>
                                            <p className="text-base text-foreground/90 leading-relaxed">
                                                {selectedResume.professional_summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {selectedResume.skills && selectedResume.skills.length > 0 && (
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-heading font-black text-primary flex items-center gap-3">
                                                <Code className="h-6 w-6" />
                                                Skills
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedResume.skills.map((skill: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-semibold bg-primary/10">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Work Experience */}
                                    {selectedResume.work_experiences && selectedResume.work_experiences.length > 0 && (
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-heading font-black text-primary flex items-center gap-3">
                                                <Briefcase className="h-6 w-6" />
                                                Work Experience
                                            </h2>
                                            <div className="space-y-6">
                                                {selectedResume.work_experiences.map((exp: any) => (
                                                    <div key={exp.id} className="space-y-2 pb-6 border-b last:border-b-0">
                                                        <h3 className="text-xl font-bold">{exp.job_title}</h3>
                                                        <p className="text-base font-semibold text-primary">{exp.company}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {exp.start_date} - {exp.end_date || "Present"}
                                                        </p>
                                                        {exp.description && (
                                                            <p className="text-sm text-foreground/80 leading-relaxed pt-2">
                                                                {exp.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {selectedResume.education && selectedResume.education.length > 0 && (
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-heading font-black text-primary flex items-center gap-3">
                                                <GraduationCap className="h-6 w-6" />
                                                Education
                                            </h2>
                                            <div className="space-y-4">
                                                {selectedResume.education.map((edu: any) => (
                                                    <div key={edu.id} className="space-y-1">
                                                        <h3 className="text-lg font-bold">{edu.degree}</h3>
                                                        <p className="text-base font-semibold text-primary">{edu.institution}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {edu.start_date} - {edu.end_date || "Present"}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects */}
                                    {selectedResume.projects && selectedResume.projects.length > 0 && (
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-heading font-black text-primary flex items-center gap-3">
                                                <Zap className="h-6 w-6" />
                                                Projects
                                            </h2>
                                            <div className="space-y-4">
                                                {selectedResume.projects.map((proj: any) => (
                                                    <div key={proj.id} className="space-y-2">
                                                        <h3 className="text-lg font-bold">{proj.name}</h3>
                                                        {proj.description && (
                                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                                {proj.description}
                                                            </p>
                                                        )}
                                                        {proj.technologies && proj.technologies.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                {proj.technologies.map((tech: string, i: number) => (
                                                                    <Badge key={i} variant="outline" className="text-xs">
                                                                        {tech}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Contact Form Component
function ContactForm({ portfolioId }: { portfolioId: string }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSent, setIsSent] = React.useState(false)
    const [form, setForm] = React.useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsSubmitting(true)
        const supabase = createClient()

        try {
            const { error } = await supabase.from("portfolio_messages").insert({
                portfolio_id: portfolioId,
                sender_name: form.name,
                sender_email: form.email,
                subject: form.subject,
                message: form.message
            })

            if (error) throw error
            setIsSent(true)
            setForm({ name: "", email: "", subject: "", message: "" })
            toast.success("Message sent successfully!")
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to send message. Please try again later.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSent) {
        return (
            <Card className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-heading font-black">Thank You!</h3>
                    <p className="text-muted-foreground text-lg">Your message has been sent. I'll get back to you soon.</p>
                </div>
                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setIsSent(false)}>
                    Send another message
                </Button>
            </Card>
        )
    }

    return (
        <Card className="glass-card p-10 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-semibold">Name *</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="h-12 rounded-xl bg-background"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="h-12 rounded-xl bg-background"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base font-semibold">Subject</Label>
                    <Input
                        id="subject"
                        placeholder="Project Inquiry"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="h-12 rounded-xl bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message" className="text-base font-semibold">Message *</Label>
                    <Textarea
                        id="message"
                        rows={6}
                        placeholder="Tell me about your project or opportunity..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="rounded-xl bg-background resize-none"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full h-14 text-lg gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 font-bold"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                    Send Message
                </Button>
            </form>
        </Card>
    )
}
