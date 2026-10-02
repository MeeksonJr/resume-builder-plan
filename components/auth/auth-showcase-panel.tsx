"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { LiquidWaveBackground } from "./liquid-wave";

export function AuthShowcasePanel() {
  return (
    <div className="relative flex h-full min-h-[660px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0a2722]/95 via-[#061c18]/95 to-[#03100e]/95 p-8 lg:p-12 text-white shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)]">
      
      {/* Liquid Caustics & Waves */}
      <LiquidWaveBackground opacity={0.35} />

      {/* Top Header & Brand */}
      <div className="relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-400/60 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 shadow-[0_0_20px_rgba(13,130,116,0.6)]">
            <span className="font-sans text-2xl font-black tracking-tight text-[#d8f36b]">RF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white drop-shadow">
                ResumeForge<span className="text-[#d8f36b]">.</span>
              </span>
              <span className="rounded-full border border-[#d8f36b]/50 bg-[#d8f36b]/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#d8f36b]">
                Enterprise AI
              </span>
            </div>
            <p className="text-xs font-bold text-emerald-200">
              AI Career Studio &amp; Campus Talent Network
            </p>
          </div>
        </div>
      </div>

      {/* Center 3D Glowing Orb & Floating Cards */}
      <div className="relative my-8 flex flex-col items-center justify-center">
        
        {/* 3D Glowing Orb (Inspired by Image 5) */}
        <div className="relative flex items-center justify-center py-4">
          {/* Outer Pulsing Water Aura */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.85, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-52 w-52 rounded-full bg-gradient-to-tr from-emerald-500/70 via-teal-400/50 to-[#d8f36b]/35 blur-2xl"
          />

          {/* Fluid Orbiting Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute h-60 w-60 rounded-full border border-dashed border-teal-400/50"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute h-68 w-68 rounded-full border border-[#d8f36b]/40"
          />

          {/* 3D Sphere */}
          <motion.div
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-36 w-36 items-center justify-center rounded-full border border-teal-400/60 bg-gradient-to-br from-[#104840] via-[#0a2e28] to-[#041411] shadow-[inset_0_12px_30px_rgba(216,243,107,0.4),0_18px_45px_rgba(0,0,0,0.9)]"
          >
            {/* Water Highlight Glint */}
            <div className="absolute top-2.5 left-7 h-9 w-14 rounded-full bg-gradient-to-b from-white/40 to-transparent blur-[2px]" />
            <div className="flex flex-col items-center justify-center">
              <Sparkles className="h-9 w-9 text-[#d8f36b] drop-shadow-[0_0_16px_rgba(216,243,107,0.9)]" />
              <span className="mt-1 text-[11px] font-black uppercase tracking-widest text-[#d8f36b]">
                AI CORE
              </span>
            </div>
          </motion.div>
        </div>

        {/* Floating ATS Score Card (High Contrast) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-2 w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-[#092c26]/95 p-4 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/40 text-[#d8f36b] border border-teal-400/40">
                <FileCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-xs font-black text-white">ATS Real-time Scanner</div>
                <div className="text-[11px] font-bold text-emerald-200">Software Engineer &amp; Cloud Targets</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#d8f36b]/50 bg-[#d8f36b]/20 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-[#d8f36b]" />
              <span className="text-xs font-black text-[#d8f36b]">96% Match</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="h-4 w-4 text-[#d8f36b]" /> 18 High-Impact Keywords
            </span>
            <span className="flex items-center gap-1.5 text-teal-200">
              <Award className="h-4 w-4 text-teal-300" /> Recruiter Verified
            </span>
          </div>
        </motion.div>

        {/* Progressive Onboarding Steps (High Contrast) */}
        <div className="mt-6 w-full max-w-sm space-y-2.5">
          {/* Step 1 */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/60 bg-[#0e3b34] px-4 py-3 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d8f36b] text-xs font-black text-[#041210]">
              1
            </span>
            <span className="text-xs font-black text-white">Create your workspace account</span>
            <span className="ml-auto rounded-full bg-[#d8f36b]/25 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#d8f36b]">Active</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-800/50 bg-[#07241f]/90 px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-teal-400/50 bg-emerald-900 text-xs font-black text-[#d8f36b]">
              2
            </span>
            <span className="text-xs font-bold text-emerald-100">Connect your campus cohort</span>
            <GraduationCap className="ml-auto h-4 w-4 text-teal-300" />
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-800/50 bg-[#07241f]/90 px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-teal-400/50 bg-emerald-900 text-xs font-black text-[#d8f36b]">
              3
            </span>
            <span className="text-xs font-bold text-emerald-100">Launch AI resume &amp; mock interviews</span>
            <TrendingUp className="ml-auto h-4 w-4 text-teal-300" />
          </div>
        </div>

      </div>

      {/* Bottom Footer Trust Badges (High Contrast) */}
      <div className="relative z-10 border-t border-emerald-800/40 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#d8f36b]" />
            <span className="text-white">FERPA &amp; SOC-2 Student Data Privacy</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d8f36b] shadow-[0_0_10px_#d8f36b] animate-pulse" />
            <span className="text-white font-bold">Campus Network Online</span>
          </div>
        </div>
      </div>

    </div>
  );
}
