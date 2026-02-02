"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
    {
        name: "Free",
        description: "Perfect for getting started.",
        price: "$0",
        features: [
            "1 Resume Application",
            "3 AI Interview Sessions",
            "Basic Templates",
            "PDF Export",
        ],
        limitations: [
            "No Voice Mode Analysis",
            "Limited AI Writer Credits",
            "Community Support Only"
        ],
        buttonText: "Get Started",
        buttonVariant: "outline" as const,
        href: "/auth/register",
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
            "Premium Templates",
            "Cover Letter Generator",
            "Priority Support",
        ],
        limitations: [],
        buttonText: "Upgrade to Pro",
        buttonVariant: "default" as const,
        href: "/auth/register?plan=pro",
        popular: true,
    },
];

export default function PricingPage() {
    return (
        <div className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Invest in your career with a plan that fits your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:max-w-4xl mx-auto gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={`flex flex-col relative ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -mr-2 -mt-2">
                                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.limitations.map((feature) => (
                                        <div key={feature} className="flex items-center gap-2 opacity-50">
                                            <X className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant={plan.buttonVariant} className="w-full" asChild>
                                    <Link href={plan.href}>{plan.buttonText}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
