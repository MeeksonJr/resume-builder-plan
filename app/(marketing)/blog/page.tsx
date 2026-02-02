"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

// Mock Blog Data
const POSTS = [
    {
        slug: "how-to-beat-ats",
        title: "How to Beat Applicant Tracking Systems (ATS) in 2024",
        excerpt: "Learn the secrets behind the algorithms that filter your resume before a human ever sees it.",
        category: "Job Search",
        date: "Feb 2, 2026",
        readTime: "5 min read",
    },
    {
        slug: "mastering-voice-interviews",
        title: "Mastering the AI Voice Interview: A Complete Guide",
        excerpt: "Voice interviews are the new standard. Here is how to practice and perfect your pitch.",
        category: "Interview Prep",
        date: "Jan 28, 2026",
        readTime: "8 min read",
    },
    {
        slug: "resume-layout-tips",
        title: "5 Resume Layout Mistakes Costing You Interviews",
        excerpt: "Why creative columns might be hurting your chances, and what to use instead.",
        category: "Resume Tips",
        date: "Jan 20, 2026",
        readTime: "4 min read",
    },
    {
        slug: "salary-negotiation",
        title: "The Art of Salary Negotiation for Tech Roles",
        excerpt: "Don't leave money on the table. Scripts and strategies for your next offer.",
        category: "Career Growth",
        date: "Jan 15, 2026",
        readTime: "6 min read",
    },
];

export default function BlogIndex() {
    return (
        <div className="py-32 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Career Insights & Updates
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Expert advice to help you build your resume, ace your interviews, and grow your career.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {POSTS.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <Card className="h-full border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all hover:shadow-lg overflow-hidden">
                                <div className="h-48 bg-slate-100/10 w-full animate-pulse group-hover:bg-slate-100/20 transition-colors" /> {/* Placeholder Image */}
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="rounded-full">{post.category}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.date}
                                        </span>
                                    </div>
                                    <CardTitle className="group-hover:text-primary transition-colors text-2xl">{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base line-clamp-3">
                                        {post.excerpt}
                                    </CardDescription>
                                    <div className="mt-4 text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read Article <span>→</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
