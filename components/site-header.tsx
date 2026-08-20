"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

const navItems = [
    { name: "Scholarships", href: "/scholarships" },
    { name: "Grants & Aid", href: "/grants" },
    { name: "AI Matcher", href: "/dashboard" },
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
        <header className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300`}>
            <div className={`container mx-auto px-4 max-w-6xl`}>
                <div className={`${isScrolled ? "glass rounded-full py-2 px-6 shadow-indigo-950/40" : "bg-transparent py-4"} transition-all duration-300 flex items-center justify-between`}>
                    {/* Grantly Logo: G -> ✦ */}
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                            <span className="font-extrabold text-base tracking-tighter">G</span>
                            <span className="text-xs text-amber-300 ml-0.5 -mt-2">✦</span>
                        </div>
                        <span className="text-foreground lowercase font-extrabold tracking-tight text-2xl font-sans">
                            grantly
                            <span className="text-indigo-500 ml-0.5 inline-block text-xs font-mono font-medium uppercase tracking-widest px-1.5 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 align-middle">ai</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sign In
                        </Link>
                        <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold" asChild>
                            <Link href="/auth/sign-up">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="md:hidden absolute top-20 left-4 right-4 glass rounded-2xl p-6 flex flex-col gap-4 shadow-2xl origin-top"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-lg font-medium py-2 border-b border-white/10 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        <Button variant="outline" asChild className="w-full rounded-xl border-white/10 hover:bg-white/5">
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button asChild className="w-full rounded-xl shadow-lg shadow-primary/25">
                            <Link href="/auth/sign-up">Get Started</Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </header>
    );
}
