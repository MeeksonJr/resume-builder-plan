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
        <div className="py-32 bg-slate-950 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Users className="w-3 h-3" />
                        About Us
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Empowering Careers Through AI
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        We're building the future of job hunting—where AI doesn't replace human potential,
                        it amplifies it. Our mission is to give every job seeker the tools, confidence,
                        and insights they need to succeed.
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
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                                {stat.value}
                            </div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Our Story</h2>
                    <div className="prose prose-lg prose-invert max-w-none space-y-4 text-slate-300 leading-relaxed">
                        <p>
                            ResumeBuilder was born from frustration. Our founders spent months applying to hundreds
                            of jobs, only to be rejected by automated systems before a human ever saw their resumes.
                        </p>
                        <p>
                            We realized the hiring process is fundamentally broken. Talented people are filtered out
                            by keyword-matching algorithms. Interview preparation is expensive and inaccessible.
                            And most career advice is generic and outdated.
                        </p>
                        <p>
                            So we built the platform we wished existed: AI-powered tools that understand context,
                            provide personalized feedback, and actually help you improve—not just pass a test.
                        </p>
                        <p>
                            Today, we're proud to help over 1,200 job seekers land roles at companies like Google,
                            Amazon, and hundreds of startups. But we're just getting started.
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
                        Meet the Founder
                    </h2>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Photo */}
                            <div className="relative shrink-0">
                                <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
                                    <Image
                                        src="/Photo.avif"
                                        alt="Mohamed L. Datt - Founder & Developer"
                                        width={224}
                                        height={224}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                {/* Decorative glow */}
                                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />
                            </div>

                            {/* Bio */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Mohamed L. Datt
                                </h3>
                                <p className="text-lg text-primary mb-4 font-medium">
                                    Founder & Lead Developer
                                </p>
                                <p className="text-slate-300 leading-relaxed mb-4">
                                    A passionate software engineer and entrepreneur dedicated to democratizing access to
                                    career development tools. With years of experience in AI and full-stack development,
                                    Mohamed built ResumeBuilder to solve the frustrations he experienced firsthand in
                                    the job market.
                                </p>
                                <p className="text-slate-400 leading-relaxed">
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
                        Our Values
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
                                <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                                            <value.icon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white mb-4">
                                        {value.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed">
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
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                        <TrendingUp className="w-12 h-12 text-primary mx-auto mb-6" />
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Join Our Mission
                        </h3>
                        <p className="text-slate-400 mb-8 text-lg">
                            We're always looking for talented people who share our vision.
                            Check out our open positions or reach out to say hi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Get in Touch
                            </a>
                            <a
                                href="/blog"
                                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
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
