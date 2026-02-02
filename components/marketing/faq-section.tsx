"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "How does the AI resume writer work?",
        answer: "Our AI analyzes your job history and the role you're targeting, then generates compelling bullet points that highlight your impact with metrics and action verbs. It's trained on thousands of successful resumes from top companies.",
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use bank-level encryption (AES-256) for all data at rest and in transit. Your resume data is never sold to third parties, and you can delete your account at any time.",
    },
    {
        question: "Can I cancel my Pro subscription anytime?",
        answer: "Yes! You can cancel your subscription at any time from your account settings. You'll retain Pro access until the end of your billing period.",
    },
    {
        question: "What makes the voice interview different?",
        answer: "Unlike text-based practice, our voice AI simulates real conversation dynamics—interruptions, follow-ups, and tone analysis. It's the closest thing to a real interview without the pressure.",
    },
    {
        question: "Do you offer refunds?",
        answer: "We offer a 7-day money-back guarantee for Pro subscriptions. If you're not satisfied, just email us and we'll process a full refund, no questions asked.",
    },
    {
        question: "How many resumes can I create?",
        answer: "Free users can create 1 resume. Pro users get unlimited resumes, cover letters, and interview sessions.",
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-slate-900/50">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6"
                    >
                        <HelpCircle className="w-3 h-3" />
                        FAQ
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                    >
                        Frequently Asked Questions
                    </motion.h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            viewport={{ once: true }}
                            className="rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left group"
                            >
                                <span className="font-semibold text-white text-lg pr-8">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === idx ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
