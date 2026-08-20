"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Target, Heart, Zap, Shield, Users, TrendingUp } from "lucide-react";

const values = [
    {
        icon: Target,
        title: "Mission-Driven",
        description: "We exist to level the playing field in job hunting. Everyone deserves access to world-class career tools.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Heart,
        title: "User-First",
        description: "Every feature we build starts with the question: 'Will this help someone land their dream job?'",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Zap,
        title: "Innovation",
        description: "We're constantly pushing the boundaries of what AI can do for career development.",
        gradient: "from-purple-500 to-indigo-500",
    },
    {
        icon: Shield,
        title: "Privacy & Trust",
        description: "Your career data is sacred. We never sell your information and use bank-level encryption.",
        gradient: "from-green-500 to-emerald-500",
    },
];

const stats = [
    { value: "2024", label: "Founded" },
    { value: "1,200+", label: "Active Users" },
    { value: "92%", label: "Success Rate" },
    { value: "24/7", label: "AI Availability" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#e9eee8] py-32 text-[#102b2b]">
            <div className="container mx-auto max-w-7xl px-6 md:px-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto mb-24 max-w-4xl text-center"
                >
                    <div className="mb-6 inline-flex items-center gap-2 border border-[#0d8274]/20 bg-[#0d8274]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0d8274]">
                        <Users className="w-3 h-3" />
                        About Us
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Career tools should feel like a head start.
                    </h1>
                    <p className="text-xl leading-relaxed text-[#52716a]">
                        ResumeForge helps people turn scattered experience into a clear, credible next step. AI does the heavy lifting; you keep the point of view.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-24"
                >
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="mb-2 text-4xl font-semibold tracking-[-.06em] md:text-5xl">
                                {stat.value}
                            </div>
                            <div className="text-sm text-[#52716a]">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl mx-auto mb-24"
                >
                    <h2 className="mb-6 text-3xl font-semibold tracking-[-.04em] md:text-4xl">Our story</h2>
                    <div className="prose prose-lg max-w-none space-y-4 leading-relaxed text-[#365950]">
                        <p>
                            ResumeForge was born from frustration. The hiring process asks people to translate a whole career into a few small boxes,
                            of jobs, only to be rejected by automated systems before a human ever saw their resumes.
                        </p>
                        <p>
                            Too often, talented people are filtered out by keyword matching before a human sees the work. Interview preparation is expensive, and most career advice is generic.
                        </p>
                        <p>
                            So we built the platform we wished existed: tools that understand context, give useful feedback, and help you improve without flattening your voice.
                        </p>
                        <p>
                            Today, ResumeForge is becoming a quieter, more capable place to prepare for whatever comes next.
                        </p>
                    </div>
                </motion.div>

                {/* Founder Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="max-w-4xl mx-auto mb-24"
                >
                    <h2 className="mb-12 text-center text-3xl font-semibold tracking-[-.04em] md:text-4xl">
                        Meet the founder
                    </h2>
                    <div className="relative overflow-hidden border border-[#102b2b]/15 bg-[#f8f4ec] p-8 md:p-12 shadow-[14px_16px_0_rgba(16,43,43,.08)]">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Photo */}
                            <div className="relative shrink-0">
                                <div className="h-48 w-48 overflow-hidden border-4 border-[#d8f36b] shadow-2xl md:h-56 md:w-56">
                                    <Image
                                        src="/Photo.avif"
                                        alt="Mohamed L. Datt - Founder & Developer"
                                        width={224}
                                        height={224}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                {/* Decorative glow */}
                            </div>

                            {/* Bio */}
                            <div className="flex-1 text-center md:text-left">
                                    <h3 className="mb-2 text-2xl font-semibold md:text-3xl">
                                    Mohamed L. Datt
                                </h3>
                                <p className="mb-4 text-lg font-medium text-[#0d8274]">
                                    Founder & Lead Developer
                                </p>
                                <p className="mb-4 leading-relaxed text-[#365950]">
                                    A passionate software engineer and entrepreneur dedicated to democratizing access to
                                    career development tools. With years of experience in AI and full-stack development,
                                    Mohamed built ResumeBuilder to solve the frustrations he experienced firsthand in
                                    the job market.
                                </p>
                                <p className="leading-relaxed text-[#52716a]">
                                    "I believe everyone deserves a fair shot at their dream job. Technology should empower
                                    people, not gatekeep opportunities. That's why I built this platform—to give job seekers
                                    the same AI-powered advantages that big companies use."
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Values */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="mb-12 text-center text-3xl font-semibold tracking-[-.04em] md:text-4xl">
                        Our values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative"
                            >
                                <div className="h-full border border-[#102b2b]/15 bg-[#f8f4ec] p-8 transition-all hover:border-[#0d8274]/50 hover:bg-white">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center bg-[#d8f36b] transition-transform duration-300 group-hover:-translate-y-1">
                                            <value.icon className="h-8 w-8 text-[#102b2b]" />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-semibold">
                                        {value.title}
                                    </h3>
                                    <p className="leading-relaxed text-[#52716a]">
                                        {value.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-3xl mx-auto text-center mt-24"
                >
                    <div className="border border-[#0d8274]/30 bg-[#102b2b] p-12 text-[#f8f4ec]">
                        <TrendingUp className="mx-auto mb-6 h-12 w-12 text-[#d8f36b]" />
                        <h3 className="mb-4 text-2xl font-semibold md:text-3xl">
                            Build what comes next.
                        </h3>
                        <p className="mb-8 text-lg text-[#a6c0b8]">
                            Start with the part of your story that matters most and give it a sharper shape.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="rounded-none bg-[#d8f36b] px-8 py-3 font-semibold text-[#102b2b] transition-colors hover:bg-[#e5ff8b]"
                            >
                                Get in Touch
                            </a>
                            <a
                                href="/blog"
                                className="rounded-none border border-[#c5d7d1]/30 bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                Read Our Blog
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
