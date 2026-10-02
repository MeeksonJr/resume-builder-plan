"use client";

import React from "react";
import { motion } from "framer-motion";

interface LiquidWaveProps {
  className?: string;
  opacity?: number;
  direction?: "left" | "right";
}

export function LiquidWaveBackground({ className = "", opacity = 0.25 }: LiquidWaveProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Liquid Caustic Glow Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-1/4 left-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#0d8274]/35 to-[#20b2aa]/20 blur-[80px]"
      />

      <motion.div
        animate={{
          scale: [1.2, 0.95, 1.2],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-1/4 right-1/4 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-[#084e45]/40 via-[#d8f36b]/15 to-transparent blur-[90px]"
      />

      {/* Undulating SVG Waves */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full"
        style={{ opacity, height: "180px", minWidth: "800px" }}
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="liquidGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d8274" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#20b2aa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d8f36b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="liquidGrad2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#084e45" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#0d8274" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#163833" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Wave Layer 1 */}
        <motion.path
          fill="url(#liquidGrad1)"
          animate={{
            d: [
              "M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,280L1392,280C1344,280,1248,280,1152,280C1056,280,960,280,864,280C768,280,672,280,576,280C480,280,384,280,288,280C192,280,96,280,48,280L0,280Z",
              "M0,64L48,80C96,96,192,128,288,149.3C384,171,480,181,576,165.3C672,149,768,107,864,112C960,117,1056,171,1152,181.3C1248,192,1344,160,1392,144L1440,128L1440,280L1392,280C1344,280,1248,280,1152,280C1056,280,960,280,864,280C768,280,672,280,576,280C480,280,384,280,288,280C192,280,96,280,48,280L0,280Z",
              "M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,280L1392,280C1344,280,1248,280,1152,280C1056,280,960,280,864,280C768,280,672,280,576,280C480,280,384,280,288,280C192,280,96,280,48,280L0,280Z",
            ],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave Layer 2 */}
        <motion.path
          fill="url(#liquidGrad2)"
          animate={{
            d: [
              "M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,280L1392,280C1344,280,1248,280,1152,280C1056,280,960,280,864,280C768,280,672,280,576,280C480,280,384,280,288,280C192,280,96,280,48,280L0,280Z",
              "M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,280L1392,280C1344,280,1248,280,1152,280C1056,280,960,280,864,280C768,280,672,280,576,280C480,280,384,280,288,280C192,280,96,280,48,280L0,280Z",
              "M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,280L1392,280C1344,280,1248,280,1152,280C1056,280,960,280,864,280C768,280,672,280,576,280C480,280,384,280,288,280C192,280,96,280,48,280L0,280Z",
            ],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}
