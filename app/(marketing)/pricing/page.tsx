"use client";

import Link from "next/link";
import { Check, X, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const plans = [
    {
        name: "Free",
        description: "Perfect for trying out the platform.",
        price: "$0",
        period: "/forever",
        features: [
            "1 Resume",
            "3 AI Interview Sessions",
            "Basic Templates",
            "PDF Export",
            "ATS Score Check",
        ],
        limitations: [
            "No Voice Mode",
            "Limited AI Credits (50/month)",
            "Community Support Only",
            "No Cover Letters",
        ],
        buttonText: "Get Started Free",
        buttonVariant: "outline" as const,
        href: "/auth/sign-up",
        popular: false,
    },
    {
        name: "Pro",
        description: "For serious job seekers.",
        price: "$12",
        period: "/month",
        features: [
            "Unlimited Resumes",
            "Unlimited Voice Interviews",
            "Advanced AI Analysis",
            "All Premium Templates",
            "Cover Letter Generator",
            "Public Portfolio",
            "Priority Support",
            "Interview Recordings",
            "Custom Branding",
        ],
        limitations: [],
        buttonText: "Start Pro Trial",
        buttonVariant: "default" as const,
        href: "/auth/sign-up?plan=pro",
        popular: true,
        badge: "Most Popular",
    },
];

const comparisonFeatures = [
    {
        category: "Resume Builder", features: [
            { name: "Number of Resumes", free: "1", pro: "Unlimited" },
            { name: "AI Content Writer", free: "50 credits/mo", pro: "Unlimited" },
            { name: "Template Library", free: "3 Basic", pro: "20+ Premium" },
            { name: "ATS Optimization", free: true, pro: true },
            { name: "Custom Sections", free: false, pro: true },
        ]
    },
    {
        category: "Interview Prep", features: [
            { name: "Text Interview Practice", free: "3 sessions", pro: "Unlimited" },
            { name: "Voice Interview Mode", free: false, pro: true },
            { name: "Detailed Feedback", free: "Basic", pro: "Advanced" },
            { name: "Interview Recordings", free: false, pro: true },
        ]
    },
    {
        category: "Additional Features", features: [
            { name: "Cover Letter Generator", free: false, pro: true },
            { name: "Public Portfolio", free: false, pro: true },
            { name: "Support", free: "Community", pro: "Priority Email" },
        ]
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#e9eee8] py-32 text-[#102b2b]">
            <div className="container mx-auto max-w-7xl px-6 md:px-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 inline-flex items-center gap-2 border border-[#0d8274]/20 bg-[#0d8274]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0d8274]"
                    >
                        <Zap className="w-3 h-3" />
                        Membership
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-4 text-5xl font-semibold tracking-[-.06em] md:text-7xl"
                    >
                        Choose the amount of momentum you need.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto max-w-2xl text-lg leading-relaxed text-[#52716a]"
                    >
                        Start with the essentials. Upgrade when deeper feedback, unlimited tailoring, and interview practice become useful.
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:max-w-5xl mx-auto gap-8 mb-24">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 + 0.3 }}
                        >
                            <Card className={`relative flex h-full flex-col ${plan.popular
                                ? 'border-[#0d8274] bg-[#102b2b] text-[#f8f4ec] shadow-[14px_16px_0_rgba(13,130,116,.18)] lg:scale-105'
                                : 'border-[#102b2b]/15 bg-[#f8f4ec]'
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="rounded-none bg-[#d8f36b] px-4 py-1 text-[#102b2b]">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            {plan.badge}
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="pb-8">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className={plan.popular ? "text-base text-[#a6c0b8]" : "text-base text-[#52716a]"}>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-8">
                                        <span className="text-5xl font-semibold tracking-[-.06em]">{plan.price}</span>
                                        <span className={plan.popular ? "text-lg text-[#a6c0b8]" : "text-lg text-[#52716a]"}>{plan.period}</span>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3">
                                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#0d8274]" />
                                                <span className={plan.popular ? "text-sm text-[#f8f4ec]" : "text-sm text-[#365950]"}>{feature}</span>
                                            </div>
                                        ))}
                                        {plan.limitations.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 opacity-50">
                                                <X className="mt-0.5 h-5 w-5 shrink-0 text-[#9bb5aa]" />
                                                <span className={plan.popular ? "text-sm text-[#7f9c93]" : "text-sm text-[#78928a]"}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant={plan.buttonVariant}
                                        className={`h-12 w-full rounded-none text-base ${plan.popular ? 'bg-[#d8f36b] text-[#102b2b] hover:bg-[#e5ff8b]' : 'border-[#102b2b]/20 bg-transparent text-[#102b2b] hover:bg-[#102b2b]/5'
                                            }`}
                                        asChild
                                    >
                                        <Link href={plan.href}>{plan.buttonText}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-5xl mx-auto"
                >
                    <h2 className="mb-12 text-center text-4xl font-semibold tracking-[-.05em]">
                        Compare the work, not the hype.
                    </h2>
                    <div className="space-y-8">
                        {comparisonFeatures.map((category, idx) => (
                            <div key={idx} className="overflow-hidden border border-[#102b2b]/15 bg-[#f8f4ec]">
                                <div className="border-b border-[#102b2b]/10 bg-[#d8e5dc] px-6 py-4">
                                    <h3 className="text-lg font-semibold">{category.category}</h3>
                                </div>
                                <div className="divide-y divide-[#102b2b]/10">
                                    {category.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="grid grid-cols-3 items-center gap-4 px-6 py-4 transition-colors hover:bg-[#e9eee8]">
                                            <div className="text-[#365950]">{feature.name}</div>
                                            <div className="text-center">
                                                {typeof feature.free === 'boolean' ? (
                                                    feature.free ? (
                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="text-slate-400">{feature.free}</span>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                {typeof feature.pro === 'boolean' ? (
                                                    feature.pro ? (
                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="text-primary font-medium">{feature.pro}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
