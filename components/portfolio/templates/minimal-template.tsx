"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
    Calendar,
    Award,
    Code2,
    CheckCircle,
    Send,
    Loader2,
} from "lucide-react"

interface MinimalTemplateProps {
    portfolio: any
    resumes: any[]
    projects: any[]
    profile: any
    testimonials: any[]
}

export function MinimalTemplate({
    portfolio,
    resumes,
    projects,
    profile,
    testimonials,
}: MinimalTemplateProps) {
    const displayName = portfolio?.full_name || profile?.full_name || "Professional"
    const bio = portfolio?.bio || "Building amazing digital experiences."

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <div className="container max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <header className="space-y-8 pb-12 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {displayName}
                        </h1>
                        {portfolio?.tagline && (
                            <p className="text-xl text-slate-600 dark:text-slate-400 font-light">
                                {portfolio.tagline}
                            </p>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400">
                        {portfolio?.email && (
                            <a
                                href={`mailto:${portfolio.email}`}
                                className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                            >
                                <Mail className="h-4 w-4" />
                                {portfolio.email}
                            </a>
                        )}
                        {portfolio?.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {portfolio.location}
                            </div>
                        )}
                        {portfolio?.open_to_work && (
                            <Badge variant="outline" className="border-green-600 text-green-600">
                                Available for Work
                            </Badge>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        {portfolio?.social_links?.github && (
                            <a
                                href={portfolio.social_links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                        )}
                        {portfolio?.social_links?.linkedin && (
                            <a
                                href={portfolio.social_links.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        )}
                        {portfolio?.social_links?.twitter && (
                            <a
                                href={portfolio.social_links.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        )}
                        {portfolio?.social_links?.website && (
                            <a
                                href={portfolio.social_links.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
                                aria-label="Website"
                            >
                                <ExternalLink className="h-5 w-5" />
                            </a>
                        )}
                    </div>
                </header>

                {/* About */}
                <section className="py-12 space-y-4">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50">
                        About
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                        {bio}
                    </p>
                </section>

                <Separator className="my-12" />

                {/* Experience */}
                {resumes && resumes.length > 0 && resumes[0]?.work_experiences && (
                    <section className="py-12 space-y-8">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50">
                            Experience
                        </h2>
                        <div className="space-y-8">
                            {resumes[0].work_experiences.map((exp: any) => (
                                <div key={exp.id} className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                                {exp.job_title}
                                            </h3>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                                {exp.company}
                                            </p>
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 text-right shrink-0">
                                            {exp.start_date} - {exp.end_date || "Present"}
                                        </div>
                                    </div>
                                    {exp.description && (
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <Separator className="my-12" />

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <section className="py-12 space-y-8">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50">
                            Selected Projects
                        </h2>
                        <div className="space-y-8">
                            {projects.map((project) => (
                                <div key={project.id} className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                            {project.name || project.title}
                                        </h3>
                                        {project.url && (
                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors shrink-0"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {project.description}
                                    </p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {project.technologies.map((tech: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="text-slate-500 dark:text-slate-400"
                                                >
                                                    {tech}
                                                    {i < project.technologies.length - 1 && " ·"}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {portfolio?.skills && portfolio.skills.length > 0 && (
                    <>
                        <Separator className="my-12" />
                        <section className="py-12 space-y-6">
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50">
                                Skills
                            </h2>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-700 dark:text-slate-300">
                                {portfolio.skills.map((skill: string, i: number) => (
                                    <span key={i}>{skill}</span>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* Testimonials */}
                {testimonials && testimonials.length > 0 && (
                    <>
                        <Separator className="my-12" />
                        <section className="py-12 space-y-8">
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50">
                                Recommendations
                            </h2>
                            <div className="space-y-8">
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="space-y-3">
                                        <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed text-lg">
                                            "{testimonial.content}"
                                        </p>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-50">
                                                {testimonial.author_name}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {testimonial.author_title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* Contact Section */}
                <Separator className="my-12" />
                <section className="py-12">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
                                Get in Touch
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Have a project in mind? Let's talk about it.
                            </p>
                        </div>
                        <ContactForm portfolioId={portfolio.id} />
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <p>© {new Date().getFullYear()} {displayName}</p>
                        {resumes && resumes.length > 0 && (
                            <Button variant="ghost" size="sm" className="gap-2">
                                Download Resume
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </footer>
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
            <Card className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50">Thank You!</h3>
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
                    className="w-full gap-2"
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
