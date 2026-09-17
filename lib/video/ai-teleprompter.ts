/**
 * ResumeForge AI Teleprompter & Eye-Contact Coach Engine (Phase 70)
 * Provides speech-rate synchronized auto-scrolling and real-time gaze / eye-contact feedback
 * during 60-second video elevator pitch recordings.
 */

export interface TeleprompterSection {
  id: string;
  label: string;
  targetSecondsStart: number;
  targetSecondsEnd: number;
  text: string;
  keyPhrases: string[];
}

export interface TeleprompterPacingAnalysis {
  targetWpm: number;
  actualWpm: number;
  totalWords: number;
  estimatedDurationSeconds: number;
  scrollSpeedPxPerSec: number;
  cadenceStatus: "Too Slow" | "Optimal" | "Slightly Fast" | "Too Fast";
}

export interface EyeContactMetric {
  scorePercentage: number; // 0 - 100%
  gazeState: "direct-eye-contact" | "looking-down" | "drifting-left" | "drifting-right";
  feedbackMessage: string;
  isOptimalGaze: boolean;
}

export interface TeleprompterPreset {
  id: string;
  title: string;
  role: string;
  defaultWpm: number;
  sections: TeleprompterSection[];
}

/**
 * Parses any candidate summary or pitch script into the standard 3-stage 60-second elevator pitch framework.
 */
export function segmentPitchScript(script: string): TeleprompterSection[] {
  const trimmed = script.trim();
  if (!trimmed) {
    return [
      {
        id: "sec-1",
        label: "Hook & Identity",
        targetSecondsStart: 0,
        targetSecondsEnd: 15,
        text: "Hi, I'm a software engineer dedicated to building scalable distributed systems.",
        keyPhrases: ["Software engineer", "Scalable systems"],
      },
      {
        id: "sec-2",
        label: "Core Impact & Metric",
        targetSecondsStart: 15,
        targetSecondsEnd: 45,
        text: "Recently, I architected high-throughput microservices reducing p99 latency by 35% and saving over $180k annually.",
        keyPhrases: ["35% latency reduction", "$180k annual savings"],
      },
      {
        id: "sec-3",
        label: "Call to Action",
        targetSecondsStart: 45,
        targetSecondsEnd: 60,
        text: "I'm excited to bring this passion for engineering velocity to your mission-critical team. Let's connect!",
        keyPhrases: ["Engineering velocity", "Let's connect"],
      },
    ];
  }

  const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
  const total = sentences.length;

  if (total <= 2) {
    return [
      {
        id: "sec-1",
        label: "Hook & Identity",
        targetSecondsStart: 0,
        targetSecondsEnd: 20,
        text: sentences[0].trim(),
        keyPhrases: ["Hook"],
      },
      {
        id: "sec-2",
        label: "Impact & Value",
        targetSecondsStart: 20,
        targetSecondsEnd: 60,
        text: sentences.slice(1).join(" ").trim() || sentences[0].trim(),
        keyPhrases: ["Impact"],
      },
    ];
  }

  const split1 = Math.max(1, Math.floor(total * 0.25));
  const split2 = Math.max(split1 + 1, Math.floor(total * 0.75));

  const introText = sentences.slice(0, split1).join(" ").trim();
  const bodyText = sentences.slice(split1, split2).join(" ").trim();
  const ctaText = sentences.slice(split2).join(" ").trim();

  return [
    {
      id: "sec-1",
      label: "Hook & Identity (0-15s)",
      targetSecondsStart: 0,
      targetSecondsEnd: 15,
      text: introText,
      keyPhrases: ["Intro", "Hook"],
    },
    {
      id: "sec-2",
      label: "Core Achievement & Metrics (15-45s)",
      targetSecondsStart: 15,
      targetSecondsEnd: 45,
      text: bodyText,
      keyPhrases: ["Metrics", "Execution"],
    },
    {
      id: "sec-3",
      label: "Value Add & Call to Action (45-60s)",
      targetSecondsStart: 45,
      targetSecondsEnd: 60,
      text: ctaText,
      keyPhrases: ["Next Steps", "Connect"],
    },
  ];
}

/**
 * Calculates teleprompter scroll physics and pacing analysis.
 */
export function calculateTeleprompterPacing(
  scriptText: string,
  targetDurationSec: number = 60,
  targetWpm: number = 145,
  lineHeightPx: number = 28,
  wordsPerLine: number = 7
): TeleprompterPacingAnalysis {
  const words = scriptText.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const estimatedDurationSeconds = (totalWords / Math.max(targetWpm, 60)) * 60;
  const actualWpm = targetDurationSec > 0 ? Math.round((totalWords / targetDurationSec) * 60) : 0;

  // Scroll speed computation
  const estimatedLines = Math.ceil(totalWords / wordsPerLine);
  const totalContentHeightPx = estimatedLines * lineHeightPx;
  const scrollSpeedPxPerSec = totalContentHeightPx / Math.max(targetDurationSec, 10);

  let cadenceStatus: TeleprompterPacingAnalysis["cadenceStatus"] = "Optimal";
  if (actualWpm < 115) {
    cadenceStatus = "Too Slow";
  } else if (actualWpm > 175) {
    cadenceStatus = "Too Fast";
  } else if (actualWpm > 155) {
    cadenceStatus = "Slightly Fast";
  }

  return {
    targetWpm,
    actualWpm,
    totalWords,
    estimatedDurationSeconds: Math.round(estimatedDurationSeconds),
    scrollSpeedPxPerSec: Number(scrollSpeedPxPerSec.toFixed(2)),
    cadenceStatus,
  };
}

