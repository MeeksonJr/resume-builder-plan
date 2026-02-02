"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 bg-background">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50 animate-pulse" />
            <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500/10 blur-[100px] rounded-full opacity-50" />

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8"
                >
                    <Sparkles className="h-4 w-4" />
                    <span>New: Voice Mode Interview Practice</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto max-w-4xl text-5xl font-bold tracking-tight md:text-7xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                >
                    Build Your Career, <br />
                    <span className="text-primary">Not Just a Resume.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
                >
                    Create ATS-friendly resumes, generate cover letters, and master your
                    interview skills with our advanced AI—all in one platform.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
                        <Link href="/auth/register">
                            Build My Resume <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                        <Link href="/dashboard/interview-prep">
                            Practice Interview
                        </Link>
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>ATS-Optimized Templates</span>
                    </div>
                </motion.div>

                {/* Floating UI Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
                    className="mt-20 relative mx-auto max-w-5xl rounded-xl border bg-background/50 p-2 shadow-2xl backdrop-blur-sm lg:rounded-2xl lg:p-4"
                >
                    <div className="rounded-lg border bg-card p-4 aspect-[16/9] flex items-center justify-center text-muted-foreground overflow-hidden relative">
                        {/* Simulated Dashboard UI - simplified for visual */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
                        <div className="z-10 text-center">
                            <p className="text-sm font-medium uppercase tracking-widest text-primary/60">Interactive Dashboard Preview</p>
                            {/* In a real scenario, use <Image> here of a screenshot */}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
