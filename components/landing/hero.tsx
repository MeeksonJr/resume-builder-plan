"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI-Powered Resume Builder</span>
        </Badge>

        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Build Your Perfect Resume with{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Assistance
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Create professional, ATS-optimized resumes in minutes. Upload your
          existing resume, let AI extract and enhance your data, then generate
          tailored resumes for any job.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-h-[44px] gap-2 px-8 shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40">
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-[44px] gap-2 px-8 bg-transparent"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        {/* Visual Mockup */}
        <div className="relative mt-20 mx-auto max-w-5xl">
          <div className="rounded-xl border border-border/50 bg-background/50 p-2 shadow-2xl backdrop-blur-sm lg:p-4">
            <div className="aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted/20 relative">
              <Image
                src="/images/hero-mockup.png"
                alt="ResumeForge AI Mockup"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
              />
            </div>
          </div>
          {/* Decorative Glow */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl opacity-50" />
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-3 gap-8 border-t border-border pt-8">
          <div>
            <div className="text-2xl font-bold text-foreground md:text-3xl">
              AI-Powered
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Smart content generation
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground md:text-3xl">
              ATS-Ready
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Pass applicant tracking
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground md:text-3xl">
              Free Tier
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Start without payment
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
