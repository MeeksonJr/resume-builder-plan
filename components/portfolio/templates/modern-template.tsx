"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import Link from "next/link"

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
    const displayName = portfolio?.full_name || profile?.full_name || "Professional"
    const bio = portfolio?.bio || "Building amazing digital experiences."

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b glass-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                <div className="container relative max-w-5xl mx-auto px-6 py-20">
                    <div className="space-y-6">
                        {/* Name and Title */}
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tight gradient-text">
                                {displayName}
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                                {portfolio?.tagline || "Full-Stack Developer"}
                            </p>
                        </div>

                        {/* Bio */}
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            {bio}
                        </p>

                        {/* Location and Status */}
                        <div className="flex flex-wrap items-center gap-4">
                            {portfolio?.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">{portfolio.location}</span>
                                </div>
                            )}
                            {portfolio?.open_to_work && (
                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                    Open to Work
                                </Badge>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="flex flex-wrap gap-3">
                            {portfolio?.github_url && (
                                <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                                    <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer">
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </a>
                                </Button>
                            )}
                            {portfolio?.linkedin_url && (
                                <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                                    <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </a>
                                </Button>
                            )}
                            {portfolio?.twitter_url && (
                                <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                                    <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer">
                                        <Twitter className="h-4 w-4" />
                                        Twitter
                                    </a>
                                </Button>
                            )}
                            {portfolio?.website_url && (
                                <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                                    <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                        Website
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            {portfolio?.skills && portfolio.skills.length > 0 && (
                <section className="container max-w-5xl mx-auto px-6 py-12">
                    <h2 className="text-2xl font-heading font-black mb-6 flex items-center gap-2">
                        <Code className="h-6 w-6 text-primary" />
                        Skills & Technologies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {portfolio.skills.map((skill: string, i: number) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="px-3 py-1.5 text-sm font-medium bg-primary/10 hover:bg-primary/20 border border-primary/20"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects Section */}
            {projects && projects.length > 0 && (
                <section className="container max-w-5xl mx-auto px-6 py-12">
                    <h2 className="text-2xl font-heading font-black mb-6 flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-primary" />
                        Featured Projects
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {projects.map((project) => (
                            <Card key={project.id} className="glass-card group hover:shadow-xl transition-all overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-heading font-black group-hover:text-primary transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {project.description}
                                        </p>
                                    </div>

                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.technologies.map((tech: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {project.url && (
                                        <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl" asChild>
                                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                View Project
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Experience Section */}
            {resumes && resumes.length > 0 && resumes[0]?.work_experiences && (
                <section className="container max-w-5xl mx-auto px-6 py-12">
                    <h2 className="text-2xl font-heading font-black mb-6 flex items-center gap-2">
                        <Award className="h-6 w-6 text-primary" />
                        Work Experience
                    </h2>
                    <div className="space-y-6">
                        {resumes[0].work_experiences.slice(0, 3).map((exp: any) => (
                            <Card key={exp.id} className="glass-card p-6">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-lg font-heading font-black">{exp.job_title}</h3>
                                        <p className="text-sm font-medium text-primary">{exp.company}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {exp.start_date} - {exp.end_date || "Present"}
                                        </p>
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Testimonials */}
            {testimonials && testimonials.length > 0 && (
                <section className="container max-w-5xl mx-auto px-6 py-12">
                    <h2 className="text-2xl font-heading font-black mb-6 flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        Testimonials
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {testimonials.map((testimonial) => (
                            <Card key={testimonial.id} className="glass-card p-6">
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                                        "{testimonial.content}"
                                    </p>
                                    <div>
                                        <p className="font-bold text-sm">{testimonial.author_name}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.author_title}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact CTA */}
            <section className="container max-w-5xl mx-auto px-6 py-12">
                <Card className="glass-card p-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-heading font-black">Let's Work Together</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Interested in collaborating? Reach out and let's create something amazing.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {portfolio?.email && (
                                <Button className="rounded-xl gap-2 bg-gradient-to-br from-primary to-primary/80" asChild>
                                    <a href={`mailto:${portfolio.email}`}>
                                        <Mail className="h-4 w-4" />
                                        Get in Touch
                                    </a>
                                </Button>
                            )}
                            {resumes && resumes.length > 0 && (
                                <Button variant="outline" className="rounded-xl gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Download Resume
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    )
}
