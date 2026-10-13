"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  ExternalLink,
  BookOpen,
  GraduationCap,
  School,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

interface Message {
  sender: "user" | "assistant";
  text: string;
  links?: { label: string; url: string; badge?: string }[];
  timestamp: string;
}

interface CampusAiAssistantWidgetProps {
  schoolSlug: string;
  schoolName: string;
}

export function CampusAiAssistantWidget({
  schoolSlug,
  schoolName,
}: CampusAiAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: `Hello! I am your **${schoolName} Academic & Career AI Co-Pilot**.\n\nI am fed directly with our latest collegiate intelligence:\n- **Google Scholar**: Faculty research publications & lab leads\n- **Colleges & Universities API**: Guaranteed admission agreements (ODU, UVA, Virginia Tech)\n- **SchoolDigger K-12**: Regional feeder high school dual-enrollment pipelines\n\nAsk me anything about transfer pathways, faculty publications, dual credit, or alumni mentorship!`,
      links: [
        { label: "Faculty Research (Google Scholar)", url: "#research", badge: "Research Hub" },
        { label: "GAA Transfer Guide", url: "#transfer", badge: "Colleges API" },
        { label: "Feeder High Schools", url: "#feeders", badge: "SchoolDigger" },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/university/${schoolSlug}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          sender: "assistant",
          text: data.answer || "I processed your request with the collegiate registry.",
          links: data.suggestedLinks,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error("Assistant response error");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `I'm having trouble connecting to the institutional intelligence server right now. Please try again or check the respective research and transfer tabs above.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What faculty research is happening in Cybersecurity or Marine Sciences?",
    "What are the transfer agreements for Computer Science to ODU and Virginia Tech?",
    "Which regional high schools offer dual-enrollment credits here?",
    "How can I book a session with an alumni mentor?",
  ];

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col h-[700px]">
      <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{schoolName} AI Academic Assistant</span>
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  Online
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time reasoning across Google Scholar, Colleges API, and SchoolDigger records
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([messages[0]])}
            className="h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Reset Chat
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.sender === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 mt-1">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm space-y-3 leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-primary text-primary-foreground font-medium rounded-tr-none ml-auto"
                  : "bg-muted/50 border border-border/80 text-foreground rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>

              {m.links && m.links.length > 0 && (
                <div className="pt-2 border-t border-border/50 flex flex-wrap gap-2">
                  {m.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-semibold text-primary hover:border-primary transition-colors shadow-xs"
                    >
                      {link.badge && (
                        <span className="text-[9px] uppercase font-bold text-muted-foreground">
                          {link.badge}:
                        </span>
                      )}
                      <span>{link.label}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}

              <p
                className={`text-[10px] text-right ${
                  m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {m.timestamp}
              </p>
            </div>

            {m.sender === "user" && (
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-secondary text-secondary-foreground border border-border mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-3 bg-muted/40 border border-border/60">
              Analyzing institutional publications, transfer articulation, and feeder records...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </CardContent>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t border-border/60 bg-muted/10 overflow-x-auto scrollbar-none flex gap-2">
        {samplePrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="whitespace-nowrap rounded-lg border border-border/80 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <CardFooter className="p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 w-full"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${schoolName} research, transfer GAA, or dual credits...`}
            className="h-11 rounded-xl border-input bg-background text-xs sm:text-sm"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
