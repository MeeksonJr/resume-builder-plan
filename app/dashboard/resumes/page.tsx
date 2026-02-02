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
        <div className="container mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Resumes</h1>
                    <p className="text-muted-foreground">
                        Manage and organize all your resumes in one place.
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-br from-primary to-primary/80 font-bold">
                    <Link href="/dashboard/resume/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Resume
                    </Link>
                </Button>
            </div>

            {/* Filters - Client-side for interactivity */}
            <ResumesFilterBar templates={templates} />

            {/* Resume Count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{filteredResumes.length} resume{filteredResumes.length !== 1 ? 's' : ''}</span>
                {params.search && <span className="text-primary">matching &quot;{params.search}&quot;</span>}
            </div>

            {/* Resumes Grid */}
            {filteredResumes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResumes.map((resume) => (
                        <Card key={resume.id} className="group relative hover:shadow-lg transition-shadow overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <CardTitle className="text-base font-semibold line-clamp-2 leading-tight" title={resume.title || "Untitled Resume"}>
                                            {resume.title || "Untitled Resume"}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 relative z-10">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/resume/${resume.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Open
                                                </Link>
                                            </DropdownMenuItem>
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
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {resume.template || "modern"}
                                    </Badge>
                                    {resume.is_public && (
                                        <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-500/10">
                                            Public
                                        </Badge>
                                    )}
                                    {resume.is_base && (
                                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-500/10">
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
                <Card className="text-center py-12">
                    <CardContent>
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {params.search ? "No resumes found" : "No resumes yet"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {params.search
                                ? `No resumes matching "${params.search}".`
                                : "Create your first resume to get started."
                            }
                        </p>
                        {!params.search && (
                            <Button asChild>
                                <Link href="/dashboard/resume/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Resume
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
