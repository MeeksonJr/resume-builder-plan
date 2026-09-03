"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ResumesFilterBarProps {
    templates: string[];
}

export function ResumesFilterBar({ templates }: ResumesFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("search") || "";
    const currentTemplate = searchParams.get("template") || "all";
    const currentSort = searchParams.get("sort") || "newest";

    const [searchValue, setSearchValue] = useState(currentSearch);

    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value && value !== "all" && value !== "newest") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateParams({ search: searchValue.trim() || null });
    };

    const handleClearSearch = () => {
        setSearchValue("");
        updateParams({ search: null });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input with quick submit and clear button */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    name="search"
                    placeholder="Search by resume title or role..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9 pr-8 h-10 rounded-none border-neutral-300 bg-white font-medium text-neutral-900 focus-visible:ring-1 focus-visible:ring-[#102b2b]"
                />
                {searchValue && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                        title="Clear search"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </form>

            {/* Template & Sort Filters */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {/* Template Filter */}
                <Select
                    value={currentTemplate}
                    onValueChange={(v) => updateParams({ template: v })}
                >
                    <SelectTrigger className="w-[150px] h-10 rounded-none border-neutral-300 bg-white text-xs font-bold text-neutral-800 focus:ring-1 focus:ring-[#102b2b]">
                        <Filter className="h-3.5 w-3.5 mr-1.5 text-[#0d8274]" />
                        <SelectValue placeholder="All Templates" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-neutral-200">
                        <SelectItem value="all" className="text-xs font-bold">
                            All Templates
                        </SelectItem>
                        {templates.map((template) => (
                            <SelectItem
                                key={template}
                                value={template}
                                className="text-xs capitalize font-medium"
                            >
                                {template}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort Filter */}
                <Select
                    value={currentSort}
                    onValueChange={(v) => updateParams({ sort: v })}
                >
                    <SelectTrigger className="w-[140px] h-10 rounded-none border-neutral-300 bg-white text-xs font-bold text-neutral-800 focus:ring-1 focus:ring-[#102b2b]">
                        <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-neutral-500" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-neutral-200">
                        <SelectItem value="newest" className="text-xs font-bold">
                            Newest First
                        </SelectItem>
                        <SelectItem value="oldest" className="text-xs font-medium">
                            Oldest First
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Filters button if any filter active */}
                {(currentSearch || currentTemplate !== "all" || currentSort !== "newest") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchValue("");
                            router.push(pathname);
                        }}
                        className="h-10 px-2.5 text-xs text-neutral-500 hover:text-neutral-900 rounded-none"
                    >
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
