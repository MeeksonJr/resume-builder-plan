"use client";

import { motion } from "framer-motion";
import { Bot, Mic, FileText, Zap, Globe, Sparkles, GraduationCap, DollarSign, Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "AI Scholarship & Grant Matcher",
        description: "Our machine learning engine scans 15,000+ national, state, and private awards to match criteria with your GPA, field of study, and demographic background.",
        icon: Award,
        className: "md:col-span-2",
        background: (
            <div className="absolute right-0 bottom-0 top-10 w-2/3 bg-gradient-to-l from-indigo-500/10 to-transparent p-8 border-l border-white/5 rounded-tl-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="space-y-2">
                    <div className="h-2 w-full bg-indigo-700/50 rounded animate-pulse" />
                    <div className="h-2 w-3/4 bg-violet-700/50 rounded animate-pulse delay-75" />
                    <div className="h-2 w-5/6 bg-emerald-700/50 rounded animate-pulse delay-150" />
                </div>
            </div>
        ),
    },
    {
        title: "Match Score & Odds Intelligence",
        description: "See your actual probability of winning each grant or scholarship before spending hours applying.",
        icon: Target,
        className: "md:col-span-1",
        background: (
            <div className="absolute bottom-4 right-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 opacity-30 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                98%
            </div>
        ),
    },
    {
        title: "Scholarship Essay & SOP Co-Pilot",
        description: "Craft persuasive personal statements, leadership narratives, and financial need essays in minutes.",
        icon: Bot,
        className: "md:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-50 transition-opacity">
                <Sparkles className="text-indigo-400 w-16 h-16" />
            </div>
        ),
    },
    {
        title: "Complete Career & Resume Suite",
        description: "Pass ATS screenings for fellowships, internships, and university positions with intelligent resume scoring.",
        icon: FileText,
        className: "md:col-span-2",
        background: (
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        ),
    },
    {
        title: "Verified Grants & Research Directory",
        description: "Explore STEM, humanities, undergraduate research, and graduate fellowships from trusted foundations and universities.",
        icon: Globe,
        className: "md:col-span-3",
        background: (
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-40" />
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
        ),
    }
];

export function BentoFeatures() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden" id="features">
            {/* Mesh Gradient Background */}
            <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen -z-10" />

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-16 md:text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" />
                        Grantly Intelligence
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Everything you need to fund your future.
                    </h2>
                    <p className="text-lg text-slate-400">
                        Stop scouring dozens of outdated scholarship directories. Grantly puts verified financial aid, fellowship matching, and application tools directly at your fingertips.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:border-white/20",
                                feature.className
                            )}
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-6 h-6 text-indigo-400" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>

                            {/* Decorative Background */}
                            {feature.background}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
