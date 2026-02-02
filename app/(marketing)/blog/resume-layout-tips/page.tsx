import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumeLayoutBlogPost() {
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
                        src="/blog-resume-layout-hero.png"
                        alt="Resume Layout Mistakes"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Jan 20, 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>4 min read</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                        Resume Tips
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    5 Resume Layout Mistakes Costing You Interviews
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
                        Your resume content might be perfect, but if the layout is wrong, recruiters won't
                        even read it. Here are the 5 most common layout mistakes that kill your chances—and
                        how to fix them.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Mistake #1: Using Multiple Columns</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Two-column layouts look modern, but they break ATS parsers. The system reads left to
                        right, top to bottom—so your "Skills" section in the left column might end up mixed
                        with your "Work Experience" from the right column.
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        <strong className="text-white">Fix:</strong> Use a single-column layout. It's boring,
                        but it works.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Mistake #2: Fancy Fonts and Graphics</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Custom fonts, icons, and graphics make your resume stand out—to humans. But ATS
                        systems can't read them. Your beautiful design becomes garbled text.
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        <strong className="text-white">Fix:</strong> Stick to standard fonts (Arial, Calibri,
                        Times New Roman). Use bold and italics for emphasis, not icons.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Mistake #3: Headers and Footers</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Putting your name and contact info in the header seems logical, but many ATS systems
                        ignore headers entirely. Your resume becomes anonymous.
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        <strong className="text-white">Fix:</strong> Put all critical info (name, email,
                        phone) in the main body of the document.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Mistake #4: Tables and Text Boxes</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Tables organize information neatly, but ATS parsers read them cell by cell, not row
                        by row. Your "Company Name" might end up separated from your "Job Title."
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        <strong className="text-white">Fix:</strong> Use simple line breaks and bullet points
                        instead of tables.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Mistake #5: Creative Section Names</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        "My Journey" instead of "Work Experience" might sound unique, but ATS systems look
                        for standard headers. If it can't find "Work Experience," it assumes you don't have any.
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        <strong className="text-white">Fix:</strong> Use conventional headers: Work Experience,
                        Education, Skills, Certifications.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Bottom Line</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Your resume needs to be ATS-friendly first, human-friendly second. Once you pass the
                        ATS, recruiters will see your content. But if you don't pass, no one will ever read it.
                    </p>

                    <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4">Want an ATS-friendly template?</h3>
                        <p className="text-slate-300 mb-6">
                            Our templates are designed to pass ATS while still looking professional. No more
                            guessing—just proven layouts that work.
                        </p>
                        <Button size="lg" className="rounded-xl" asChild>
                            <Link href="/auth/register">Browse Templates</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
