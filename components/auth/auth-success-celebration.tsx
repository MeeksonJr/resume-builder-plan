"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Rocket, ArrowRight } from "lucide-react";

interface AuthSuccessCelebrationProps {
  title?: string;
  subtitle?: string;
  destinationLabel?: string;
}

export function AuthSuccessCelebration({
  title = "Authentication Verified!",
  subtitle = "Preparing your AI career workspace and tailoring engine...",
  destinationLabel = "Entering Dashboard",
}: AuthSuccessCelebrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex min-h-[420px] w-full flex-col items-center justify-center p-8 text-center"
    >
      {/* Radiant Checkmark & Glow */}
      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-28 w-28 rounded-full bg-[#d8f36b]/30 blur-xl"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#d8f36b]/60 bg-gradient-to-br from-[#0d8274] to-[#0a4840] shadow-[0_10px_30px_rgba(216,243,107,0.3)]"
        >
          <CheckCircle2 className="h-10 w-10 text-[#d8f36b]" />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-black tracking-tight text-white sm:text-3xl"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-2 max-w-sm text-sm leading-relaxed text-[#7ea89f]"
      >
        {subtitle}
      </motion.p>

      {/* Animated Loading Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "100%" }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[#163833]"
      >
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#0d8274] via-[#d8f36b] to-[#0d8274]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#d8f36b]"
      >
        <Rocket className="h-3.5 w-3.5 animate-bounce" />
        <span>{destinationLabel}...</span>
      </motion.div>
    </motion.div>
  );
}
