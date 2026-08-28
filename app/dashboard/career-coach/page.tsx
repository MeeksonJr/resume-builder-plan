import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CareerCoachContent } from "@/components/dashboard/career/career-coach-content";
import { SkillsGapContent } from "@/components/dashboard/career/skills-gap-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BrainCircuit } from "lucide-react";

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
        <div className="min-h-full bg-[#e9eee8] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-5 border-b border-[#102b2b]/15 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">Career intelligence</p>
                    <h1 className="text-3xl font-bold tracking-tight text-[#102b2b] sm:text-4xl">AI Career Coach</h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#102b2b]/65 sm:text-base">Turn your target role into a practical roadmap with focused, evidence-based next steps.</p>
                </div>
            </div>

            <Tabs defaultValue="roadmap" className="w-full space-y-6">
                <TabsList className="mb-4 flex flex-wrap h-auto w-full gap-2 border-b border-[#102b2b]/15 bg-transparent p-0 pb-3">
                    <TabsTrigger value="roadmap" className="h-10 shrink-0 gap-2 rounded-full border border-[#102b2b]/15 bg-white px-4 text-xs sm:text-sm font-bold text-[#102b2b]/65 transition-all data-[state=active]:border-transparent data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#d8f36b] hover:bg-[#102b2b]/5 shadow-sm">
                        <Target className="h-4 w-4" />
                        Career Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="skills-gap" className="h-10 shrink-0 gap-2 rounded-full border border-[#102b2b]/15 bg-white px-4 text-xs sm:text-sm font-bold text-[#102b2b]/65 transition-all data-[state=active]:border-transparent data-[state=active]:bg-[#102b2b] data-[state=active]:text-[#d8f36b] hover:bg-[#102b2b]/5 shadow-sm">
                        <BrainCircuit className="h-4 w-4" />
                        Skills Gap Audit
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
            </Tabs>
            </div>
        </div>
    );
}
