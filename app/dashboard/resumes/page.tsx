import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, MoreHorizontal, Eye, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ResumesFilterBar } from "@/components/dashboard/resumes-filter-bar"
import { DuplicateResumeAction, AnalyticsLinkAction } from "@/components/dashboard/resume-actions"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ImportResumeButton } from "@/components/dashboard/import-resume-button"

export const metadata = {
    title: "All Resumes | ResumeForge",
    description: "View and manage all your resumes",
}

export default async function AllResumesPage({
    searchParams,
}: {
    searchParams: Promise<{ template?: string; sort?: string; search?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch all resumes
    const { data: resumes } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: params.sort === "oldest" })

    // Get unique templates for filter
    const templates = [...new Set(resumes?.map(r => r.template || "modern") || [])]

    // Apply client-side filtering
    let filteredResumes = resumes || []

    if (params.template && params.template !== "all") {
        filteredResumes = filteredResumes.filter(r => (r.template || "modern") === params.template)
    }

    if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredResumes = filteredResumes.filter(r =>
            r.title?.toLowerCase().includes(searchLower)
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-1 py-2 sm:px-0">
            {/* Header */}
            <div className="flex flex-col gap-5 border-b border-[#102b2b]/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">Resume library</p>
                    <h1 className="text-4xl font-black tracking-[-0.04em] text-[#102b2b] sm:text-5xl">All resumes</h1>
                    <p className="mt-2 max-w-xl text-sm text-[#102b2b]/65 sm:text-base">
                        Keep every tailored version ready for the next opportunity.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ImportResumeButton />
                    <Button asChild className="min-h-11 rounded-none bg-[#d8f36b] px-5 font-bold text-[#102b2b] shadow-none hover:bg-[#c9e95c]">
                        <Link href="/dashboard/resume/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Resume
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters - Client-side for interactivity */}
            <ResumesFilterBar templates={templates} />

            {/* Resume Count */}
            <div className="flex items-center gap-2 text-sm font-medium text-[#102b2b]/65">
                <FileText className="h-4 w-4 text-[#0d8274]" aria-hidden="true" />
                <span>{filteredResumes.length} resume{filteredResumes.length !== 1 ? 's' : ''}</span>
                {params.search && <span className="text-primary">matching &quot;{params.search}&quot;</span>}
            </div>

            {/* Resumes Grid */}
            {resumes && resumes.length === 0 && !params.search && !params.template ? (
                <EmptyState />
            ) : filteredResumes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResumes.map((resume) => (
                        <Card key={resume.id} className="group relative overflow-hidden rounded-none border-[#102b2b]/15 bg-[#f5f7f1] shadow-none transition-colors hover:border-[#0d8274]">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <CardTitle className="line-clamp-2 text-base font-bold leading-tight text-[#102b2b]" title={resume.title || "Untitled Resume"}>
                                            {resume.title || "Untitled Resume"}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-[#102b2b]/55">
                                            Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" aria-label={`More actions for ${resume.title || "Untitled Resume"}`} className="relative z-10 h-9 w-9 shrink-0 rounded-none text-[#102b2b] hover:bg-[#d8f36b]">
                                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/resume/${resume.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Open
                                                </Link>
                                            </DropdownMenuItem>
                                            <AnalyticsLinkAction resumeId={resume.id} />
                                            <DuplicateResumeAction resumeId={resume.id} />
                                            {resume.is_public && resume.slug && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/r/${resume.slug}`} target="_blank">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View Public Link
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary" className="rounded-none bg-[#102b2b] text-xs capitalize text-[#f5f7f1]">
                                        {resume.template || "modern"}
                                    </Badge>
                                    {resume.is_public && (
                                        <Badge variant="outline" className="rounded-none border-[#0d8274]/35 bg-[#0d8274]/10 text-xs text-[#0d8274]">
                                            Public
                                        </Badge>
                                    )}
                                    {resume.is_base && (
                                        <Badge variant="outline" className="rounded-none border-[#102b2b]/20 bg-[#102b2b]/5 text-xs text-[#102b2b]/70">
                                            Base
                                        </Badge>
                                    )}
                                </div>
                                <Link
                                    href={`/dashboard/resume/${resume.id}`}
                                    className="absolute inset-0 z-0"
                                    aria-label={`Open ${resume.title || "Untitled Resume"}`}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-none border-dashed border-[#102b2b]/20 bg-[#f5f7f1] py-12 text-center shadow-none">
                    <CardContent>
                        <FileText className="mx-auto mb-4 h-12 w-12 text-[#0d8274]" aria-hidden="true" />
                        <h3 className="mb-2 text-lg font-bold text-[#102b2b]">
                            {params.search ? "No resumes found" : "No resumes match filters"}
                        </h3>
                        <p className="mb-4 text-[#102b2b]/65">
                            {params.search
                                ? `No resumes matching "${params.search}".`
                                : "Try adjusting your filters or search terms."
                            }
                        </p>
                        {!!params.search && (
                            <Button asChild variant="outline" className="rounded-none border-[#102b2b]/25 text-[#102b2b] hover:bg-[#d8f36b]">
                                <Link href="/dashboard/resumes">Clear Search</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
