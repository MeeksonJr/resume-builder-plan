"use client";

import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Mail, Plus, LogOut, User, Settings, Menu, LayoutDashboard, Briefcase, Globe, Sparkles, Download, TrendingUp, Brain } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface DashboardNavProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 glass-border border-b bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
              <FileText className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="hidden text-xl font-heading font-black tracking-tight sm:inline gradient-text">
              ResumeForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
              )}
            >
              My Resumes
              {pathname === "/dashboard" && (
                <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/cover-letters"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname?.startsWith("/dashboard/cover-letters") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Cover Letters
              {pathname?.startsWith("/dashboard/cover-letters") && (
                <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/tracker"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname?.startsWith("/dashboard/tracker") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Job Tracker
              {pathname?.startsWith("/dashboard/tracker") && (
                <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/portfolio"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname?.startsWith("/dashboard/portfolio") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Portfolio
              {pathname?.startsWith("/dashboard/portfolio") && (
                <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/career-coach"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                pathname?.startsWith("/dashboard/career-coach") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Career Coach
              {pathname?.startsWith("/dashboard/career-coach") && (
                <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/import"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                pathname?.startsWith("/dashboard/import") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Download className="h-3.5 w-3.5" />
              Import
              {pathname?.startsWith("/dashboard/import") && (
                <span className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/optimize"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                pathname?.startsWith("/dashboard/optimize") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Optimize
              {pathname?.startsWith("/dashboard/optimize") && (
                <span className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/dashboard/interview-prep"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                pathname?.startsWith("/dashboard/interview-prep") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Brain className="h-3.5 w-3.5" />
              Interview Prep
              {pathname?.startsWith("/dashboard/interview-prep") && (
                <span className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-primary" />
              )}
            </Link>
            <Link
              href="/portfolios"
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 text-primary/80",
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              Discover
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden min-h-[44px] gap-2 sm:flex">
            <Link href="/dashboard/resume/new">
              <Plus className="h-4 w-4" />
              New Resume
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div >

      {/* Mobile Menu */}
      {
        mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Resumes
              </Link>
              <Link
                href="/dashboard/cover-letters"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cover Letters
              </Link>
              <Link
                href="/dashboard/tracker"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Job Tracker
              </Link>
              <Link
                href="/dashboard/portfolio"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Career Portfolio
              </Link>
              <Link
                href="/dashboard/career-coach"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                AI Career Coach
              </Link>
              <Link
                href="/dashboard/import"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Download className="h-4 w-4" />
                Smart Import
              </Link>
              <Link
                href="/dashboard/optimize"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                Optimize Resume
              </Link>
              <Link
                href="/dashboard/interview-prep"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Brain className="h-4 w-4" />
                Interview Prep
              </Link>
              <Link
                href="/portfolios"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe className="h-4 w-4" />
                Discover Portfolios
              </Link>
              <Button asChild size="sm" className="mt-2 min-h-[44px] gap-2">
                <Link href="/dashboard/resume/new">
                  <Plus className="h-4 w-4" />
                  New Resume
                </Link>
              </Button>
            </nav>
          </div>
        )
      }
    </header >
  );
}
