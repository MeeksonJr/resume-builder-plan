"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2, Mail, User, MessageSquare, FileText } from "lucide-react";

interface ContactFormProps {
  portfolioId: string;
  accentColor?: string;
  /** Visual variant to match the hosting template */
  variant?: "dark" | "light";
}

export function ContactForm({ portfolioId, accentColor = "#3b82f6", variant = "dark" }: ContactFormProps) {
  const [fields, setFields] = useState({ sender_name: "", sender_email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isDark = variant === "dark";

  const inputCls = `w-full rounded-none border px-4 py-3 text-sm font-medium outline-none transition-all placeholder:opacity-50 focus:ring-2 ${
    isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10"
      : "border-[#102b2b]/15 bg-white text-[#102b2b] placeholder:text-[#102b2b]/40 focus:border-[#102b2b]/40 focus:ring-[#102b2b]/10"
  }`;

  const labelCls = `mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/50" : "text-[#102b2b]/50"}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/portfolio/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_id: portfolioId, ...fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to send. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <CheckCircle className="h-10 w-10" style={{ color: accentColor }} />
        </div>
        <div className="space-y-2">
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-[#102b2b]"}`}>
            Message sent!
          </p>
          <p className={`text-sm font-medium ${isDark ? "text-white/50" : "text-[#102b2b]/55"}`}>
            Thanks for reaching out. I&apos;ll get back to you soon.
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); setFields({ sender_name: "", sender_email: "", subject: "", message: "" }); }}
          className="text-xs font-black uppercase tracking-widest underline opacity-50 hover:opacity-80"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>
            <User className="h-3 w-3" />
            Your Name
          </label>
          <input
            className={inputCls}
            placeholder="Jane Smith"
            value={fields.sender_name}
            onChange={(e) => setFields({ ...fields, sender_name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelCls}>
            <Mail className="h-3 w-3" />
            Email Address
          </label>
          <input
            type="email"
            className={inputCls}
            placeholder="jane@company.com"
            value={fields.sender_email}
            onChange={(e) => setFields({ ...fields, sender_email: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          <FileText className="h-3 w-3" />
          Subject <span className="opacity-50">(optional)</span>
        </label>
        <input
          className={inputCls}
          placeholder="Collaboration opportunity"
          value={fields.subject}
          onChange={(e) => setFields({ ...fields, subject: e.target.value })}
        />
      </div>

      <div>
        <label className={labelCls}>
          <MessageSquare className="h-3 w-3" />
          Message
        </label>
        <textarea
          className={`${inputCls} min-h-[140px] resize-none`}
          placeholder="Tell me about your project or how I can help..."
          value={fields.message}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
          required
          rows={5}
        />
      </div>

      {status === "error" && (
        <p className="rounded-none border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex h-12 w-full items-center justify-center gap-2.5 font-black uppercase tracking-widest text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: accentColor, color: "#fff" }}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
