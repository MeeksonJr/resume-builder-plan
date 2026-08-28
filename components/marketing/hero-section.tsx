"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, FileText, ScanSearch, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-[#102b2b] text-[#f8f4ec]">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,43,43,1)_0%,rgba(16,43,43,.96)_48%,rgba(22,71,67,.84)_100%)]" />
            <div className="absolute right-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full border border-[#d8f36b]/20" />
            <div className="absolute right-[-5rem] top-[-3rem] h-[22rem] w-[22rem] rounded-full border border-[#d8f36b]/15" />

            <div className="container relative z-10 mx-auto max-w-[1600px] px-6 pb-20 pt-32 md:px-10 md:pb-28 md:pt-44">
                <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.88fr)] lg:gap-24">
                    <div className="max-w-3xl space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 border border-[#d8f36b]/30 bg-[#d8f36b]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-[#d8f36b]"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#d8f36b]" />
                            <span>ResumeForge / AI career studio</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.06em] sm:text-7xl lg:text-[6.7rem]"
                        >
                            Make your next move look as good as it is.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="max-w-xl text-lg leading-relaxed text-[#c5d7d1] sm:text-xl"
                        >
                            ResumeForge gives your experience a sharper point of view. Build an ATS-ready resume, tailor it to the role, and walk into the interview with a plan.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col gap-3 pt-2 sm:flex-row"
                        >
                            <Button size="lg" className="h-14 rounded-none bg-[#d8f36b] px-7 font-semibold text-[#102b2b] shadow-[0_12px_30px_rgba(216,243,107,.16)] hover:bg-[#e5ff8b]" asChild>
                                <Link href="/auth/sign-up">
                                    Build my resume <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 rounded-none border-[#c5d7d1]/30 bg-transparent px-7 text-[#f8f4ec] hover:bg-white/10" asChild>
                                <Link href="/pricing">See how it works</Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs text-[#a6c0b8]"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-[#d8f36b]" />
                                <span>Free to start</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-[#d8f36b]" />
                                <span>ATS-aware by default</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-[#d8f36b]" />
                                <span>Your data stays yours</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative mx-auto w-full max-w-[520px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative overflow-hidden border border-[#c5d7d1]/20 bg-[#f8f4ec] p-4 text-[#102b2b] shadow-[24px_28px_0_rgba(5,22,22,.28)] sm:p-6"
                        >
                            <div className="flex items-center justify-between border-b border-[#102b2b]/10 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center bg-[#d8f36b]">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Product Designer / Resume</h3>
                                        <p className="text-xs text-[#52716a]">Tailored for Notion · Updated now</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 bg-[#102b2b] px-2.5 py-1 text-xs font-semibold text-[#d8f36b]">
                                    <Sparkles className="h-3 w-3" /> 92 score
                                </span>
                            </div>

                            <div className="space-y-5 py-5">
                                <div>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#52716a]">Profile</p>
                                    <h4 className="text-2xl font-semibold tracking-[-.04em]">Alex Morgan</h4>
                                    <p className="mt-1 text-sm text-[#52716a]">Product designer who turns complex systems into clear tools.</p>
                                </div>
                                <div className="grid grid-cols-[1.35fr_1fr] gap-3">
                                    <div className="border border-[#102b2b]/10 p-4">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-semibold"><ScanSearch className="h-4 w-4 text-[#0d8274]" /> ATS snapshot</div>
                                        <div className="space-y-2"><div className="h-2 w-full bg-[#d8f36b]" /><div className="h-2 w-4/5 bg-[#b9d3cb]" /><div className="h-2 w-11/12 bg-[#b9d3cb]" /><div className="h-2 w-3/5 bg-[#b9d3cb]" /></div>
                                    </div>
                                    <div className="bg-[#102b2b] p-4 text-[#f8f4ec]"><p className="text-xs text-[#a6c0b8]">Keyword fit</p><p className="mt-3 text-4xl font-semibold text-[#d8f36b]">+38%</p><p className="mt-1 text-xs text-[#a6c0b8]">after tailoring</p></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#102b2b]/10 pt-4 text-xs"><span className="font-semibold">Ready for your next role</span><span className="text-[#0d8274]">Export PDF →</span></div>
                        </motion.div>
                        <div className="absolute -bottom-6 -left-8 hidden border border-[#d8f36b]/20 bg-[#164743] px-4 py-3 text-xs text-[#d8f36b] shadow-xl sm:block"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#d8f36b]" /> AI suggestions are ready</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

