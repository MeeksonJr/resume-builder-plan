"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Mail, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";

const contactTopics = ["Product question", "Account help", "Feedback", "Partnership"];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus("sending");
        setError("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "We could not send your message.");
            }

            setStatus("success");
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (submitError) {
            setStatus("error");
            setError(submitError instanceof Error ? submitError.message : "We could not send your message.");
        }
    };

    return (
        <div className="min-h-screen bg-[#e9eee8] py-32 text-[#102b2b]">
            <div className="container mx-auto max-w-[1600px] px-6 md:px-10">
                <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 border border-[#0d8274]/20 bg-[#0d8274]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.16em] text-[#0d8274]">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Contact ResumeForge
                        </div>
                        <h1 className="max-w-lg text-5xl font-semibold leading-[.98] tracking-[-.06em] md:text-7xl">
                            Let&apos;s make the next step clearer.
                        </h1>
                        <p className="mt-7 max-w-md text-lg leading-relaxed text-[#52716a]">
                            Questions about your account, a feature idea, or a partnership worth exploring? Send a note and a real person will get back to you.
                        </p>

                        <div className="mt-12 space-y-5 border-t border-[#102b2b]/15 pt-7">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#d8f36b]"><Mail className="h-5 w-5" /></div>
                                <div><p className="font-semibold">Email us directly</p><a className="text-sm text-[#0d8274] hover:text-[#102b2b]" href="mailto:hello@resumeforge.ai">hello@resumeforge.ai</a></div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#102b2b]/15 bg-[#f8f4ec]"><CheckCircle2 className="h-5 w-5 text-[#0d8274]" /></div>
                                <div><p className="font-semibold">What to expect</p><p className="text-sm text-[#52716a]">Usually a reply within one business day.</p></div>
                            </div>
                        </div>

                        <Link href="/about" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#0d8274] hover:text-[#102b2b]">Learn how ResumeForge started <ArrowUpRight className="h-4 w-4" /></Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="border border-[#102b2b]/15 bg-[#f8f4ec] p-6 shadow-[18px_20px_0_rgba(16,43,43,.1)] md:p-10"
                    >
                        {status === "success" ? (
                            <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center bg-[#d8f36b]"><CheckCircle2 className="h-7 w-7" /></div>
                                <h2 className="text-3xl font-semibold tracking-[-.05em]">Message received.</h2>
                                <p className="mt-4 max-w-sm leading-relaxed text-[#52716a]">Thanks for reaching out. We&apos;ll read your note and get back to you as soon as we can.</p>
                                <Button className="mt-8 rounded-none bg-[#102b2b] text-[#f8f4ec] hover:bg-[#164743]" onClick={() => setStatus("idle")}>Send another message</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0d8274]">Start a conversation</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em]">How can we help?</h2></div>
                                {status === "error" && <div role="alert" className="border border-red-700/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" required className="h-12 rounded-none border-[#102b2b]/15 bg-white/60" /></div>
                                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required className="h-12 rounded-none border-[#102b2b]/15 bg-white/60" /></div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="subject">What can we help with?</Label><select id="subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required className="h-12 w-full rounded-none border border-[#102b2b]/15 bg-white/60 px-3 text-sm text-[#102b2b] focus:outline-none focus:ring-2 focus:ring-[#0d8274]/30"><option value="">Choose a topic</option>{contactTopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></div>
                                <div className="space-y-2"><Label htmlFor="message">Message</Label><Textarea id="message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us what you are working on..." required rows={7} className="resize-y rounded-none border-[#102b2b]/15 bg-white/60" /></div>
                                <Button type="submit" disabled={status === "sending"} className="h-12 w-full rounded-none bg-[#102b2b] font-semibold text-[#f8f4ec] hover:bg-[#164743]">{status === "sending" ? "Sending message..." : <>Send message <Send className="h-4 w-4" /></>}</Button>
                                <p className="text-xs leading-relaxed text-[#78928a]">We only use your details to reply to this message. No automated sales sequence.</p>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
