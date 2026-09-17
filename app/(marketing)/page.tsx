import { HeroSection } from "@/components/marketing/hero-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { ReferralWelcomeBanner } from "@/components/marketing/referral-welcome-banner";
import { CTASection } from "@/components/marketing/cta-section";
import { Suspense } from "react";

export default function MarketingPage() {
    return (
        <>
            <Suspense fallback={null}>
                <ReferralWelcomeBanner />
            </Suspense>
            <HeroSection />
            <StatsSection />
            <BentoFeatures />
            <HowItWorksSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </>
    );
}
