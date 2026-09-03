export interface PersonaData {
    id: string;
    label: string;
    role: string;
    profile: {
        full_name: string;
        email: string;
        phone: string;
        location: string;
        linkedin_url: string;
        github_url?: string;
        website_url?: string;
        label: string;
        summary: string;
    };
    workExperiences: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
    sectionOrder: string[];
}

export const SAMPLE_PERSONAS: Record<string, PersonaData> = {
    software_engineer: {
        id: "software_engineer",
        label: "Software Engineer",
        role: "Senior Full Stack Engineer",
        profile: {
            full_name: "Alexander Reed",
            email: "alex.reed@example.io",
            phone: "+1 (555) 234-8901",
            location: "San Francisco, CA",
            linkedin_url: "https://linkedin.com/in/alexreed-dev",
            github_url: "https://github.com/alexreed",
            website_url: "https://alexreed.io",
            label: "Senior Full Stack & Cloud Architect",
            summary: "<p>Results-driven Senior Full Stack Engineer with 7+ years of experience architecting distributed cloud systems and high-throughput web applications. Spearheaded microservices migration handling <strong>45M+ daily requests</strong> with 99.99% uptime. Passionate about developer tooling, clean software design, and scalable infrastructure.</p>",
        },
        workExperiences: [
            {
                id: "exp-1",
                company: "Stripe / FinScale Technologies",
                position: "Staff Software Engineer",
                location: "San Francisco, CA",
                start_date: "2022-03",
                end_date: "Present",
                is_current: true,
                description: "<p>Lead core platform architecture for real-time payment settlement engine serving 12,000+ enterprise merchants.</p><ul><li>Architected event-driven ingestion pipeline in Go and Kafka, slashing transaction processing latency by <strong>42%</strong>.</li><li>Led team of 8 engineers across 3 time zones to deliver multi-region failover clusters, preventing $2.4M in potential downtime loss.</li><li>Automated CI/CD pipelines reducing deployment failure rate from 8.2% to under <strong>0.3%</strong>.</li></ul>",
                highlights: [],
            },
            {
                id: "exp-2",
                company: "CloudCore Systems",
                position: "Senior Software Engineer",
                location: "Austin, TX",
                start_date: "2019-06",
                end_date: "2022-02",
                is_current: false,
                description: "<p>Developed customer-facing telemetry dashboards and Kubernetes autoscaling controllers using Next.js, TypeScript, and Go.</p><ul><li>Engineered GraphQL API caching layer, reducing p99 database query response times from 340ms to <strong>28ms</strong>.</li><li>Mentored 5 junior and mid-level engineers, establishing company-wide automated TypeScript type verification standards.</li></ul>",
                highlights: [],
            },
        ],
        education: [
            {
                id: "edu-1",
                institution: "University of California, Berkeley",
                degree: "Bachelor of Science",
                field_of_study: "Computer Science & Data Science",
                start_date: "2015-08",
                end_date: "2019-05",
                gpa: "3.84",
                highlights: [
                    "<p><strong>Relevant Coursework:</strong> Distributed Systems, Algorithms & Complexity, Database Management, Operating Systems, Machine Learning Foundations.</p>",
                ],
            },
        ],
        skills: [
            { id: "s-1", name: "TypeScript / Node.js", category: "Languages" },
            { id: "s-2", name: "Go (Golang)", category: "Languages" },
            { id: "s-3", name: "Python", category: "Languages" },
            { id: "s-4", name: "Next.js / React", category: "Frontend" },
            { id: "s-5", name: "PostgreSQL & Redis", category: "Databases" },
            { id: "s-6", name: "Docker & Kubernetes", category: "Cloud & DevOps" },
            { id: "s-7", name: "AWS (EKS, RDS, S3)", category: "Cloud & DevOps" },
            { id: "s-8", name: "GraphQL & REST APIs", category: "Architecture" },
        ],
        projects: [
            {
                id: "proj-1",
                name: "HyperScale Event Mesh",
                url: "https://github.com/alexreed/hyperscale",
                technologies: ["Go", "Kafka", "Protobuf", "Docker"],
                description: "<p>Open-source distributed event broker designed for low-latency IoT message queues. Featured in GitHub Trending with 1,800+ stars.</p>",
                highlights: [],
            },
            {
                id: "proj-2",
                name: "Distributed Cache Synchronizer",
                url: "https://github.com/alexreed/cache-sync",
                technologies: ["TypeScript", "Redis", "WebSockets"],
                description: "<p>Multi-node state synchronization daemon keeping edge caches invalidated across globally distributed Redis clusters.</p>",
                highlights: [],
            },
        ],
        certifications: [
            { id: "c-1", name: "AWS Certified Solutions Architect – Professional", issuer: "Amazon Web Services", issue_date: "2023-04" },
            { id: "c-2", name: "Certified Kubernetes Administrator (CKA)", issuer: "Cloud Native Computing Foundation", issue_date: "2022-11" },
        ],
        languages: [
            { id: "l-1", language: "English", proficiency: "Native / Bilingual" },
            { id: "l-2", language: "German", proficiency: "Professional Working" },
        ],
        sectionOrder: ["experience", "education", "skills", "projects", "certifications", "languages"],
    },

    executive_leader: {
        id: "executive_leader",
        label: "Executive Leader",
        role: "VP of Product Management",
        profile: {
            full_name: "Elena Vance",
            email: "elena.vance@executivemail.com",
            phone: "+1 (555) 890-1234",
            location: "New York, NY",
            linkedin_url: "https://linkedin.com/in/elenavance-vp",
            website_url: "https://elenavance.com",
            label: "VP of Product Management & Digital Transformation",
            summary: "<p>Strategic Product Executive with 12+ years of leadership scaling B2B SaaS and Enterprise platforms from $8M to <strong>$64M ARR</strong>. Proven track record managing 45+ product managers, designers, and data scientists across North America and EMEA. Adept at board presentations, M&A due diligence, and go-to-market execution.</p>",
        },
        workExperiences: [
            {
                id: "exp-1",
                company: "Apex Enterprise Cloud",
                position: "Vice President of Product Management",
                location: "New York, NY",
                start_date: "2021-01",
                end_date: "Present",
                is_current: true,
                description: "<p>Direct executive product strategy for flagship cloud intelligence suite generating $48M annual recurring revenue.</p><ul><li>Spearheaded product-led growth motion that accelerated enterprise customer acquisition by <strong>68% YoY</strong>.</li><li>Restructured global product org into outcome-driven squads, lifting quarterly feature velocity by 34% while cutting roadmap churn.</li><li>Championed AI workflow integration driving $6.2M in net-new pipeline expansion within first two quarters.</li></ul>",
                highlights: [],
            },
            {
                id: "exp-2",
                company: "Vanguard Global Commerce",
                position: "Senior Director of Product",
                location: "Boston, MA",
                start_date: "2017-04",
                end_date: "2020-12",
                is_current: false,
                description: "<p>Oversaw global omnichannel checkout and marketplace integration handling $1.2B in gross merchandise value.</p><ul><li>Launched frictionless mobile checkout experience, delivering a <strong>4.8% lift in conversion rates</strong> across 8 markets.</li><li>Negotiated strategic partner integrations with PayPal, Stripe, and Adyen, reducing payment gateway transaction costs by 18 bps.</li></ul>",
                highlights: [],
            },
        ],
        education: [
            {
                id: "edu-1",
                institution: "Harvard Business School",
                degree: "Master of Business Administration (MBA)",
                field_of_study: "General Management & Technology Strategy",
                start_date: "2015-09",
                end_date: "2017-05",
                gpa: "",
                highlights: [
                    "<p>Baker Scholar Nominee, President of Tech & Media Club.</p>",
                ],
            },
            {
                id: "edu-2",
                institution: "Cornell University",
                degree: "Bachelor of Science",
                field_of_study: "Industrial & Labor Relations, Minor in Economics",
                start_date: "2011-08",
                end_date: "2015-05",
                gpa: "3.91",
                highlights: [],
            },
        ],
        skills: [
            { id: "s-1", name: "Product Strategy & Vision", category: "Leadership" },
            { id: "s-2", name: "P&L Management ($50M+)", category: "Executive" },
            { id: "s-3", name: "Go-to-Market (GTM)", category: "Growth" },
            { id: "s-4", name: "Cross-Functional Org Design", category: "Leadership" },
            { id: "s-5", name: "Enterprise Customer Discovery", category: "Product" },
            { id: "s-6", name: "M&A Technical Due Diligence", category: "Executive" },
        ],
        projects: [
            {
                id: "proj-1",
                name: "AI Enterprise Workflows Whitepaper",
                url: "https://elenavance.com/ai-workflows",
                technologies: ["Product Strategy", "Generative AI", "Enterprise SaaS"],
                description: "<p>Published industry whitepaper on generative AI integration in enterprise procurement, cited by Fortune 500 leadership teams.</p>",
                highlights: [],
            },
        ],
        certifications: [
            { id: "c-1", name: "Reforge Product Leadership Certification", issuer: "Reforge", issue_date: "2020-08" },
        ],
        languages: [
            { id: "l-1", language: "English", proficiency: "Native" },
            { id: "l-2", language: "French", proficiency: "Professional Working" },
        ],
        sectionOrder: ["experience", "education", "skills", "projects", "certifications", "languages"],
    },

    marketing_lead: {
        id: "marketing_lead",
        label: "Marketing & Growth",
        role: "Head of Growth Marketing",
        profile: {
            full_name: "Maya Lin Chen",
            email: "maya.chen@growthstudio.co",
            phone: "+1 (555) 456-7890",
            location: "Seattle, WA",
            linkedin_url: "https://linkedin.com/in/mayalinchen",
            website_url: "https://mayalinchen.com",
            label: "Head of Performance Marketing & Brand Strategy",
            summary: "<p>Data-driven Marketing Director with 6+ years driving viral growth loops, multi-channel customer acquisition, and brand positioning. Scaled self-serve customer base from <strong>15,000 to 240,000 active subscribers</strong> while reducing Customer Acquisition Cost (CAC) by 38%. Expert in SEO, lifecycle automation, and high-impact brand storytelling.</p>",
        },
        workExperiences: [
            {
                id: "exp-1",
                company: "Luminary AI Studio",
                position: "Head of Growth Marketing",
                location: "Seattle, WA",
                start_date: "2022-05",
                end_date: "Present",
                is_current: true,
                description: "<p>Manage $3.8M annual marketing budget across paid acquisition, lifecycle nurture, content marketing, and influencer partnerships.</p><ul><li>Architected viral referral engine contributing to <strong>31% of all new organic signups</strong> in FY2023.</li><li>Restructured automated onboarding email sequences, boosting 30-day user retention rate from 21% to <strong>39%</strong>.</li><li>Orchestrated brand re-launch across Product Hunt (#1 Product of the Day) generating 48,000 visits in 24 hours.</li></ul>",
                highlights: [],
            },
            {
                id: "exp-2",
                company: "Pulse Metric Media",
                position: "Senior Growth Marketing Manager",
                location: "San Francisco, CA",
                start_date: "2019-08",
                end_date: "2022-04",
                is_current: false,
                description: "<p>Executed performance ad campaigns across Google Search, Meta, and LinkedIn with strict ROAS targets.</p><ul><li>Scaled monthly paid spend from $40k to $250k while maintaining positive <strong>3.4x ROAS</strong> across B2B campaigns.</li><li>Introduced programmatic SEO hub that captured 180,000 monthly organic search visits across high-intent keywords.</li></ul>",
                highlights: [],
            },
        ],
        education: [
            {
                id: "edu-1",
                institution: "University of Washington",
                degree: "Bachelor of Arts",
                field_of_study: "Communication & Digital Media",
                start_date: "2015-09",
                end_date: "2019-06",
                gpa: "3.78",
                highlights: [
                    "<p>Dean's List 7 quarters, Vice President of American Marketing Association Student Chapter.</p>",
                ],
            },
        ],
        skills: [
            { id: "s-1", name: "Growth Loops & Funnel Optimization", category: "Growth" },
            { id: "s-2", name: "Paid Ads (Google, Meta, LinkedIn)", category: "Acquisition" },
            { id: "s-3", name: "SEO & Programmatic Content", category: "Content" },
            { id: "s-4", name: "Customer Lifecycle (Customer.io)", category: "Lifecycle" },
            { id: "s-5", name: "SQL & Amplitude Analytics", category: "Analytics" },
            { id: "s-6", name: "A/B Testing & Conversion Rate (CRO)", category: "Optimization" },
        ],
        projects: [
            {
                id: "proj-1",
                name: "0 to 100k Community Playbook",
                url: "https://mayalinchen.com/playbook",
                technologies: ["Substack", "Growth Hacking", "Community"],
                description: "<p>Comprehensive guide detailing the strategies used to build an engaged community of 100,000 creative professionals.</p>",
                highlights: [],
            },
        ],
        certifications: [
            { id: "c-1", name: "Google Ads Search & Measurement Certified", issuer: "Google", issue_date: "2023-01" },
            { id: "c-2", name: "Reforge Retention & Engagement Series", issuer: "Reforge", issue_date: "2021-09" },
        ],
        languages: [
            { id: "l-1", language: "English", proficiency: "Native" },
            { id: "l-2", language: "Mandarin Chinese", proficiency: "Bilingual" },
        ],
        sectionOrder: ["experience", "education", "skills", "projects", "certifications", "languages"],
    },
};

export const DEFAULT_SAMPLE_PERSONA = SAMPLE_PERSONAS.software_engineer;
