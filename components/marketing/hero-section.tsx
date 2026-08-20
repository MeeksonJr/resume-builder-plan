"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle, GraduationCap, DollarSign, Award, Search, Compass, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { BlackHoleHeroSection } from "@/components/ui/blackhole-hero-section";
import { GlassDock, GlassButton, GlassFilter } from "@/components/ui/liquid-glass";

const sampleFunding = [
    { title: "Future Tech Innovators Grant", amount: "$15,000", match: "98% Match", tags: ["STEM", "Undergrad"] },
    { title: "NextGen Leaders Fellowship", amount: "$25,000", match: "95% Match", tags: ["Leadership", "All Majors"] },
    { title: "First-Generation Scholar Award", amount: "$10,000", match: "92% Match", tags: ["Need-Based", "Freshman"] },
];

export function HeroSection() {
    const [searchQuery, setSearchQuery] = useState("");

    const dockIcons = [
        {
            src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&auto=format&fit=crop&q=80",
            alt: "College Scholarships",
        },
        {
            src: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=128&auto=format&fit=crop&q=80",
            alt: "Research Grants",
        },
        {
            src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&auto=format&fit=crop&q=80",
            alt: "Fellowships",
        },
        {
            src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&auto=format&fit=crop&q=80",
            alt: "Tuition Assistance",
        },
    ];

    return (
        <section className="relative min-h-[92svh] md:min-h-[840px] w-full overflow-hidden bg-[#0B1220] text-white">
            {/* Black Hole Gravitational Background */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <BlackHoleHeroSection
                    distance={26}
                    elevation={-6}
                    azimuth={0}
                    fov={46}
                    hotColor="#FFF5EA"
                    midColor="#6366F1"
                    coolColor="#312E81"
                    glow={1.1}
                    steps={240}
                    resolution={0.65}
                    scrim="left"
                    scrimStrength={0.85}
                    className="opacity-75"
                />
            </div>

            <GlassFilter />

            <div className="container relative z-10 mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Copy */}
                    <div className="lg:col-span-7 text-left space-y-6">
                        {/* Brand Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>AI Scholarship & Grant Matching</span>
                            <span className="text-amber-300">✦</span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]"
                        >
                            Your money for college,{" "}
                            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
                                matched.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="max-w-xl text-base sm:text-lg text-slate-300 font-light leading-relaxed"
                        >
                            <strong className="text-white font-medium">Grantly</strong> analyzes your GPA, major, background, and goals to automatically match you with thousands of verified scholarships, fellowships, and research grants.
                        </motion.p>

                        {/* Interactive Fast Search */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-3 max-w-xl pt-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your major, school, or interest..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md text-sm"
                                />
                            </div>
                            <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/30 gap-2 shrink-0 cursor-pointer" asChild>
                                <Link href="/scholarships">
                                    Find Matches <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                <span>$45M+ in verified awards</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-indigo-400" />
                                <span>No essay-mill spam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-amber-300" />
                                <span>AI Application Assistant</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Interactive Card / Liquid Glass Dock */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Glass Match Widget */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="rounded-3xl border border-white/15 bg-slate-950/70 p-6 backdrop-blur-xl shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-white">Live Opportunities</h3>
                                        <p className="text-xs text-slate-400">Updated in real time</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    <Sparkles className="h-3 w-3" /> 2,400+ Active
                                </span>
                            </div>

                            {/* Sample Opportunities */}
                            <div className="space-y-2.5">
                                {sampleFunding.map((item, idx) => (
                                    <div key={idx} className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-xs sm:text-sm text-white group-hover:text-indigo-300 transition-colors">
                                                    {item.title}
                                                </h4>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {item.tags.map((t, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-sm text-emerald-400">{item.amount}</div>
                                            <div className="text-[10px] text-indigo-400">{item.match}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Liquid Glass Interactive Dock */}
                            <div className="pt-2 flex flex-col items-center gap-3">
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Explore Categories</p>
                                <GlassDock icons={dockIcons} href="/scholarships" />
                                <Button asChild className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 text-xs cursor-pointer" size="sm">
                                    <Link href="/scholarships">
                                        Browse All Scholarships & Grants <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}

