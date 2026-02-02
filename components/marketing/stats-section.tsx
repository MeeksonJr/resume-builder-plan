"use client";

import { motion } from "framer-motion";
import { Users, FileCheck, Briefcase, Award } from "lucide-react";

const stats = [
    {
        icon: Users,
        value: "1,200+",
        label: "Active Job Seekers",
        color: "text-blue-500",
    },
    {
        icon: FileCheck,
        value: "3,500+",
        label: "Resumes Created",
        color: "text-purple-500",
    },
    {
        icon: Briefcase,
        value: "850+",
        label: "Interviews Practiced",
        color: "text-pink-500",
    },
    {
        icon: Award,
        value: "92%",
        label: "Success Rate",
        color: "text-green-500",
    },
];

export function StatsSection() {
    return (
        <section className="py-24 bg-slate-900/50 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                                {stat.value}
                            </div>
                            <div className="text-sm md:text-base text-slate-400 font-medium">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
