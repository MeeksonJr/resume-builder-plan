"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navItems = [
    { name: "Resume builder", href: "/dashboard/resume" },
    { name: "Career tools", href: "/dashboard" },
    { name: "Templates", href: "/dashboard/resumes" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
];

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    return (
        <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 transition-all duration-300">
            <div className="container mx-auto max-w-7xl">
                <div className={`${isScrolled ? "border-[#102b2b]/10 bg-[#f8f4ec]/95 shadow-lg backdrop-blur" : "border-transparent bg-transparent"} flex items-center justify-between border px-4 py-3 transition-all duration-300 md:px-6`}>
                    <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-[-.04em] text-[#102b2b] group">
                        <span className="flex h-8 w-8 items-center justify-center bg-[#102b2b] text-sm font-bold text-[#d8f36b] transition-transform group-hover:-rotate-6">R</span>
                        <span>ResumeForge<span className="text-[#0d8274]">.</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-[#52716a] transition-colors duration-200 hover:text-[#102b2b]"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium text-[#52716a] transition-colors hover:text-[#102b2b]">
                            Sign In
                        </Link>
                        <Button size="sm" className="rounded-none bg-[#102b2b] px-5 font-semibold text-[#f8f4ec] hover:bg-[#164743]" asChild>
                            <Link href="/auth/sign-up">Start building <ArrowUpRight className="h-4 w-4" /></Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-nav-menu"
                        className="p-2 text-[#102b2b] hover:text-[#0d8274] md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    id="mobile-nav-menu"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute left-4 right-4 top-20 flex origin-top flex-col gap-4 border border-[#102b2b]/10 bg-[#f8f4ec] p-6 shadow-2xl md:hidden"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="border-b border-[#102b2b]/10 py-2 text-lg font-medium text-[#52716a] transition-colors hover:text-[#0d8274]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        <Button variant="outline" asChild className="w-full rounded-none border-[#102b2b]/20">
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button asChild className="w-full rounded-none bg-[#102b2b] text-[#f8f4ec]">
                            <Link href="/auth/sign-up">Start building</Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </header>
    );
}
