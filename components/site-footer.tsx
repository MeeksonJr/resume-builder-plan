"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Twitter, Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement newsletter signup
        console.log("Newsletter signup:", email);
        setEmail("");
    };

    return (
        <footer className="bg-slate-950 border-t border-white/10">
            {/* Newsletter Section */}
            <div className="border-b border-white/10">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-6">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Stay Updated
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                            Get career tips, product updates, and exclusive interview prep strategies delivered to your inbox weekly.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                                required
                            />
                            <Button type="submit" className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-semibold">
                                Subscribe
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                        <p className="text-xs text-slate-500 mt-4">
                            No spam. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
                            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                                <span className="font-extrabold text-base">G</span>
                                <span className="text-xs text-amber-300 ml-0.5 -mt-2">✦</span>
                            </div>
                            <span className="text-white lowercase font-extrabold tracking-tight text-2xl">grantly<span className="text-indigo-400">.ai</span></span>
                        </Link>
                        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                            AI-powered funding for your future. Find scholarships, grants, and fellowship opportunities tailored to your profile.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Funding & Tools</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/#scholarships" className="hover:text-indigo-400 transition-colors">Scholarship Matcher</Link></li>
                            <li><Link href="/#grants" className="hover:text-indigo-400 transition-colors">Grants & Aid</Link></li>
                            <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog & Guides</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Grantly. All rights reserved. Your money for college, matched.
                    </p>
                    <p className="text-sm text-slate-500">
                        Built with ✦ for ambitious students & scholars
                    </p>
                </div>
            </div>
        </footer>
    );
}