/**
 * Evaluates candidate gaze coordinates to measure eye-contact with camera lens.
 * Normalized coordinates: X in [0, 1] (0.5 = center), Y in [0, 1] (0.5 = camera eye line).
 */
export function evaluateEyeContact(
  gazeX: number,
  gazeY: number,
  previousScore: number = 95
): EyeContactMetric {
  // Center is optimal: X between 0.40 and 0.60, Y between 0.35 and 0.55
  const isOptimalGaze =
    gazeX >= 0.40 && gazeX <= 0.60 && gazeY >= 0.35 && gazeY <= 0.55;

  let gazeState: EyeContactMetric["gazeState"] = "direct-eye-contact";
  let feedbackMessage = "Direct eye contact maintained. Great confidence and presence!";
  let penalty = 0;

  if (gazeY > 0.60) {
    gazeState = "looking-down";
    feedbackMessage = "Looking down at keyboard or notes. Look directly into the camera lens!";
    penalty = 4;
  } else if (gazeX < 0.35) {
    gazeState = "drifting-left";
    feedbackMessage = "Gaze drifting left. Re-center focus on the top camera indicator.";
    penalty = 2;
  } else if (gazeX > 0.65) {
    gazeState = "drifting-right";
    feedbackMessage = "Gaze drifting right. Re-center focus on the top camera indicator.";
    penalty = 2;
  }

  const updatedScore = Math.max(
    40,
    Math.min(100, Math.round(previousScore + (isOptimalGaze ? 1 : -penalty)))
  );

  return {
    scorePercentage: updatedScore,
    gazeState,
    feedbackMessage,
    isOptimalGaze,
  };
}

/**
 * Ready-to-record industry teleprompter presets for instant practice.
 */
export const TELEPROMPTER_PRESETS: TeleprompterPreset[] = [
  {
    id: "preset-fullstack",
    title: "Full Stack Systems Engineer",
    role: "Full Stack Engineer",
    defaultWpm: 145,
    sections: [
      {
        id: "p-fs-1",
        label: "Hook & Identity (0-15s)",
        targetSecondsStart: 0,
        targetSecondsEnd: 15,
        text: "Hi, I'm Mohamed Lamine Datt. I'm a full-stack engineer who builds responsive web platforms and AI-driven workflows.",
        keyPhrases: ["Full-stack engineer", "AI-driven workflows"],
      },
      {
        id: "p-fs-2",
        label: "Core Impact & Metrics (15-45s)",
        targetSecondsStart: 15,
        targetSecondsEnd: 45,
        text: "At PM Accelerator, I integrated Google Gemini and automated multi-channel analytics pipelines, scaling data processing throughput by 40% while maintaining rock-solid 99.9% reliability.",
        keyPhrases: ["40% throughput increase", "99.9% reliability", "Gemini AI"],
      },
      {
        id: "p-fs-3",
        label: "Call to Action (45-60s)",
        targetSecondsStart: 45,
        targetSecondsEnd: 60,
        text: "I thrive on transforming complex engineering requirements into seamless user experiences. Let's connect and build together!",
        keyPhrases: ["Transforming requirements", "Let's connect"],
      },
    ],
  },
  {
    id: "preset-cloud",
    title: "Cloud & Distributed Systems Architect",
    role: "Staff Infrastructure Engineer",
    defaultWpm: 140,
    sections: [
      {
        id: "p-cl-1",
        label: "Hook & Architecture (0-15s)",
        targetSecondsStart: 0,
        targetSecondsEnd: 15,
        text: "Hi, I'm Alex. Over the past 7 years, I've designed fault-tolerant distributed platforms and Kubernetes infrastructure at enterprise scale.",
        keyPhrases: ["Fault-tolerant platforms", "Kubernetes scale"],
      },
      {
        id: "p-cl-2",
        label: "Cost & Performance Wins (15-45s)",
        targetSecondsStart: 15,
        targetSecondsEnd: 45,
        text: "I led the migration of 40 microservices to zero-trust service mesh architecture, slashing p99 latency by 35% and trimming $180,000 in monthly cloud infrastructure costs.",
        keyPhrases: ["35% p99 latency cut", "$180,000 monthly savings"],
      },
      {
        id: "p-cl-3",
        label: "Mission Alignment (45-60s)",
        targetSecondsStart: 45,
        targetSecondsEnd: 60,
        text: "I believe engineering velocity and operational resilience go hand in hand. I'd love to help accelerate your core systems roadmap.",
        keyPhrases: ["Operational resilience", "Accelerate roadmap"],
      },
    ],
  },
];
