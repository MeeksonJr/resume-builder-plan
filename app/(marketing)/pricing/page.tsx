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
        href: "/auth/register",
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
        href: "/auth/register?plan=pro",
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
        <div className="py-32 bg-slate-950 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6"
                    >
                        <Zap className="w-3 h-3" />
                        Pricing
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                    >
                        Simple, Transparent Pricing
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto"
                    >
                        Start free, upgrade when you're ready. No hidden fees, cancel anytime.
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
                            <Card className={`flex flex-col relative h-full ${plan.popular
                                ? 'border-primary shadow-2xl shadow-primary/20 scale-105 bg-gradient-to-b from-primary/5 to-transparent'
                                : 'border-white/10 bg-white/5'
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            {plan.badge}
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="pb-8">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className="text-base">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-8">
                                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                                        <span className="text-slate-400 text-lg">{plan.period}</span>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span className="text-sm text-slate-200">{feature}</span>
                                            </div>
                                        ))}
                                        {plan.limitations.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 opacity-50">
                                                <X className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                                                <span className="text-sm text-slate-400">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant={plan.buttonVariant}
                                        className={`w-full h-12 text-base rounded-xl ${plan.popular ? 'shadow-lg shadow-primary/25' : ''
                                            }`}
                                        asChild
                                    >
                                        <Link href="/auth/sign-up">Get Started</Link>
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
                    <h2 className="text-3xl font-bold text-center mb-12 text-white">
                        Feature Comparison
                    </h2>
                    <div className="space-y-8">
                        {comparisonFeatures.map((category, idx) => (
                            <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                                <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                                    <h3 className="font-semibold text-lg text-white">{category.category}</h3>
                                </div>
                                <div className="divide-y divide-white/10">
                                    {category.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors">
                                            <div className="text-slate-300">{feature.name}</div>
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
