"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, SortAsc } from "lucide-react"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ResumesFilterBarProps {
    templates: string[]
}

export function ResumesFilterBar({ templates }: ResumesFilterBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentSearch = searchParams.get("search") || ""
    const currentTemplate = searchParams.get("template") || "all"
    const currentSort = searchParams.get("sort") || "newest"

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all" && value !== "newest") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const search = formData.get("search") as string
        updateParams("search", search)
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    name="search"
                    placeholder="Search resumes..."
                    defaultValue={currentSearch}
                    className="pl-9 glass-border"
                />
            </form>

            <div className="flex gap-2">
                <Select value={currentTemplate} onValueChange={(v) => updateParams("template", v)}>
                    <SelectTrigger className="w-[140px] glass-border">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Templates</SelectItem>
                        {templates.map(template => (
                            <SelectItem key={template} value={template}>
                                {template.charAt(0).toUpperCase() + template.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
                    <SelectTrigger className="w-[130px] glass-border">
                        <SortAsc className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
