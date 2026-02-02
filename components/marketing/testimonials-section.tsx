"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Mohamed L. Datt",
        role: "Freelance Software Engineer",
        content: "The AI voice interview feature is a game-changer. I practice 10+ times before my real interview and felt completely prepared.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Mohamed L. Datt",
        role: "Freelance Product Manager",
        content: "I think I can get 5 callbacks from 0 callbacks to 5 interviews in 2 weeks after using the ATS optimizer. The AI suggestions were spot-on.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Mohamed L. Datt",
        role: "Freelance UX Designer",
        content: "The resume templates are beautiful and professional. I can get compliments from recruiters on how clean my resume looked.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Mohamed L. Datt",
        role: "Freelance Data Scientist",
        content: "Best $12/month I've can spend on a resume builder. The cover letter generator alone saved me hours of work.",
        rating: 5,
        avatar: "MLD",
    },
    {
        name: "Mohamed L. Datt",
        role: "Freelance Marketing Manager",
        content: "The public portfolio feature helped me stand out. I can share it on LinkedIn and get 3 recruiter messages in a week.",
        rating: 5,
        avatar: "MLD",
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-6"
                    >
                        <Star className="w-3 h-3 fill-current" />
                        Testimonials
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                    >
                        Loved by Job Seekers Worldwide
                    </motion.h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm">
                                {/* Quote icon */}
                                <Quote className="w-8 h-8 text-primary/30 mb-4" />

                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    "{testimonial.content}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white text-sm">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
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
