"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle, PlayCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    return (
        <section ref={ref} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10 bg-slate-950">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 mb-8 backdrop-blur-sm cursor-pointer hover:bg-blue-500/20 transition-colors"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>New: AI Voice Interviews v2.0</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-50" />
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl leading-[1.1]"
                >
                    Your Career, <br className="hidden md:block" />
                    <span className="text-gradient drop-shadow-2xl">Supercharged by AI.</span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mt-8 max-w-2xl text-lg text-slate-400 md:text-xl font-light leading-relaxed"
                >
                    Build ATS-ready resumes, generate cover letters, and practice with our realistic AI interviewer.
                    The complete toolkit for the modern job seeker.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Button size="lg" className="h-14 px-8 text-base gap-2 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-105" asChild>
                        <Link href="/auth/register">
                            Start Building Free <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base gap-2 rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 backdrop-blur-md transition-all hover:scale-105" asChild>
                        <Link href="#demo">
                            <PlayCircle className="h-4 w-4" />
                            Watch Demo
                        </Link>
                    </Button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span>No credit card needed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <span>Used by 1,000+ candidates</span>
                    </div>
                </motion.div>

                {/* 3D Dashboard Mockup */}
                <motion.div
                    style={{ y, opacity, scale }}
                    className="mt-20 relative mx-auto max-w-6xlPerspective"
                >
                    <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl lg:rounded-3xl lg:p-3 overflow-hidden group">
                        {/* Glow behind the dashboard */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-1000" />

                        <div className="rounded-xl border border-white/5 bg-slate-950 aspect-[16/10] overflow-hidden relative">
                            {/* Dashboard Screenshot */}
                            <Image
                                src="/dashboard-preview.png"
                                alt="Resume Builder Dashboard Interface"
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Fake UI Elements for visual interest */}
                            <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 bg-slate-900/80 backdrop-blur-sm flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
