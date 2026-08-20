"use client";

import { motion } from "framer-motion";
import { Upload, Wand2, Target, Rocket } from "lucide-react";

const steps = [
    {
        icon: Upload,
        title: "Upload Your Resume",
        description: "Start from scratch or import your existing resume. Our AI instantly parses and structures your data.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Wand2,
        title: "AI Enhancement",
        description: "Let our AI rewrite your bullets, optimize keywords, and ensure ATS compatibility.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Target,
        title: "Practice Interviews",
        description: "Simulate real interviews with our voice AI. Get instant feedback on your answers and delivery.",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Rocket,
        title: "Land the Job",
        description: "Export your polished resume, share your portfolio, and confidently ace your interviews.",
        gradient: "from-orange-500 to-yellow-500",
    },
];

export function HowItWorksSection() {
    return (
        <section className="relative overflow-hidden bg-[#102b2b] py-24 text-[#f8f4ec]">
            {/* Background decoration */}
            <div className="container mx-auto max-w-7xl px-6 md:px-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-6 inline-flex items-center gap-2 border border-[#d8f36b]/25 bg-[#d8f36b]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#d8f36b]"
                    >
                        How It Works
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 text-4xl font-semibold tracking-[-.05em] md:text-6xl"
                    >
                        From Resume to Offer in 4 Steps
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto max-w-2xl text-lg text-[#a6c0b8]"
                    >
                        Our streamlined process takes you from upload to interview-ready in minutes, not hours.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            {/* Connecting line */}
                            {idx < steps.length - 1 && (
                                <div className="absolute left-full top-16 hidden h-px w-full bg-[#d8f36b]/30 lg:block" />
                            )}

                            <div className="relative">
                                {/* Step number */}
                                <div className="absolute -left-3 -top-3 flex h-9 w-9 items-center justify-center border border-[#d8f36b]/40 bg-[#164743] text-sm font-bold text-[#d8f36b] transition-colors group-hover:border-[#d8f36b]">
                                    {idx + 1}
                                </div>

                                {/* Icon */}
                                <div className="mb-6 h-20 w-20 border border-[#d8f36b]/30 bg-[#164743] p-0.5 transition-transform duration-300 group-hover:-translate-y-1">
                                    <div className="flex h-full w-full items-center justify-center">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                    <h3 className="mb-3 text-xl font-semibold">
                                    {step.title}
                                </h3>
                                <p className="leading-relaxed text-[#a6c0b8]">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
