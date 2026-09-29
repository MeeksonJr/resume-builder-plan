export interface MemoryBasics {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar_url?: string;
}

export interface MemorySocials {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  youtube?: string;
  medium?: string;
  dribbble?: string;
  stackoverflow?: string;
  discord?: string;
  custom?: { label: string; url: string }[];
}

export interface MemoryExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  highlights: string[];
}

export interface MemoryEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  honors?: string;
  highlights: string[];
}

export interface MemorySkill {
  id: string;
  name: string;
  category: "Languages" | "Frameworks" | "Backend" | "Cloud & DevOps" | "Tools & Databases" | "Soft Skills" | "Other";
  proficiency: number; // 1 to 5
}

export interface MemoryProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github_url?: string;
  highlights: string[];
}

export interface MemoryCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface MemoryPreferences {
  target_roles: string[];
  work_style: "remote" | "hybrid" | "onsite" | "flexible";
  target_salary?: string;
  notice_period?: string;
  authorized_work_locations: string[];
}

export interface UserMemory {
  id?: string;
  user_id?: string;
  version: number;
  last_updated: string;
  sources: string[];
  basics: MemoryBasics;
  socials: MemorySocials;
  experiences: MemoryExperience[];
  education: MemoryEducation[];
  skills: MemorySkill[];
  projects: MemoryProject[];
  certifications: MemoryCertification[];
  preferences: MemoryPreferences;
}

