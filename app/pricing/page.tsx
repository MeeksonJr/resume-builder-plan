"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PricingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // Redirect to Stripe Checkout
            window.location.href = "/api/stripe/checkout";
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 selection:bg-primary/20">
            <SiteHeader />

            <div className="container mx-auto px-4 py-24">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="h-3 w-3" />
                        Invest in your Career
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
                        Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">pricing</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                        Choose the plan that fits your career goals. Unlock unlimited AI power to land your dream job faster.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                        <CardHeader className="pb-8">
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Free Starter</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Perfect for building your first resume</CardDescription>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tighter">$0</span>
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">/ month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                "1 Resume Template",
                                "Basic AI Analysis (3/day)",
                                "PDF Export",
                                "Manual Editing",
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-3 text-slate-300 font-medium">
                                    <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                            {[
                                "AI Interview Practice",
                                "Unlimited AI Generation",
                                "Premium Templates",
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-3 text-slate-600 font-medium">
                                    <div className="h-6 w-6 rounded-full bg-slate-900/50 flex items-center justify-center shrink-0">
                                        <X className="h-3.5 w-3.5" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="pt-8">
                            <Button className="w-full h-12 rounded-xl bg-slate-800 text-white font-black uppercase tracking-widest hover:bg-slate-700" onClick={() => router.push('/dashboard')}>
                                Continue Free
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="bg-slate-900/60 border-primary/30 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-primary/10 scale-105 border-2">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-20">
                            Most Popular
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                        <CardHeader className="pb-8 relative z-10">
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                Pro Career
                                <Sparkles className="h-5 w-5 text-primary" />
                            </CardTitle>
                            <CardDescription className="text-primary/80 font-bold">Everything you need to get hired</CardDescription>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tighter">$19</span>
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">/ month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            {[
                                "Unlimited AI Resumes",
                                "Unlimited AI Interview Practice",
                                "Access to All Premium Templates",
                                "Cover Letter Generator",
                                "LinkedIn Profile Optimization",
                                "Priority Support",
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-3 text-white font-bold">
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="pt-8 relative z-10">
                            <Button
                                className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                                onClick={handleUpgrade}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    "Upgrade to Pro"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
