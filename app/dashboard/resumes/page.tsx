import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Globe, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ResumesFilterBar } from "@/components/dashboard/resumes-filter-bar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ResumeLibraryCard } from "@/components/dashboard/resume-library-card";
import { ResumesHeaderActions, ResumesPlanBanner } from "@/components/dashboard/resumes-header-actions";
import { getUserPlanTier, PLAN_LIMITS } from "@/lib/security/plan-gates";

export const metadata = {
    title: "All Resumes | ResumeForge",
    description: "Manage, rename, tailor, and track your resumes",
};

export default async function AllResumesPage({
    searchParams,
}: {
    searchParams: Promise<{ template?: string; sort?: string; search?: string }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch user profile for plan tier checking
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, subscription_status")
        .eq("id", user.id)
        .maybeSingle();

    const planTier = getUserPlanTier(profile);
    const isPro = planTier === "pro";

    // Fetch all resumes for the user
    const { data: resumes } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: params.sort === "oldest" });

    const totalCount = resumes?.length || 0;
    const canCreateResume = isPro || totalCount < PLAN_LIMITS.free.maxResumes;
    const publicCount = resumes?.filter((r) => r.is_public).length || 0;
    const totalViews = resumes?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0;
    const mostRecent = resumes?.[0];

    // Get unique templates for filter
    const templates = [
        ...new Set(
            resumes?.map((r) => r.template_id || r.template || "modern").filter(Boolean) || []
        ),
    ];

    // Apply client-side filtering
    let filteredResumes = resumes || [];

    if (params.template && params.template !== "all") {
        filteredResumes = filteredResumes.filter(
            (r) => (r.template_id || r.template || "modern") === params.template
        );
    }

    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredResumes = filteredResumes.filter((r) =>
            r.title?.toLowerCase().includes(searchLower)
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-2 sm:px-4 py-4">
            {/* Plan Quota Banner for Free Users */}
            <ResumesPlanBanner isPro={isPro} totalCount={totalCount} />

            {/* Editorial Header */}
            <div className="flex flex-col gap-6 border-b border-[#102b2b]/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-[#0d8274]" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">
                            Document Hub
                        </p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-[#102b2b] sm:text-5xl">
                        All Resumes
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-[#102b2b]/70 sm:text-base">
                        Organize, rename, tailor, and track each specialized version of your resume.
                    </p>
                </div>

                {/* Primary Action Buttons */}
                <ResumesHeaderActions
                    canCreate={canCreateResume}
                    isPro={isPro}
                    totalCount={totalCount}
                />
            </div>

            {/* Quick KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
                <div className="border border-[#102b2b]/10 bg-[#f9faf6] p-4 flex items-center gap-3.5 min-w-0 overflow-hidden">
                    <div className="h-10 w-10 rounded-none bg-[#102b2b] text-white flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-[#d8f36b]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 truncate">
                            Total Resumes
                        </p>
                        <p className="text-2xl font-black text-[#102b2b]">{totalCount}</p>
                    </div>
                </div>

                <div className="border border-[#102b2b]/10 bg-[#f9faf6] p-4 flex items-center gap-3.5 min-w-0 overflow-hidden">
                    <div className="h-10 w-10 rounded-none bg-emerald-700 text-white flex items-center justify-center shrink-0">
                        <Globe className="h-5 w-5 text-emerald-200" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 truncate">
                            Public Links Live
                        </p>
                        <p className="text-2xl font-black text-[#102b2b]">{publicCount}</p>
                    </div>
                </div>

                <div className="border border-[#102b2b]/10 bg-[#f9faf6] p-4 flex items-center gap-3.5 min-w-0 overflow-hidden">
                    <div className="h-10 w-10 rounded-none bg-[#0d8274] text-white flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-[#f8f4ec]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 truncate">
                            Cumulative Views
                        </p>
                        <p className="text-2xl font-black text-[#102b2b]">{totalViews}</p>
                    </div>
                </div>

                <div className="border border-[#102b2b]/10 bg-[#f9faf6] p-4 flex items-center gap-3.5 min-w-0 overflow-hidden">
                    <div className="h-10 w-10 rounded-none bg-neutral-800 text-white flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-neutral-300" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 truncate">
                            Latest Activity
                        </p>
                        <p className="text-sm font-bold text-[#102b2b] truncate">
                            {mostRecent
                                ? formatDistanceToNow(new Date(mostRecent.updated_at), { addSuffix: true })
                                : "None"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <ResumesFilterBar templates={templates} />

            {/* Resume Results Counter */}
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 pt-1">
                <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#0d8274]" />
                    <span>
                        Showing {filteredResumes.length} of {totalCount} resume
                        {totalCount !== 1 ? "s" : ""}
                    </span>
                    {params.search && (
                        <span className="text-neutral-900 font-bold">
                            matching &ldquo;{params.search}&rdquo;
                        </span>
                    )}
                </div>
            </div>

            {/* Resumes Grid */}
            {resumes && resumes.length === 0 && !params.search && !params.template ? (
                <EmptyState />
            ) : filteredResumes.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                    {filteredResumes.map((resume) => (
                        <ResumeLibraryCard key={resume.id} resume={resume} />
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-neutral-300 p-12 text-center bg-neutral-50">
                    <p className="text-sm font-bold text-neutral-700">No matching resumes found</p>
                    <p className="text-xs text-neutral-500 mt-1">
                        Try adjusting your search query or template filters.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-4 rounded-none border-neutral-300"
                    >
                        <Link href="/dashboard/resumes">Clear Filters</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