export const DEFAULT_USER_MEMORY: UserMemory = {
  version: 1,
  last_updated: new Date().toISOString(),
  sources: ["Default Initialization"],
  basics: {
    full_name: "Alex Mercer",
    headline: "Senior Full-Stack & Distributed Systems Engineer",
    email: "alex.mercer@devforge.io",
    phone: "+1 (555) 382-9012",
    location: "San Francisco, CA (Remote Eligible)",
    bio: "Passionate engineer with 8+ years experience architecting fault-tolerant microservices, high-throughput streaming systems, and responsive modern web experiences with TypeScript, Next.js, and cloud native infrastructure.",
    avatar_url: "",
  },
  socials: {
    linkedin: "https://linkedin.com/in/alexmercer-dev",
    github: "https://github.com/alexmercer-io",
    portfolio: "https://alexmercer.dev",
    twitter: "https://x.com/alexmercer_tech",
    youtube: "",
    medium: "",
    dribbble: "",
    stackoverflow: "https://stackoverflow.com/users/alexmercer",
    discord: "alexmercer#1024",
    custom: [
      { label: "Substack", url: "https://alexmercer.substack.com" }
    ],
  },
  experiences: [
    {
      id: "exp_1",
      company: "Acme Cloud Technologies",
      position: "Lead Distributed Systems Architect",
      location: "San Francisco, CA",
      start_date: "2023-01",
      end_date: "Present",
      is_current: true,
      description: "Spearheaded platform migration to serverless edge functions and event-driven architecture.",
      highlights: [
        "Architected low-latency microservices handling 40M+ daily events with 99.99% SLA.",
        "Reduced p99 API response latency by 58% across tier-1 services.",
        "Mentored team of 12 full-stack and cloud infrastructure engineers."
      ],
    },
    {
      id: "exp_2",
      company: "Nexus AI Labs",
      position: "Senior Full-Stack Software Engineer",
      location: "San Francisco, CA",
      start_date: "2021-03",
      end_date: "2022-12",
      is_current: false,
      description: "Built collaborative developer workspaces with real-time sync and LLM workflows.",
      highlights: [
        "Engineered real-time CRDT synchronization engine for multi-agent code editing.",
        "Integrated streaming generative AI workflows into production web IDE."
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "Stanford University",
      degree: "B.S. in Computer Science",
      field_of_study: "Distributed Systems & Machine Learning",
      location: "Stanford, CA",
      start_date: "2017-09",
      end_date: "2021-06",
      gpa: "3.92 / 4.0",
      honors: "Magna Cum Laude • Dean's Honors List",
      highlights: [
        "President of Stanford ACM student chapter",
        "Published undergraduate research in Distributed Consensus algorithms"
      ],
    },
  ],
  skills: [
    { id: "sk_1", name: "TypeScript", category: "Languages", proficiency: 5 },
    { id: "sk_2", name: "Next.js & React 19", category: "Frameworks", proficiency: 5 },
    { id: "sk_3", name: "Node.js & Go", category: "Backend", proficiency: 5 },
    { id: "sk_4", name: "PostgreSQL & Supabase", category: "Tools & Databases", proficiency: 4 },
    { id: "sk_5", name: "Docker & Kubernetes", category: "Cloud & DevOps", proficiency: 4 },
    { id: "sk_6", name: "Tailwind CSS & Framer Motion", category: "Frameworks", proficiency: 5 },
    { id: "sk_7", name: "GraphQL & REST APIs", category: "Backend", proficiency: 4 },
    { id: "sk_8", name: "Redis & BullMQ", category: "Tools & Databases", proficiency: 4 },
  ],
  projects: [
    {
      id: "proj_1",
      name: "EduSphere AI Platform",
      description: "AI-driven educational assistance and learning analytics engine with personalized recommendations.",
      technologies: ["Next.js", "TypeScript", "Supabase", "Gemini 2.5", "TailwindCSS"],
      url: "https://edusphere-ai.vercel.app",
      github_url: "https://github.com/alexmercer-io/edusphere-ai",
      highlights: [
        "Scaled to 85,000 active monthly learners across 24 universities.",
        "Engineered zero-latency conversational tutor with multimodal reasoning."
      ],
    },
    {
      id: "proj_2",
      name: "CloudTelemetry Mesh",
      description: "Distributed telemetry aggregator streaming metrics and tracing across polyglot microservices.",
      technologies: ["Go", "Kafka", "ClickHouse", "Docker", "Prometheus"],
      url: "https://cloudtelemetry.dev",
      github_url: "https://github.com/alexmercer-io/cloud-telemetry",
      highlights: [
        "Processes 1.2M logs/sec with sub-second Elasticsearch indexing."
      ],
    },
  ],
  certifications: [
    {
      id: "cert_1",
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      issue_date: "2024-05",
      expiry_date: "2027-05",
      credential_id: "AWS-PSA-894021",
      credential_url: "https://aws.amazon.com/verification",
    },
  ],
  preferences: {
    target_roles: ["Staff Software Engineer", "Lead Systems Architect", "Principal Full-Stack Engineer"],
    work_style: "remote",
    target_salary: "$180,000 - $220,000 USD",
    notice_period: "2 Weeks",
    authorized_work_locations: ["United States", "Remote Worldwide"],
  },
};

export function calculateMemoryCompleteness(memory: UserMemory): {
  score: number;
  breakdown: { label: string; passed: boolean; weight: number }[];
} {
  const breakdown = [
    { label: "Full Name & Headline", passed: !!(memory.basics?.full_name && memory.basics?.headline), weight: 15 },
    { label: "Contact Details (Email & Phone)", passed: !!(memory.basics?.email && memory.basics?.phone), weight: 10 },
    { label: "Bio / Professional Summary", passed: !!(memory.basics?.bio && memory.basics?.bio.length > 30), weight: 10 },
    { label: "Social Presence (LinkedIn / GitHub)", passed: !!(memory.socials?.linkedin || memory.socials?.github), weight: 10 },
    { label: "Personal Portfolio / Website", passed: !!(memory.socials?.portfolio), weight: 5 },
    { label: "Work Experience (1+ entries)", passed: (memory.experiences?.length || 0) > 0, weight: 20 },
    { label: "Education History (1+ entries)", passed: (memory.education?.length || 0) > 0, weight: 10 },
    { label: "Skills Matrix (3+ skills)", passed: (memory.skills?.length || 0) >= 3, weight: 10 },
    { label: "Featured Projects (1+ projects)", passed: (memory.projects?.length || 0) > 0, weight: 5 },
    { label: "Career Preferences configured", passed: (memory.preferences?.target_roles?.length || 0) > 0, weight: 5 },
  ];

  const score = breakdown.reduce((acc, item) => (item.passed ? acc + item.weight : acc), 0);
  return { score: Math.min(100, score), breakdown };
}
