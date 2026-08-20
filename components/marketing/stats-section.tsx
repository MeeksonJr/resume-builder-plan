"use client";

import { motion } from "framer-motion";
import { Users, FileCheck, Briefcase, Award } from "lucide-react";

const stats = [
    {
        icon: Award,
        value: "$45M+",
        label: "Funding Unlocked",
        color: "text-emerald-400",
    },
    {
        icon: Users,
        value: "25,000+",
        label: "Matched Students",
        color: "text-indigo-400",
    },
    {
        icon: FileCheck,
        value: "12,400+",
        label: "Verified Scholarships",
        color: "text-violet-400",
    },
    {
        icon: Briefcase,
        value: "96.4%",
        label: "Profile Match Accuracy",
        color: "text-amber-300",
    },
];

export function StatsSection() {
    return (
        <section className="border-y border-[#c9d8d0] bg-[#f8f4ec] py-16 text-[#102b2b] md:py-20">
            <div className="container mx-auto px-6 md:px-10">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group text-center"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border border-[#102b2b]/15 bg-[#d8f36b] transition-transform duration-300 group-hover:-translate-y-1">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                            <div className="mb-2 text-4xl font-semibold tracking-[-.06em] md:text-5xl">
                                {stat.value}
                            </div>
                            <div className="text-sm font-medium text-[#52716a] md:text-base">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
