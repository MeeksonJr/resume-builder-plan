"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Sparkles,
  GraduationCap,
  Cpu,
  Check,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "email" | "autopilot" | "university" | "background" | "system";
  read: boolean;
  link?: string;
}

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "code-init",
      title: "Academic Verification Dispatcher Active",
      description: "Direct email verification codes configured for university network enrollment.",
      time: "Recent",
      type: "email",
      read: false,
      link: "/dashboard/portal/verify",
    },
    {
      id: "swarm-init",
      title: "Autonomous Career Agent",
      description: "Background worker monitored active listings & indexed matched roles.",
      time: "2h ago",
      type: "autopilot",
      read: false,
      link: "/dashboard/autopilot",
    },
    {
      id: "univ-init",
      title: "Campus Knowledge Engine",
      description: "Synchronized university department directory and verified student network.",
      time: "Today",
      type: "university",
      read: false,
      link: "/dashboard/portal",
    },
    {
      id: "ats-init",
      title: "Background ATS Optimizer",
      description: "Completed resume analysis against 2026 hiring benchmarks.",
      time: "Today",
      type: "background",
      read: true,
      link: "/dashboard/optimize",
    },
  ]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch live notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount ?? data.notifications.filter((n: any) => !n.read).length);
        }
      }
    } catch (e) {
      // Use fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications", { method: "POST" });
    } catch {}
    toast.success("All notifications marked as read");
  };

  const handleSendDigestEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch("/api/notifications/send-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Notification digest sent to your email!");
      } else {
        toast.error(data.error || "Failed to send digest email");
      }
    } catch (err: any) {
      toast.error("Network error sending digest email");
    } finally {
      setSendingEmail(false);
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "autopilot":
        return <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case "university":
        return <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
      case "background":
        return <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="h-10 w-10 text-muted-foreground hover:text-foreground relative rounded-none transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-none border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider uppercase text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge className="h-5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-1.5 font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 transition-colors ${
                !item.read ? "bg-muted/20" : "opacity-80 hover:opacity-100"
              } hover:bg-muted/40`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-none p-1.5 bg-muted/60 border border-border shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-foreground truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline mt-1.5"
                    >
                      <span>View details</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Send update to email */}
        <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">
            Keep updated on the go
          </span>
          <Button
            size="sm"
            onClick={handleSendDigestEmail}
            disabled={sendingEmail}
            className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-none px-3 gap-1.5 cursor-pointer shadow-sm"
          >
            {sendingEmail ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send update to email</span>
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
