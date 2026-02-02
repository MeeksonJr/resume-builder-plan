"use client";

import { motion } from "framer-motion";
import { Bot, Mic, FileText, Zap, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "AI Resume Writer",
        description: "Our AI doesn't just check grammar. It rewrites your bullets to be impactful and quantifiable.",
        icon: Bot,
        className: "md:col-span-2",
        background: (
            <div className="absolute right-0 bottom-0 top-10 w-2/3 bg-gradient-to-l from-blue-500/10 to-transparent p-8 border-l border-white/5 rounded-tl-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-2 w-3/4 bg-slate-700/50 rounded animate-pulse delay-75" />
                    <div className="h-2 w-5/6 bg-slate-700/50 rounded animate-pulse delay-150" />
                </div>
            </div>
        ),
    },
    {
        title: "Voice Interview Coach",
        description: "Practice real-time conversations. Get feedback on your tone, pace, and content.",
        icon: Mic,
        className: "md:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                <div className="w-24 h-24 rounded-full border border-purple-500/30 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full border border-purple-500/50 animate-ping delay-100 absolute" />
                <Mic className="text-purple-500 w-8 h-8 relative z-10" />
            </div>
        ),
    },
    {
        title: "ATS Intelligence",
        description: "Score your resume against any job description to ensure you pass the keyword filters.",
        icon: FileText,
        className: "md:col-span-1",
        background: (
            <div className="absolute bottom-4 right-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 opacity-20 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                98%
            </div>
        )
    },
    {
        title: "Smart Cover Letters",
        description: "Generate tailored cover letters for every application in seconds.",
        icon: Zap,
        className: "md:col-span-2",
        background: (
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        ),
    }
];

export function BentoFeatures() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden" id="features">
            {/* Mesh Gradient Background */}
            <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen -z-10" />

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-16 md:text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" />
                        Features
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Everything you need to get hired.
                    </h2>
                    <p className="text-lg text-slate-400">
                        Stop guessing. Our tools give you the data, feedback, and polish you need to stand out in a crowded market.
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
                                    <feature.icon className="w-6 h-6 text-slate-200" />
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
