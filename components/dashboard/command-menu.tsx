"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
    Briefcase,
    LayoutDashboard,
    Settings,
    User,
    Sparkles,
    Plus,
    ArrowRight,
    Loader2,
    GraduationCap,
    Users,
    Store,
    BookOpen,
    Send,
    Bot,
    Compass,
    CheckCircle2,
    Coins,
    Sun,
    Moon,
    Laptop,
    CreditCard,
    FileText,
    ShieldCheck,
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
import { toast } from "sonner"

export function CommandMenu() {
    const [mounted, setMounted] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()
    const { setTheme } = useTheme()
    const supabase = createClient()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Key listener for Ctrl+K / Cmd+K and custom trigger events
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        const handleCustomOpen = () => setOpen(true)
        window.addEventListener("open-command-palette", handleCustomOpen)
        document.addEventListener("keydown", down)

        return () => {
            window.removeEventListener("open-command-palette", handleCustomOpen)
            document.removeEventListener("keydown", down)
        }
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

        const timeoutId = setTimeout(fetchResults, 250)
        return () => clearTimeout(timeoutId)
    }, [query, supabase])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    if (!mounted) return null;

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            className="sm:max-w-2xl md:max-w-3xl border-border bg-card/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden"
        >
            <div className="relative border-b border-border">
                <CommandInput 
                    placeholder="Type a command, search pages, AI tools, or campus portals..." 
                    value={query}
                    onValueChange={setQuery}
                    className="h-14 text-sm font-medium px-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
            </div>

            <CommandList className="max-h-[440px] overflow-y-auto p-2 scroll-smooth">
                <CommandEmpty>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2.5" />
                            <span className="text-sm font-medium text-muted-foreground">Searching workspace...</span>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No commands or candidates found matching &quot;{query}&quot;.
                        </div>
                    )}
                </CommandEmpty>
                
                {results.length > 0 && (
                    <>
                        <CommandGroup heading="Candidates & Portfolios">
                            {results.map((portfolio) => (
                                <CommandItem
                                    key={portfolio.user_id}
                                    onSelect={() => runCommand(() => router.push(`/p/${portfolio.slug}`))}
                                    className="rounded-none cursor-pointer py-2.5 px-3 hover:bg-muted/60 transition-colors"
                                >
                                    <Avatar className="mr-3 h-7 w-7 border border-border">
                                        <AvatarImage src={portfolio.avatar_url || portfolio.profiles?.avatar_url} />
                                        <AvatarFallback className="text-[10px] font-bold">
                                            {(portfolio.full_name?.[0] || "U").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-sm text-foreground">{portfolio.full_name}</span>
                                        {portfolio.tagline && (
                                            <span className="text-[11px] text-muted-foreground truncate">
                                                {portfolio.tagline}
                                            </span>
                                        )}
                                    </div>
                                    <CommandShortcut>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                                    </CommandShortcut>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="my-1.5 bg-border/60" />
                    </>
                )}

                {/* ─── UNIVERSITY & CAMPUS NETWORK ─── */}
                <CommandGroup heading="University & Campus Portal">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/portal"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <GraduationCap className="mr-3 h-4 w-4 text-[#0d8274]" />
                        <span className="font-medium text-foreground">University Campus Portal</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">U P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/network"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Users className="mr-3 h-4 w-4 text-teal-600" />
                        <span className="font-medium text-foreground">Cohort Directory & Student Network</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">U N</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/marketplace"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Store className="mr-3 h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-foreground">Student Project Marketplace</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/settings/university"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <BookOpen className="mr-3 h-4 w-4 text-indigo-600" />
                        <span className="font-medium text-foreground">Canvas LMS Integration &amp; Courses</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">C V</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1.5 bg-border/60" />

                {/* ─── AI COPILOT & AUTOMATION ─── */}
                <CommandGroup heading="Autonomous AI & Career Hub">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/autopilot"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Bot className="mr-3 h-4 w-4 text-violet-600" />
                        <span className="font-medium text-foreground">Autonomous Job Swarm &amp; Autopilot</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">A P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/auto-apply"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Send className="mr-3 h-4 w-4 text-fuchsia-600" />
                        <span className="font-medium text-foreground">Auto-Apply Dispatcher &amp; Job Queues</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/career-coach"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Sparkles className="mr-3 h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">AI Career Coach &amp; Strategy</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">C C</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/optimize"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <CheckCircle2 className="mr-3 h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-foreground">ATS Resume Optimizer</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">A T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/interview"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Compass className="mr-3 h-4 w-4 text-blue-600" />
                        <span className="font-medium text-foreground">Interactive Mock Interview Prep</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">I N</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/funding"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Coins className="mr-3 h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-foreground">Scholarships, Grants &amp; Academic Funding</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1.5 bg-border/60" />

                {/* ─── RESUMES & APPLICATIONS ─── */}
                <CommandGroup heading="Resumes & Applications">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-foreground/80" />
                        <span className="font-medium text-foreground">Dashboard Overview</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">G D</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/resume/new"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Plus className="mr-3 h-4 w-4 text-[#0d8274]" />
                        <span className="font-medium text-foreground">Create New Resume</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">N R</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/resumes"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <FileText className="mr-3 h-4 w-4 text-foreground/80" />
                        <span className="font-medium text-foreground">All Resumes &amp; Documents</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/tracker"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Briefcase className="mr-3 h-4 w-4 text-foreground/80" />
                        <span className="font-medium text-foreground">Job Application Tracker</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">G T</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1.5 bg-border/60" />

                {/* ─── APPEARANCE & THEMES ─── */}
                <CommandGroup heading="Appearance & Themes">
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            setTheme("light")
                            toast.success("Switched to Light theme")
                        })}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Sun className="mr-3 h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">Light Mode</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            setTheme("dark")
                            toast.success("Switched to Dark theme")
                        })}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Moon className="mr-3 h-4 w-4 text-slate-400" />
                        <span className="font-medium text-foreground">Dark Mode</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            setTheme("system")
                            toast.success("Switched to System theme")
                        })}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Laptop className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">System Default</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1.5 bg-border/60" />

                {/* ─── SETTINGS & PREFERENCES ─── */}
                <CommandGroup heading="Settings & Account">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/profile"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <User className="mr-3 h-4 w-4 text-foreground/80" />
                        <span className="font-medium text-foreground">User Profile</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/settings/university"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <ShieldCheck className="mr-3 h-4 w-4 text-[#0d8274]" />
                        <span className="font-medium text-foreground">University &amp; School Verification</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">U V</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/subscription"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <CreditCard className="mr-3 h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">Subscription &amp; Pro Plan</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">S B</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                        className="rounded-none cursor-pointer py-2.5 px-3"
                    >
                        <Settings className="mr-3 h-4 w-4 text-foreground/80" />
                        <span className="font-medium text-foreground">General Settings</span>
                        <CommandShortcut className="font-mono text-[10px] bg-muted px-1.5 py-0.5 border border-border">S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
