import { HeroSection } from "@/components/marketing/hero-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";

export default function MarketingPage() {
    return (
        <>
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
