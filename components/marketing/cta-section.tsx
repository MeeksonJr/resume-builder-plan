"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export function CTASection() {
    return (
        <section className="relative overflow-hidden bg-[#102b2b] py-24 text-[#f8f4ec]">

            <div className="container relative z-10 mx-auto px-6 md:px-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden border border-[#d8f36b]/30 bg-[#164743] p-8 md:p-16"
                    >
                        <div className="relative">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-8 inline-flex items-center gap-2 border border-[#d8f36b]/25 bg-[#d8f36b]/10 px-4 py-2 text-sm font-semibold text-[#d8f36b]"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    A more considered career studio
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-6 text-4xl font-semibold tracking-[-.05em] md:text-6xl"
                                >
                                    Your next application deserves a better starting point.
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                                >
                                    Start with the experience you already have. ResumeForge helps you shape it into a story that is ready for the room, the recruiter, and the scanner.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                                >
                                    <Button
                                        size="lg"
                                        className="h-14 gap-2 rounded-none bg-[#d8f36b] px-8 text-base font-semibold text-[#102b2b] hover:bg-[#e5ff8b]"
                                        asChild
                                    >
                                        <Link href="/auth/sign-up">
                                            Build my resume
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-14 rounded-none border-[#c5d7d1]/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
                                        asChild
                                    >
                                        <Link href="/pricing">View Pricing</Link>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        <span>Free to start</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        <span>ATS-aware templates</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        <span>Career tools included</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
