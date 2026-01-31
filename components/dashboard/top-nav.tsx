"use client"

import * as React from "react"
import { Search, Plus, Bell, Command, Sidebar as SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

export function TopNav() {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur-xl px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
            </div>

            <div className="flex flex-1 items-center justify-between gap-4 md:gap-8">
                <div className="flex flex-1 items-center gap-4">
                    <Button
                        variant="outline"
                        className="hidden h-10 w-full max-w-[400px] justify-start gap-3 rounded-xl border-primary/10 bg-primary/5 px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary md:flex"
                        onClick={() => {
                            // Trigger command menu
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                ctrlKey: true,
                                bubbles: true
                            });
                            document.dispatchEvent(event);
                        }}
                    >
                        <Search className="h-4 w-4" />
                        <span>Search anything...</span>
                        <Kbd className="ml-auto pointer-events-none select-none px-1.5 py-0.5 text-[10px] font-black tracking-widest bg-white/20">
                            CTRL K
                        </Kbd>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-10 w-10 text-muted-foreground"
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                ctrlKey: true,
                                bubbles: true
                            });
                            document.dispatchEvent(event);
                        }}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                    </Button>

                    <div className="h-6 w-px bg-primary/10 mx-1 hidden sm:block" />

                    <Button
                        className="hidden sm:flex h-10 gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 font-black text-xs tracking-tight border-none"
                        onClick={() => window.location.href = '/dashboard/resume/new'}
                    >
                        <Plus className="h-4 w-4" />
                        NEW RESUME
                    </Button>
                </div>
            </div>
        </header>
    )
}
