"use client"

import * as React from "react"
import { ContactForm } from "@/components/portfolio/contact-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { hexToHsl } from "@/lib/utils"
import {
    Github,
    Linkedin,
    Twitter,
    Mail,
    ExternalLink,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    TrendingUp,
    CheckCircle,
    Send,
    Loader2,
    FileText,
} from "lucide-react"

interface CorporateTemplateProps {
    portfolio: any
    resumes: any[]
    projects: any[]
    profile: any
    testimonials: any[]
    canvasCourses?: any[]
    accentColor?: string
    layoutStyle?: string
}

export function CorporateTemplate({
    portfolio,
    resumes,
    projects,
    profile,
    testimonials,
    canvasCourses = [],
    accentColor = "#3b82f6",
    layoutStyle = "professional",
}: CorporateTemplateProps) {
    const displayName = portfolio?.full_name || profile?.full_name || "Professional"
    const bio = portfolio?.bio || "Building amazing digital experiences."

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Professional Header */}
            <header
                className="text-white relative overflow-hidden"
                style={{ backgroundColor: accentColor }}
            >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
                <div className="container max-w-6xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold">{displayName}</h1>
                            {portfolio?.tagline && (
                                <p className="text-xl text-blue-100">{portfolio.tagline}</p>
                            )}
                            <p className="text-blue-50 leading-relaxed">{bio}</p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {portfolio?.social_links?.github && (
                                    <Button variant="secondary" size="sm" className="gap-2" asChild>
                                        <a href={portfolio.social_links.github} target="_blank" rel="noopener noreferrer">
                                            <Github className="h-4 w-4" />
                                            GitHub
                                        </a>
                                    </Button>
                                )}
                                {portfolio?.social_links?.linkedin && (
                                    <Button variant="secondary" size="sm" className="gap-2" asChild>
                                        <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="h-4 w-4" />
                                            LinkedIn
                                        </a>
                                    </Button>
                                )}
                                {portfolio?.social_links?.website && (
                                    <Button variant="secondary" size="sm" className="gap-2" asChild>
                                        <a href={portfolio.social_links.website} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Website
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
                                <div className="space-y-2 text-sm">
                                    {portfolio?.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span>{portfolio.email}</span>
                                        </div>
                                    )}
                                    {portfolio?.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{portfolio.location}</span>
                                        </div>
                                    )}
                                    {portfolio?.open_to_work && (
                                        <Badge className="bg-green-500 text-white hover:bg-green-600">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Open to Opportunities
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container max-w-6xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Professional Experience */}
                        {resumes && resumes.length > 0 && resumes[0]?.work_experiences && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div
                                    className="flex items-center gap-3 mb-6 pb-3 border-b-2"
                                    style={{ borderColor: accentColor }}
                                >
                                    <Briefcase className="h-6 w-6" style={{ color: accentColor }} />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                        Professional Experience
                                    </h2>
                                </div>
                                <div className="space-y-6">
                                    {resumes[0].work_experiences.map((exp: any) => (
                                        <Card key={exp.id} className="p-6 border-l-4" style={{ borderLeftColor: accentColor }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                                        {exp.job_title}
                                                    </h3>
                                                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        {exp.company}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {exp.start_date} - {exp.end_date || "Present"}
                                                    </p>
                                                </div>
                                                {exp.description && (
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Featured Resumes */}
                        {resumes && resumes.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2" style={{ borderColor: accentColor }}>
                                    <FileText className="h-6 w-6" style={{ color: accentColor }} />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                        Featured Resumes
                                    </h2>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {resumes.slice(0, 4).map((resume: any) => (
                                        <Card key={resume.id} className="p-6 border-l-4 hover:shadow-lg transition-all" style={{ borderLeftColor: accentColor }}>
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                                        {resume.title || "Resume"}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Last updated {new Date(resume.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                                                    <a href={`/dashboard/resume/${resume.id}/preview`} target="_blank" rel="noopener noreferrer">
                                                        View Resume
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Key Projects */}
                        {projects && projects.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-600">
                                    <Award className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                        Key Projects
                                    </h2>
                                </div>
                                <div className="space-y-6">
                                    {projects.map((project: any) => (
                                        <Card key={project.id} className="p-6">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                                        {project.name || project.title}
                                                    </h3>
                                                    {project.url && (
                                                        <Button variant="outline" size="sm" className="gap-1" asChild>
                                                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                                View
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    {project.description}
                                                </p>
                                                {project.technologies && project.technologies.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.technologies.map((tech: string, i: number) => (
                                                            <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                                {tech}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Testimonials */}
                        {testimonials && testimonials.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-600">
                                    <Award className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                        Recommendations
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {testimonials.map((testimonial: any) => (
                                        <Card key={testimonial.id} className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                                            <div className="space-y-3">
                                                <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                                    "{testimonial.content}"
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-slate-50">
                                                            {testimonial.author_name}
                                                        </p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {testimonial.author_title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Core Competencies */}
                        {portfolio?.skills && portfolio.skills.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
                                    Core Competencies
                                </h3>
                                <div className="space-y-2">
                                    {portfolio.skills.map((skill: string, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                                        >
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Education */}
                        {resumes && resumes.length > 0 && resumes[0]?.education && resumes[0].education.length > 0 && (
                            <Card className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                        Education
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {resumes[0].education.slice(0, 2).map((edu: any) => (
                                        <div key={edu.id} className="space-y-1">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                                                {edu.degree}
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                {edu.institution}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {edu.graduation_year}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Contact CTA */}
                        <Card className="p-6 bg-blue-600 text-white">
                            <div className="space-y-4 text-center">
                                <h3 className="text-lg font-bold">Let's Connect</h3>
                                <p className="text-sm text-blue-100">
                                    Interested in working together? Get in touch.
                                </p>
                                {portfolio?.email && (
                                    <Button variant="secondary" className="w-full gap-2" asChild>
                                        <a href={`mailto:${portfolio.email}`}>
                                            <Mail className="h-4 w-4" />
                                            Contact Me
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Get in Touch</h2>
                        <p className="text-slate-600 dark:text-slate-400">Have a project or opportunity? Let's discuss it.</p>
                    </div>
                    <ContactForm portfolioId={portfolio.id} />
                </div>
            </div>
        </div>
    )
}
