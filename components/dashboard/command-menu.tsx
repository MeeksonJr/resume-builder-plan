"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Briefcase,
    LayoutDashboard,
    Settings,
    User,
    Sparkles,
    Plus,
    ArrowRight,
    Loader2,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Simple debounce implementation inside effect
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        if (!query) {
            setResults([])
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from("portfolios")
                .select("full_name, slug, tagline, avatar_url, user_id, profiles:user_id(avatar_url)")
                .or(`full_name.ilike.%${query}%,tagline.ilike.%${query}%`)
                .eq("is_public", true)
                .limit(5)

            if (!error && data) {
                setResults(data)
            }
            setLoading(false)
        }

        const timeoutId = setTimeout(fetchResults, 300)
        return () => clearTimeout(timeoutId)
    }, [query, supabase])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput 
                placeholder="Type a command or search candidates..." 
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="glass border-none">
                <CommandEmpty>
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                            <span className="text-muted-foreground">Searching...</span>
                        </div>
                    ) : (
                        "No results found."
                    )}
                </CommandEmpty>
                
                {results.length > 0 && (
                    <>
                        <CommandGroup heading="Candidates">
                            {results.map((portfolio) => (
                                <CommandItem
                                    key={portfolio.user_id}
                                    onSelect={() => runCommand(() => router.push(`/p/${portfolio.slug}`))}
                                    className="rounded-lg"
                                >
                                    <Avatar className="mr-2 h-6 w-6">
                                        <AvatarImage src={portfolio.avatar_url || portfolio.profiles?.avatar_url} />
                                        <AvatarFallback className="text-[10px]">
                                            {(portfolio.full_name?.[0] || "U").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{portfolio.full_name}</span>
                                        {portfolio.tagline && (
                                            <span className="text-[10px] text-muted-foreground line-clamp-1">
                                                {portfolio.tagline}
                                            </span>
                                        )}
                                    </div>
                                    <CommandShortcut>
                                        <ArrowRight className="h-3 w-3 opacity-50" />
                                    </CommandShortcut>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="bg-primary/5" />
                    </>
                )}

                <CommandGroup heading="Suggestions">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard"))}
                        className="rounded-lg"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <CommandShortcut>G D</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/resume/new"))}
                        className="rounded-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Resume</span>
                        <CommandShortcut>N R</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/tracker"))}
                        className="rounded-lg"
                    >
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Job Tracker</span>
                        <CommandShortcut>G T</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator className="bg-primary/5" />
                <CommandGroup heading="AI Tools">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/career-coach"))}
                        className="rounded-lg"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Career Coach</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/optimize"))}
                        className="rounded-lg"
                    >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>Optimize Resume</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator className="bg-primary/5" />
                <CommandGroup heading="Settings">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/profile"))}
                        className="rounded-lg"
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                        className="rounded-lg"
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
