"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, CheckCircle2 } from "lucide-react";

interface AuthTabBarProps {
  activeTab?: "login" | "signup" | "confirm";
}

export function AuthTabBar({ activeTab }: AuthTabBarProps) {
  const pathname = usePathname();

  const currentTab =
    activeTab ||
    (pathname.includes("sign-up") || pathname.includes("signup")
      ? "signup"
      : pathname.includes("confirm-email")
      ? "confirm"
      : "login");

  const tabs = [
    { id: "login", label: "Sign In", href: "/auth/login", icon: LogIn },
    { id: "signup", label: "Create Account", href: "/auth/sign-up", icon: UserPlus },
    { id: "confirm", label: "Confirm Email", href: "/auth/confirm-email", icon: CheckCircle2 },
  ];

  return (
    <div className="relative mb-6 flex w-full items-center rounded-xl bg-[#091515]/90 p-1.5 border border-[#163833] shadow-inner">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              isActive ? "text-[#081211]" : "text-[#7ea89f] hover:text-[#e4f3ef]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeAuthTabPill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#d8f36b] to-[#bce84c] shadow-[0_2px_12px_rgba(216,243,107,0.35)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative z-20 h-4 w-4 shrink-0" />
            <span className="relative z-20 whitespace-nowrap">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
