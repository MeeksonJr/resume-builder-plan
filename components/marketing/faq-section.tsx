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
        <section className="bg-[#e9eee8] py-24 text-[#102b2b]">
            <div className="container mx-auto max-w-4xl px-6 md:px-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-6 inline-flex items-center gap-2 border border-[#0d8274]/20 bg-[#0d8274]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0d8274]"
                    >
                        <HelpCircle className="w-3 h-3" />
                        FAQ
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 text-4xl font-semibold tracking-[-.05em] md:text-6xl"
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
                            className="overflow-hidden border border-[#102b2b]/15 bg-[#f8f4ec] transition-colors hover:border-[#0d8274]/50"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                aria-expanded={openIndex === idx}
                                className="group flex w-full items-center justify-between px-6 py-5 text-left"
                            >
                                <span className="pr-8 text-lg font-semibold">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 shrink-0 text-[#52716a] transition-transform duration-300 ${openIndex === idx ? "rotate-180" : ""
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
                                        <div className="px-6 pb-5 leading-relaxed text-[#52716a]">
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
