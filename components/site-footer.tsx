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
        <footer className="border-t border-[#c9d8d0] bg-[#102b2b] text-[#f8f4ec]">
            {/* Newsletter Section */}
            <div className="border-b border-white/10">
                <div className="container mx-auto px-6 py-16 md:px-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center bg-[#d8f36b] text-[#102b2b]">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="mb-4 text-2xl font-semibold md:text-3xl">
                            A better application starts with one useful idea.
                        </h3>
                        <p className="mx-auto mb-8 max-w-2xl text-[#a6c0b8]">
                            Get practical career notes, product updates, and templates worth keeping.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 flex-1 rounded-none border-white/20 bg-white/10 text-white placeholder:text-[#a6c0b8]"
                                required
                            />
                            <Button type="submit" className="h-12 rounded-none bg-[#d8f36b] px-8 font-semibold text-[#102b2b] hover:bg-[#e5ff8b]">
                                Subscribe
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                        <p className="mt-4 text-xs text-[#7f9c93]">
                            No spam. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-6 py-12 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
                            <div className="flex h-9 w-9 items-center justify-center bg-[#d8f36b] text-[#102b2b]">
                                <span className="text-base font-extrabold">R</span>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight">ResumeForge<span className="text-[#d8f36b]">.</span></span>
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-[#a6c0b8]">
                            A calmer, sharper way to build the materials that move your career forward.
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
                            <li><Link href="/dashboard/resume" className="transition-colors hover:text-[#d8f36b]">Resume builder</Link></li>
                            <li><Link href="/dashboard/optimize" className="transition-colors hover:text-[#d8f36b]">ATS optimizer</Link></li>
                            <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/dashboard/interview-prep" className="transition-colors hover:text-[#d8f36b]">Interview prep</Link></li>
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
                    <p className="text-sm text-[#7f9c93]">
                        © {new Date().getFullYear()} ResumeForge. All rights reserved.
                    </p>
                    <p className="text-sm text-[#7f9c93]">
                        Built for ambitious people in motion.
                    </p>
                </div>
            </div>
        </footer>
    );
}
