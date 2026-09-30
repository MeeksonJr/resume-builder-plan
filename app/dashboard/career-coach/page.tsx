import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CareerCoachContent } from "@/components/dashboard/career/career-coach-content";
import { SkillsGapContent } from "@/components/dashboard/career/skills-gap-content";
import { SalaryInsightsContent } from "@/components/dashboard/career/salary-insights-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BrainCircuit, Coins } from "lucide-react";

export default async function CareerCoachPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch profile for target role/industry
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        redirect("/dashboard");
    }

    // Fetch resumes to find primary or most recent
    const { data: resumes } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/20">
                        <Target className="h-3.5 w-3.5" />
                        <span>Career Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">AI Career Coach</h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Turn your target role into a practical roadmap with focused, evidence-based next steps.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="roadmap" className="w-full space-y-6">
                <TabsList className="flex flex-wrap h-auto w-full gap-2 border-b border-border bg-transparent p-0 pb-3 justify-start">
                    <TabsTrigger
                        value="roadmap"
                        className="h-10 shrink-0 gap-2 rounded-lg border border-border bg-card px-4 text-xs sm:text-sm font-semibold text-muted-foreground transition-all data-[state=active]:border-primary/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/80 shadow-xs"
                    >
                        <Target className="h-4 w-4" />
                        Career Roadmap
                    </TabsTrigger>
                    <TabsTrigger
                        value="skills-gap"
                        className="h-10 shrink-0 gap-2 rounded-lg border border-border bg-card px-4 text-xs sm:text-sm font-semibold text-muted-foreground transition-all data-[state=active]:border-primary/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/80 shadow-xs"
                    >
                        <BrainCircuit className="h-4 w-4" />
                        Skills Gap Audit
                    </TabsTrigger>
                    <TabsTrigger
                        value="salary-insights"
                        className="h-10 shrink-0 gap-2 rounded-lg border border-border bg-card px-4 text-xs sm:text-sm font-semibold text-muted-foreground transition-all data-[state=active]:border-primary/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/80 shadow-xs"
                    >
                        <Coins className="h-4 w-4" />
                        Salary Insights
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="roadmap" className="mt-0">
                    <CareerCoachContent
                        profile={profile}
                        resumes={resumes || []}
                    />
                </TabsContent>
                <TabsContent value="skills-gap" className="mt-0">
                    <SkillsGapContent
                        profile={profile}
                        resumes={resumes || []}
                    />
                </TabsContent>
                <TabsContent value="salary-insights" className="mt-0">
                    <SalaryInsightsContent
                        profile={profile}
                        resumes={resumes || []}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
