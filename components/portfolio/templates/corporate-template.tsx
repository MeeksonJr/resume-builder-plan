"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
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
} from "lucide-react"

interface CorporateTemplateProps {
    portfolio: any
    resumes: any[]
    projects: any[]
    profile: any
    testimonials: any[]
}

export function CorporateTemplate({
    portfolio,
    resumes,
    projects,
    profile,
    testimonials,
}: CorporateTemplateProps) {
    const displayName = portfolio?.full_name || profile?.full_name || "Professional"
    const bio = portfolio?.bio || "Building amazing digital experiences."

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Professional Header */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
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
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-600">
                                    <Briefcase className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                        Professional Experience
                                    </h2>
                                </div>
                                <div className="space-y-6">
                                    {resumes[0].work_experiences.map((exp: any) => (
                                        <Card key={exp.id} className="p-6 border-l-4 border-l-blue-600">
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
                                    {projects.map((project) => (
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
                                    {testimonials.map((testimonial) => (
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
            <Card className="p-12 flex flex-col items-center justify-center text-center space-y-6 bg-blue-50 dark:bg-blue-950/30">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Thank You!</h3>
                    <p className="text-slate-600 dark:text-slate-400">Your message has been sent. I'll get back to you soon.</p>
                </div>
                <Button variant="outline" onClick={() => setIsSent(false)}>
                    Send another message
                </Button>
            </Card>
        )
    }

    return (
        <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-900 dark:text-slate-50">Name *</Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-900 dark:text-slate-50">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-900 dark:text-slate-50">Subject</Label>
                    <Input
                        id="subject"
                        placeholder="Project inquiry"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-900 dark:text-slate-50">Message *</Label>
                    <Textarea
                        id="message"
                        rows={5}
                        placeholder="Tell me about your project..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="resize-none"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    Send Message
                </Button>
            </form>
        </Card>
    )
}
