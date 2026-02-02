import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ATSBlogPost() {
    return (
        <div className="py-32 bg-slate-950 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                {/* Hero Image */}
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8">
                    <Image
                        src="/blog-ats-hero.png"
                        alt="How to Beat ATS Systems"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Feb 2, 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>5 min read</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                        Job Search
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    How to Beat Applicant Tracking Systems (ATS) in 2024
                </h1>

                {/* Author */}
                <div className="flex items-center gap-3 pb-8 mb-8 border-b border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        MLD
                    </div>
                    <div>
                        <div className="font-semibold text-white">Mohamed L. Datt</div>
                        <div className="text-sm text-slate-400">Founder & Lead Developer</div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg prose-invert max-w-none">
                    <p className="text-xl text-slate-300 leading-relaxed mb-8">
                        You've spent hours perfecting your resume, but it never reaches a human recruiter.
                        Why? Because 75% of resumes are rejected by Applicant Tracking Systems (ATS) before
                        anyone reads them. Here's how to beat the algorithm.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">What is an ATS?</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        An Applicant Tracking System is software that scans, parses, and ranks resumes based
                        on keywords, formatting, and relevance to the job description. Companies use ATS to
                        filter thousands of applications automatically.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">The 5 Rules to Pass ATS</h2>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">1. Use Standard Section Headers</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Stick to conventional headers like "Work Experience," "Education," and "Skills."
                        Creative headers like "My Journey" or "What I've Done" confuse the parser.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">2. Match Keywords from the Job Description</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        ATS systems rank resumes by keyword match. If the job posting mentions "Python,"
                        "Agile," or "Project Management," those exact terms should appear in your resume.
                        Don't use synonyms—use the exact language from the posting.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">3. Avoid Complex Formatting</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Tables, columns, headers/footers, and text boxes break ATS parsers. Use a simple,
                        single-column layout with standard fonts (Arial, Calibri, Times New Roman).
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">4. Save as .docx or PDF (with text)</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Most ATS systems prefer .docx files, but modern systems also accept PDFs—as long as
                        they're text-based, not scanned images. Always test your PDF by trying to copy/paste
                        text from it.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">5. Quantify Your Achievements</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        ATS systems look for measurable impact. Instead of "Managed a team," write "Led a
                        team of 8 engineers to deliver 12 features, increasing user engagement by 35%."
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">How ResumeBuilder Helps</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Our AI analyzes job descriptions and suggests keywords, checks your formatting for
                        ATS compatibility, and gives you a score before you apply. No more guessing—just
                        data-driven optimization.
                    </p>

                    <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to optimize your resume?</h3>
                        <p className="text-slate-300 mb-6">
                            Try our ATS checker and see your score in real-time. It's free to start.
                        </p>
                        <Button size="lg" className="rounded-xl" asChild>
                            <Link href="/auth/register">Get Started Free</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
