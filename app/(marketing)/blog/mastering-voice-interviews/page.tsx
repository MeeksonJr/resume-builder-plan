import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoiceInterviewBlogPost() {
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
                        src="/blog-voice-interview-hero.png"
                        alt="Mastering AI Voice Interviews"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Jan 28, 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8 min read</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
                        Interview Prep
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    Mastering the AI Voice Interview: A Complete Guide
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
                        Voice-based AI interviews are becoming the new standard for initial screening rounds.
                        Companies like Amazon, Google, and hundreds of startups now use conversational AI to
                        assess candidates before human interviews. Here's how to ace them.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why Voice Interviews Matter</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Unlike text-based assessments, voice interviews evaluate your communication skills,
                        confidence, and ability to think on your feet. The AI analyzes your tone, pace, filler
                        words, and content quality—just like a human interviewer would.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">The 7 Keys to Success</h2>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">1. Practice Out Loud</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Thinking about your answers isn't enough. You need to practice speaking them. Record
                        yourself answering common questions and listen back. You'll catch filler words,
                        awkward phrasing, and pacing issues.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">2. Use the STAR Method</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Structure your answers with Situation, Task, Action, Result. This keeps you focused
                        and ensures you're telling a complete story with measurable outcomes.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">3. Speak Clearly and Confidently</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        AI voice systems penalize mumbling, excessive "ums," and long pauses. Speak at a
                        moderate pace, enunciate clearly, and pause briefly between sentences instead of
                        using filler words.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">4. Prepare for Follow-Up Questions</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Modern AI interviewers ask dynamic follow-ups based on your answers. Don't just
                        memorize scripts—understand your experiences deeply so you can elaborate naturally.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">5. Test Your Audio Setup</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Use a good microphone in a quiet room. Background noise, echo, and poor audio quality
                        can hurt your score. Test your setup beforehand.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">6. Show Enthusiasm</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        AI can detect vocal energy. A monotone delivery signals disinterest. Vary your tone,
                        show excitement when discussing achievements, and sound genuinely engaged.
                    </p>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">7. Practice with Real AI</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        The best way to prepare is to practice with an actual AI interviewer. Our platform
                        simulates real interview dynamics—interruptions, follow-ups, and tone analysis—so
                        you're ready for the real thing.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Common Mistakes to Avoid</h2>
                    <ul className="list-disc list-inside text-slate-300 space-y-3 mb-6">
                        <li>Rambling without structure</li>
                        <li>Speaking too fast or too slow</li>
                        <li>Giving one-word answers</li>
                        <li>Failing to quantify achievements</li>
                        <li>Not preparing for behavioral questions</li>
                    </ul>

                    <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to practice?</h3>
                        <p className="text-slate-300 mb-6">
                            Try our AI Voice Interview simulator. Get instant feedback on your answers, tone,
                            and delivery. It's free to start.
                        </p>
                        <Button size="lg" className="rounded-xl" asChild>
                            <Link href="/auth/register">Start Practicing</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
