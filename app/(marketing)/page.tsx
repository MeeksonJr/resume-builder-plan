import { HeroSection } from "@/components/marketing/hero-section";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { CTASection } from "@/components/marketing/cta-section";

export default function MarketingPage() {
    return (
        <>
            <HeroSection />
            <BentoFeatures />
            <CTASection />
            {/* Logos or Testimonials could go here */}
        </>
    );
}
