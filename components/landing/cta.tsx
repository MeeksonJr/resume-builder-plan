import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-8 text-center md:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              Ready to Build Your Perfect Resume?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
              Join thousands of job seekers who have landed their dream jobs
              with ResumeForge. Start building for free today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="min-h-[44px] gap-2 px-8"
              >
                <Link href="/auth/sign-up">
                  Start Building Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="min-h-[44px] px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
