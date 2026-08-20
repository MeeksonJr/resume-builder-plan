import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Sparkles, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: "Subscription | ResumeForge",
    description: "Manage your subscription and billing details.",
};

export default async function SubscriptionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, stripe_current_period_end, stripe_price_id")
        .eq("id", user.id)
        .single();

    const isPro = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
    const endDate = profile?.stripe_current_period_end
        ? new Date(profile.stripe_current_period_end).toLocaleDateString()
        : null;

    return (
        <div className="space-y-7">
            <div className="border-b border-border pb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Account workspace</p>
                <h1 className="text-3xl font-heading font-black tracking-tight text-foreground sm:text-4xl">
                    Subscription & Billing
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Manage your plan, billing details, and invoices.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Current Plan Card */}
                <Card className="relative flex flex-col overflow-hidden rounded-none border-border bg-card shadow-[4px_4px_0_rgba(16,43,43,0.06)]">
                    {isPro && (
                        <div className="absolute right-0 top-0 flex items-center gap-1.5 border-b border-l border-primary/20 bg-primary/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground">
                            <Sparkles className="w-3.5 h-3.5" />
                            Active Plan
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            {isPro ? "Pro Plan" : "Free Starter"}
                            {isPro && <Badge className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">PRO</Badge>}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {isPro
                                ? "You have full access to all premium features."
                                : "Upgrade to unlock unlimited AI reviews and more."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                    <div className={`p-2 ${isPro ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Subscription Status</p>
                                    <p className={`text-sm ${isPro ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                                        {profile?.subscription_status === 'active' ? 'Active' :
                                            profile?.subscription_status === 'trialing' ? 'Trial Active' :
                                                'Inactive / Free'}
                                    </p>
                                </div>
                            </div>

                            {isPro && endDate && (
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/15 p-2 text-primary">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Current Period Ends</p>
                                        <p className="text-sm text-muted-foreground">{endDate}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Plan Features</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Unlimited AI Resume Reviews</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Mock Interview Voice Mode</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>ATS Score Optimization</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className={`h-4 w-4 ${isPro ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    <span className={isPro ? '' : 'text-muted-foreground'}>Public Portfolio Hosting</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border bg-muted/30 pt-6">
                        <form action={isPro ? "/api/stripe/portal" : "/api/stripe/checkout"} method={isPro ? "POST" : "GET"} className="w-full">
                            <Button className="h-11 w-full rounded-none font-black" variant={isPro ? "outline" : "default"}>
                                {isPro ? "Manage Billing" : "Upgrade to Pro"}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>

                {/* Value Prop / Upsell Card (if free) or Usage Stats (if pro) */}
                {!isPro ? (
                    <Card className="rounded-none border-white/15 bg-[#102b2b] text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                Why Upgrade?
                            </CardTitle>
                            <CardDescription className="text-white/70">
                                Invest in your career with professional tools.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                                <p className="text-white/80">
                                Job seekers who use AI optimization get <strong>3x more interviews</strong> on average. Our Pro plan gives you the edge you need.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    "Unlimited Resumes",
                                    "Cover Letter AI",
                                    "LinkedIn Optimization",
                                    "Priority Support"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2 border border-white/15 bg-white/5 p-3 text-sm font-medium text-white/80">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="rounded-none border-border shadow-none">
                        <CardHeader>
                            <CardTitle>Usage Statistics</CardTitle>
                            <CardDescription>Your activity this billing period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="font-medium">Resumes Created</span>
                                    <span className="font-bold">Unlimited</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="font-medium">AI Analysis Runs</span>
                                    <span className="font-bold">Unlimited</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Mock Interviews</span>
                                    <span className="font-bold">Unlimited</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
