"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  CheckSquare, 
  Plus, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavDock() {
  const pathname = usePathname();

  // Don't render inside full-screen resume editor or print pages if applicable
  if (pathname.includes("/resumes/") && pathname.includes("/edit")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Resumes",
      href: "/dashboard/resumes",
      icon: FileText,
      isActive: pathname.startsWith("/dashboard/resumes"),
    },
    {
      label: "Jobs",
      href: "/dashboard/jobs",
      icon: Briefcase,
      isActive: pathname.startsWith("/dashboard/jobs"),
    },
    {
      label: "Campus",
      href: "/dashboard/portal",
      icon: GraduationCap,
      isActive: pathname.startsWith("/dashboard/portal"),
    },
    {
      label: "Track",
      href: "/dashboard/applications",
      icon: CheckSquare,
      isActive: pathname.startsWith("/dashboard/applications"),
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card/95 dark:bg-[#090d16]/95 backdrop-blur-2xl border-t border-border/80 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 select-none touch-manipulation min-w-[56px]",
                item.isActive 
                  ? "text-primary font-bold" 
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", item.isActive && "scale-110")} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
