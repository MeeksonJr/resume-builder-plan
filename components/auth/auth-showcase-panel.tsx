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

export function AuthShowcasePanel() {
  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-[#183a34] bg-gradient-to-b from-[#0a1919] via-[#091515] to-[#050e0e] p-8 lg:p-12 text-[#f8faf8] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      
      {/* Background Radial Glow & Mesh Aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[480px] w-[480px] rounded-full bg-[#0d8274]/20 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 h-[440px] w-[440px] rounded-full bg-[#d8f36b]/10 blur-[90px]" />
        <div className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#085a50]/25 blur-[80px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(216,243,107,0.3) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top Header & Brand */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#20b2aa]/40 bg-gradient-to-br from-[#0d8274] to-[#084e45] shadow-[0_4px_16px_rgba(13,130,116,0.35)]">
            <span className="font-sans text-xl font-black tracking-tight text-[#d8f36b]">RF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                ResumeForge<span className="text-[#d8f36b]">.</span>
              </span>
              <span className="rounded-full border border-[#d8f36b]/30 bg-[#d8f36b]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d8f36b]">
                Enterprise AI
              </span>
            </div>
            <p className="text-xs font-medium text-[#7ea89f]">
              AI Career Studio & Campus Talent Network
            </p>
          </div>
        </div>
      </div>

      {/* Center 3D Glowing Orb & Floating Cards */}
      <div className="relative my-8 flex flex-col items-center justify-center">
        
        {/* 3D Glowing Orb (Inspired by Image 5) */}
        <div className="relative flex items-center justify-center py-4">
          {/* Outer Pulsing Aura */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-48 w-48 rounded-full bg-gradient-to-tr from-[#0d8274]/50 to-[#d8f36b]/30 blur-2xl"
          />

          {/* Orbiting Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute h-56 w-56 rounded-full border border-dashed border-[#0d8274]/40"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute h-64 w-64 rounded-full border border-[#d8f36b]/20"
          />

          {/* The 3D Sphere */}
          <motion.div
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[#20b2aa]/40 bg-gradient-to-br from-[#0d332e] via-[#081f1b] to-[#040f0d] shadow-[inset_0_10px_25px_rgba(216,243,107,0.3),0_15px_35px_rgba(0,0,0,0.8)]"
          >
            {/* Inner Glint & Reflection */}
            <div className="absolute top-2 left-6 h-8 w-12 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-[3px]" />
            <div className="flex flex-col items-center justify-center">
              <Sparkles className="h-8 w-8 text-[#d8f36b] drop-shadow-[0_0_12px_rgba(216,243,107,0.8)]" />
              <span className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-[#7ea89f]">
                AI CORE
              </span>
            </div>
          </motion.div>
        </div>

        {/* Floating ATS Score Card (Inspired by Image 3) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-2 w-full max-w-sm rounded-2xl border border-[#1c4740] bg-[#0c201e]/85 p-4 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#183a34]">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d8274]/30 text-[#d8f36b]">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">ATS Real-time Scanner</div>
                <div className="text-[10px] text-[#7ea89f]">Software Engineer & Cloud Targets</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#d8f36b]/30 bg-[#d8f36b]/10 px-2.5 py-1">
              <Zap className="h-3 w-3 text-[#d8f36b]" />
              <span className="text-xs font-black text-[#d8f36b]">96% Match</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#8bbcb2]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#d8f36b]" /> 18 High-Impact Keywords
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-[#20b2aa]" /> Recruiter Verified
            </span>
          </div>
        </motion.div>

        {/* Progressive Onboarding Steps (Inspired by OnlyPipe Image 1 & 2) */}
        <div className="mt-6 w-full max-w-sm space-y-2.5">
          <div className="flex items-center gap-3 rounded-xl border border-[#20b2aa]/40 bg-[#0d2a26] px-4 py-2.5 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d8f36b] text-[10px] font-black text-[#081211]">
              1
            </span>
            <span className="text-xs font-bold text-white">Create your workspace account</span>
            <span className="ml-auto text-[10px] font-semibold text-[#d8f36b]">Active</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#163630] bg-[#091817]/70 px-4 py-2.5 opacity-75">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#163833] text-[10px] font-bold text-[#8bbcb2]">
              2
            </span>
            <span className="text-xs font-medium text-[#8bbcb2]">Connect your campus cohort</span>
            <GraduationCap className="ml-auto h-3.5 w-3.5 text-[#52716a]" />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#163630] bg-[#091817]/70 px-4 py-2.5 opacity-75">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#163833] text-[10px] font-bold text-[#8bbcb2]">
              3
            </span>
            <span className="text-xs font-medium text-[#8bbcb2]">Launch AI resume & mock interviews</span>
            <TrendingUp className="ml-auto h-3.5 w-3.5 text-[#52716a]" />
          </div>
        </div>

      </div>

      {/* Bottom Footer Trust Badges */}
      <div className="relative z-10 border-t border-[#163833] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#7ea89f]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#d8f36b]" />
            <span>FERPA & SOC-2 Student Data Privacy</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Campus Network Online</span>
          </div>
        </div>
      </div>

    </div>
  );
}
