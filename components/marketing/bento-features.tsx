"use client";

import { motion } from "framer-motion";
import { Bot, FileText, Globe, Sparkles, Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "A resume that sounds like you, only sharper.",
        description: "Turn rough notes into clear, outcome-led bullets without sanding away your voice.",
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
        title: "Know what the scanner sees.",
        description: "Get a plain-language ATS readout before your application leaves your hands.",
        icon: Target,
        className: "md:col-span-1",
        background: (
            <div className="absolute bottom-4 right-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 opacity-30 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                98%
            </div>
        ),
    },
    {
        title: "Tailor in one focused pass.",
        description: "Paste a job description and surface the language that deserves a place in your resume.",
        icon: Bot,
        className: "md:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-50 transition-opacity">
                <Sparkles className="text-indigo-400 w-16 h-16" />
            </div>
        ),
    },
    {
        title: "One workspace for the whole search.",
        description: "Resume, cover letter, interview practice, portfolio, and job tracking in one calm flow.",
        icon: FileText,
        className: "md:col-span-2",
        background: (
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        ),
    },
    {
        title: "Make progress visible.",
        description: "Keep versions, feedback, and next steps close enough to use when momentum is fragile.",
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
        <section className="relative overflow-hidden bg-[#f8f4ec] py-24 text-[#102b2b]" id="features">
            {/* Mesh Gradient Background */}
            <div className="container mx-auto max-w-[1600px] px-6 md:px-10">
                <div className="mx-auto mb-16 max-w-3xl md:text-center">
                    <div className="mb-6 inline-flex items-center gap-2 border border-[#0d8274]/20 bg-[#0d8274]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0d8274]">
                        <Sparkles className="w-3 h-3" />
                        The studio
                    </div>
                    <h2 className="mb-6 text-4xl font-semibold tracking-[-.05em] md:text-6xl">
                        The tools should disappear. The progress should not.
                    </h2>
                    <p className="text-lg leading-relaxed text-[#52716a]">
                        A focused set of tools for making your story legible to the people and systems deciding what happens next.
                    </p>
                </div>

                <div className="grid auto-rows-[minmax(250px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className={cn(
                                "group relative overflow-hidden border border-[#102b2b]/15 bg-white/50 p-8 transition-colors hover:border-[#0d8274]/50 hover:bg-white",
                                feature.className
                            )}
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#102b2b]/15 bg-[#d8f36b] transition-transform duration-300 group-hover:-translate-y-1">
                                    <feature.icon className="h-6 w-6 text-[#102b2b]" />
                                </div>

                                <div>
                                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                                    <p className="leading-relaxed text-[#52716a]">{feature.description}</p>
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
