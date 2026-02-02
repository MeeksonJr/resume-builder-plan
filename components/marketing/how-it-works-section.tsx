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
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6"
                    >
                        How It Works
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                    >
                        From Resume to Offer in 4 Steps
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto"
                    >
                        Our streamlined process takes you from upload to interview-ready in minutes, not hours.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent -z-10" />
                            )}

                            <div className="relative">
                                {/* Step number */}
                                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:border-white/30 transition-colors">
                                    {idx + 1}
                                </div>

                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
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
