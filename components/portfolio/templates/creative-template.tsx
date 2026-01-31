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
    Sparkles,
    Zap,
    Rocket,
    Star,
    CheckCircle,
    Send,
    Loader2,
} from "lucide-react"

interface CreativeTemplateProps {
    portfolio: any
    resumes: any[]
    projects: any[]
    profile: any
    testimonials: any[]
}

export function CreativeTemplate({
    portfolio,
    resumes,
    projects,
    profile,
    testimonials,
}: CreativeTemplateProps) {
    const displayName = portfolio?.full_name || profile?.full_name || "Professional"
    const bio = portfolio?.bio || "Building amazing digital experiences."

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
            {/* Vibrant Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20" />
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 opacity-20 blur-3xl" />
                    <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 opacity-20 blur-3xl" />
                </div>

                <div className="relative container max-w-6xl mx-auto px-6 py-24">
                    <div className="max-w-3xl space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20">
                            <Sparkles className="h-4 w-4 text-pink-600" />
                            <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                                Creative Professional
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-black tracking-tight">
                            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                                {displayName}
                            </span>
                        </h1>

                        {portfolio?.tagline && (
                            <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                {portfolio.tagline}
                            </p>
                        )}

                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                            {bio}
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            {portfolio?.location && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                                    <MapPin className="h-4 w-4 text-pink-600" />
                                    <span className="text-sm font-semibold">{portfolio.location}</span>
                                </div>
                            )}
                            {portfolio?.open_to_work && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Available Now!
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {portfolio?.email && (
                                <Button size="lg" className="rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 gap-2">
                                    <Mail className="h-4 w-4" />
                                    Get in Touch
                                </Button>
                            )}
                            {portfolio?.social_links?.github && (
                                <Button variant="outline" size="lg" className="rounded-full border-2 gap-2" asChild>
                                    <a href={portfolio.social_links.github} target="_blank" rel="noopener noreferrer">
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </a>
                                </Button>
                            )}
                            {portfolio?.social_links?.linkedin && (
                                <Button variant="outline" size="lg" className="rounded-full border-2 gap-2" asChild>
                                    <a href={portfolio.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Cloud */}
            {portfolio?.skills && portfolio.skills.length > 0 && (
                <section className="container max-w-6xl mx-auto px-6 py-16">
                    <div className="flex items-center gap-3 mb-8">
                        <Rocket className="h-8 w-8 text-purple-600" />
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50">
                            Super Powers
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {portfolio.skills.map((skill: string, i: number) => (
                            <Badge
                                key={i}
                                className="px-5 py-2.5 text-base font-bold rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, hsl(${(i * 40) % 360}, 70%, 60%), hsl(${(i * 40 + 60) % 360}, 70%, 50%))`,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}

            {/* Creative Projects */}
            {projects && projects.length > 0 && (
                <section className="container max-w-6xl mx-auto px-6 py-16">
                    <div className="flex items-center gap-3 mb-8">
                        <Star className="h-8 w-8 text-orange-600" />
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50">
                            Showcase
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {projects.map((project, i) => (
                            <Card
                                key={project.id}
                                className="group relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-300"
                                style={{
                                    borderColor: `hsl(${(i * 80) % 360}, 70%, 60%)`,
                                }}
                            >
                                <div
                                    className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                                    style={{
                                        background: `linear-gradient(135deg, hsl(${(i * 80) % 360}, 70%, 60%), hsl(${(i * 80 + 60) % 360}, 70%, 50%))`,
                                    }}
                                />
                                <div className="relative p-8 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 group-hover:scale-105 transition-transform">
                                            {project.name || project.title}
                                        </h3>
                                        {project.url && (
                                            <Button
                                                size="sm"
                                                className="rounded-full shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg, hsl(${(i * 80) % 360}, 70%, 60%), hsl(${(i * 80 + 60) % 360}, 70%, 50%))`,
                                                }}
                                                asChild
                                            >
                                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {project.description}
                                    </p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.map((tech: string, j: number) => (
                                                <Badge key={j} variant="secondary" className="rounded-full">
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

            {/* Experience Timeline */}
            {resumes && resumes.length > 0 && resumes[0]?.work_experiences && (
                <section className="container max-w-4xl mx-auto px-6 py-16">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-12 text-center">
                        Journey
                    </h2>
                    <div className="space-y-8">
                        {resumes[0].work_experiences.map((exp: any, i: number) => (
                            <div key={exp.id} className="relative pl-8 border-l-4" style={{
                                borderColor: `hsl(${(i * 60) % 360}, 70%, 60%)`
                            }}>
                                <div
                                    className="absolute -left-3 top-0 h-6 w-6 rounded-full"
                                    style={{
                                        background: `linear-gradient(135deg, hsl(${(i * 60) % 360}, 70%, 60%), hsl(${(i * 60 + 40) % 360}, 70%, 50%))`,
                                    }}
                                />
                                <Card className="p-6 ml-4">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-50">
                                            {exp.job_title}
                                        </h3>
                                        <p className="font-bold" style={{
                                            color: `hsl(${(i * 60) % 360}, 70%, 50%)`
                                        }}>
                                            {exp.company}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {exp.start_date} - {exp.end_date || "Present"}
                                        </p>
                                        {exp.description && (
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Testimonials */}
            {testimonials && testimonials.length > 0 && (
                <section className="container max-w-6xl mx-auto px-6 py-16">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-12 text-center">
                        What People Say
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial, i) => (
                            <Card
                                key={testimonial.id}
                                className="p-8 border-2"
                                style={{
                                    borderColor: `hsl(${(i * 120) % 360}, 70%, 60%)`,
                                }}
                            >
                                <div className="space-y-4">
                                    <div
                                        className="text-6xl font-black opacity-20"
                                        style={{
                                            color: `hsl(${(i * 120) % 360}, 70%, 60%)`,
                                        }}
                                    >
                                        "
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed text-lg">
                                        {testimonial.content}
                                    </p>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-slate-50">
                                            {testimonial.author_name}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {testimonial.author_title}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact Form Section */}
            <section className="container max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        Let's Connect!
                    </h2>
                    <p className="text-lg text-slate-700 dark:text-slate-300">
                        Got a project or idea? Drop me a message!
                    </p>
                </div>
                <ContactForm portfolioId={portfolio.id} />
            </section>

            {/* Fun Footer */}
            <footer className="relative overflow-hidden py-16">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10" />
                <div className="relative container max-w-6xl mx-auto px-6 text-center space-y-6">
                    <p className="text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
                </div>
            </footer>
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
            <Card className="p-12 flex flex-col items-center justify-center text-center space-y-6 border-4" style={{
                borderImage: 'linear-gradient(135deg, #ec4899, #a855f7, #f97316) 1'
            }}>
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50">Thank You!</h3>
                    <p className="text-slate-600 dark:text-slate-400">Your message has been sent. I'll get back to you soon.</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setIsSent(false)}
                >
                    Send another message
                </Button>
            </Card>
        )
    }

    return (
        <Card className="p-8 border-4" style={{
            borderImage: 'linear-gradient(135deg, #ec4899, #a855f7, #f97316) 1'
        }}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-900 dark:text-slate-50 font-bold">Name *</Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="rounded-xl"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-900 dark:text-slate-50 font-bold">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="rounded-xl"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-900 dark:text-slate-50 font-bold">Subject</Label>
                    <Input
                        id="subject"
                        placeholder="Project inquiry"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-900 dark:text-slate-50 font-bold">Message *</Label>
                    <Textarea
                        id="message"
                        rows={5}
                        placeholder="Tell me about your project..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="resize-none rounded-xl"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full gap-2 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 hover:shadow-xl transition-shadow"
                    disabled={isSubmitting}
                    size="lg"
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
