"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center shadow-2xl sm:px-16 md:py-24 lg:flex lg:items-center lg:justify-between lg:px-20 lg:text-left">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pattern-dots" />

                    <div className="relative">
                        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                            Ready to accelerate your career?
                        </h2>
                        <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
                            Join thousands of job seekers who found their dream role using our advanced AI tools.
                        </p>
                    </div>
                    <div className="relative mt-8 lg:mt-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Button size="lg" variant="secondary" className="text-primary font-semibold h-12 px-8" asChild>
                            <Link href="/auth/register">
                                Get Started for Free
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 h-12 px-8" asChild>
                            <Link href="/pricing">View Pricing</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
