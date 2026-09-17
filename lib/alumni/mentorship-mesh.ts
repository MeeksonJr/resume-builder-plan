/**
 * ResumeForge — Enterprise Alumni Mentorship & Career Sponsorship Mesh (Phase 65)
 * 
 * Connects current students and candidates with verified alumni mentors at top tech companies.
 * Features automated referral matchmaking, mock interview booking, and sponsorship state machine.
 */

export type MentorshipTrack =
  | "Executive Referral Sponsorship"
  | "System Design Mock Interview"
  | "Resume & Portfolio Teardown"
  | "Executive Career Pathing"
  | "Early Career Transition";

export interface AlumniMentor {
  id: string;
  name: string;
  avatarUrl?: string;
  university: string;
  graduationYear: number;
  degree: string;
  currentCompany: string;
  currentRole: string;
  previousCompanies: string[];
  industry: string;
  mentorshipTracks: MentorshipTrack[];
  referralsGiven: number;
  isAcceptingMentees: boolean;
  availableTimeSlots: string[];
  bio: string;
  linkedInUrl: string;
}

export type MentorshipSessionStatus = "requested" | "confirmed" | "completed" | "cancelled";

export interface MentorshipSession {
  id: string;
  mentorId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  track: MentorshipTrack;
  targetRole: string;
  targetCompany: string;
  timeSlot: string;
  customNotes: string;
  status: MentorshipSessionStatus;
  meetingUrl?: string;
  createdAt: string;
}

/**
 * Calculates a match score (0-100) between an alumni mentor and candidate goals
 */
export function calculateAlumniMatchScore(
  alumni: AlumniMentor,
  targetCompany?: string,
  targetRole?: string,
  preferredTrack?: MentorshipTrack
): number {
  let score = 65; // baseline institutional affinity (same university/cohort)

  if (targetCompany) {
    const targetCompLower = targetCompany.toLowerCase().trim();
    if (alumni.currentCompany.toLowerCase().includes(targetCompLower)) {
      score += 25; // Exact current company match
    } else if (alumni.previousCompanies.some((c) => c.toLowerCase().includes(targetCompLower))) {
      score += 15; // Past company alumni match
    }
  }

  if (targetRole) {
    const targetRoleLower = targetRole.toLowerCase().trim();
    if (alumni.currentRole.toLowerCase().includes(targetRoleLower)) {
      score += 10;
    }
  }

  if (preferredTrack && alumni.mentorshipTracks.includes(preferredTrack)) {
    score += 10;
  }

  if (alumni.isAcceptingMentees) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Books a new mentorship / referral sponsorship session
 */
export function bookMentorshipSession(params: {
  mentorId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  track: MentorshipTrack;
  targetRole: string;
  targetCompany: string;
  timeSlot: string;
  customNotes: string;
}): MentorshipSession {
  return {
    id: `mesh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    mentorId: params.mentorId,
    studentId: params.studentId,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    track: params.track,
    targetRole: params.targetRole,
    targetCompany: params.targetCompany,
    timeSlot: params.timeSlot,
    customNotes: params.customNotes,
    status: "requested",
    meetingUrl: `https://meet.google.com/resumeforge-${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString()
  };
}

/**
 * State machine transition for mentorship session
 */
export function updateSessionStatus(
  session: MentorshipSession,
  newStatus: MentorshipSessionStatus
): MentorshipSession {
  return {
    ...session,
    status: newStatus
  };
}

/**
 * Curated sample alumni mentor registry
 */
export const SAMPLE_ALUMNI_MENTORS: AlumniMentor[] = [
  {
    id: "mentor-stanford-01",
    name: "Dr. Jason Chen",
    university: "Stanford University",
    graduationYear: 2018,
    degree: "B.S. & M.S. Computer Science",
    currentCompany: "Google DeepMind",
    currentRole: "Staff Research Engineer (GenAI Systems)",
    previousCompanies: ["Meta AI", "Uber ATG"],
    industry: "Artificial Intelligence & Large Models",
    mentorshipTracks: [
      "Executive Referral Sponsorship",
      "System Design Mock Interview",
      "Resume & Portfolio Teardown"
    ],
    referralsGiven: 34,
    isAcceptingMentees: true,
    availableTimeSlots: ["Thu 4:00 PM PST", "Fri 10:00 AM PST", "Sat 1:00 PM PST"],
    bio: "Passionate about helping Stanford CS cohorts navigate frontier AI research and engineering loops. Actively sponsoring top performers for DeepMind referrals.",
    linkedInUrl: "https://linkedin.com/in/jasonchen-demo"
  },
  {
    id: "mentor-stanford-02",
    name: "Samantha Wright",
    university: "Stanford University",
    graduationYear: 2020,
    degree: "B.S. Symbolic Systems",
    currentCompany: "Stripe",
    currentRole: "Engineering Manager (Global Payment Rails)",
    previousCompanies: ["Square / Block", "Goldman Sachs"],
    industry: "FinTech & Distributed Infrastructure",
    mentorshipTracks: [
      "Executive Referral Sponsorship",
      "Executive Career Pathing",
      "Resume & Portfolio Teardown"
    ],
    referralsGiven: 28,
    isAcceptingMentees: true,
    availableTimeSlots: ["Tue 5:30 PM PST", "Wed 12:00 PM PST"],
    bio: "Scaled payments processing to tens of billions in annual volume. Mentoring future engineering leaders on navigating promo cycles and referrals at Stripe.",
    linkedInUrl: "https://linkedin.com/in/samanthawright-demo"
  },
  {
    id: "mentor-stanford-03",
    name: "Arjun Patel",
    university: "Stanford University",
    graduationYear: 2019,
    degree: "B.S. Electrical Engineering & CS",
    currentCompany: "Apple",
    currentRole: "Senior Hardware & Firmware Architect",
    previousCompanies: ["Tesla Autopilot", "NVIDIA"],
    industry: "Hardware Acceleration & Edge Computing",
    mentorshipTracks: [
      "System Design Mock Interview",
      "Early Career Transition",
      "Executive Referral Sponsorship"
    ],
    referralsGiven: 19,
    isAcceptingMentees: false,
    availableTimeSlots: ["Mon 6:00 PM PST"],
    bio: "Specializes in low-level kernel performance and edge neural engines. Dedicated to connecting aspiring systems engineers with team leads at Apple.",
    linkedInUrl: "https://linkedin.com/in/arjunpatel-demo"
  }
];
