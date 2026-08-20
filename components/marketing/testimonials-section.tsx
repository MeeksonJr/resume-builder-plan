"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Aisha R.",
        role: "Software engineer",
        content: "The AI voice interview feature is a game-changer. I practice 10+ times before my real interview and felt completely prepared.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Jordan K.",
        role: "Product manager",
        content: "I think I can get 5 callbacks from 0 callbacks to 5 interviews in 2 weeks after using the ATS optimizer. The AI suggestions were spot-on.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Maya T.",
        role: "UX designer",
        content: "The resume templates are beautiful and professional. I can get compliments from recruiters on how clean my resume looked.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Eli P.",
        role: "Data scientist",
        content: "Best $12/month I can spend on a resume builder. The cover letter generator alone saved me hours of work.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Samira N.",
        role: "Marketing manager",
        content: "The public portfolio feature can help me stand out. I can share it on LinkedIn and get 3 recruiter messages in a week. It is pretty fine to customize the template.",
        rating: 5,
        avatar: "MLD",
    },
];

export function TestimonialsSection() {
    return (
        <section className="relative overflow-hidden bg-[#f8f4ec] py-24 text-[#102b2b]">

            <div className="container relative z-10 mx-auto max-w-7xl px-6 md:px-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-6 inline-flex items-center gap-2 border border-[#0d8274]/20 bg-[#0d8274]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0d8274]"
                    >
                        <Star className="w-3 h-3 fill-current" />
                        Testimonials
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 text-4xl font-semibold tracking-[-.05em] md:text-6xl"
                    >
                        Loved by Job Seekers Worldwide
                    </motion.h2>
                </div>

                {/* Testimonials Grid */}
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="h-full border border-[#102b2b]/15 bg-white/60 p-6 transition-all hover:border-[#0d8274]/50 hover:bg-white">
                                {/* Quote icon */}
                                <Quote className="mb-4 h-8 w-8 text-[#0d8274]/40" />

                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current text-[#d8a84e]" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="mb-6 leading-relaxed text-[#365950]">
                                    "{testimonial.content}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center bg-[#102b2b] text-sm font-semibold text-[#d8f36b]">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-xs text-[#52716a]">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
