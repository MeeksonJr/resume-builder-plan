import { executeRapidApiRequest } from "./client-cache";

export interface JSearchJobItem {
  id: string;
  title: string;
  company: string;
  employerLogo?: string | null;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  isRemote: boolean;
  employmentType: string;
  postedAt: string;
  description: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: string | null;
  applyLink: string;
  requiredSkills: string[];
  institutionalAffinity?: string | null;
}

export interface JSearchResponse {
  query: string;
  totalResults: number;
  jobs: JSearchJobItem[];
}

export async function searchJobsWithRapidApi(params: {
  query: string;
  location?: string;
  isRemote?: boolean;
  page?: number;
  campusSlug?: string;
}): Promise<JSearchResponse> {
  const query = params.query || "Software Engineer";
  const loc = params.location || "Virginia, USA";
  const searchStr = `${query} in ${loc}${params.isRemote ? " remote" : ""}`;

  const fallbackJobs: JSearchJobItem[] = [
    {
      id: "jsearch-fallback-1",
      title: "Junior Cloud Infrastructure Engineer",
      company: "Dominion Energy",
      employerLogo: "https://logo.clearbit.com/dominionenergy.com",
      location: "Richmond, VA",
      city: "Richmond",
      state: "VA",
      country: "USA",
      isRemote: false,
      employmentType: "Full-Time",
      postedAt: "2 hours ago",
      description: "Supporting cloud migration, terraform deployments, and energy grid telemetry monitoring.",
      salaryMin: 78000,
      salaryMax: 92000,
      salaryPeriod: "YEAR",
      applyLink: "https://careers.dominionenergy.com",
      requiredSkills: ["AWS", "Python", "Docker", "Linux"],
      institutionalAffinity: "vcu",
    },
    {
      id: "jsearch-fallback-2",
      title: "Full Stack Software Developer",
      company: "Huntington Ingalls Industries",
      employerLogo: "https://logo.clearbit.com/hii.com",
      location: "Newport News, VA",
      city: "Newport News",
      state: "VA",
      country: "USA",
      isRemote: false,
      employmentType: "Full-Time",
      postedAt: "1 day ago",
      description: "Building defense simulation interfaces, naval shipbuilding dashboards, and microservice APIs.",
      salaryMin: 84000,
      salaryMax: 105000,
      salaryPeriod: "YEAR",
      applyLink: "https://huntingtoningalls.com/careers",
      requiredSkills: ["TypeScript", "Next.js", "Java", "SQL"],
      institutionalAffinity: "old-dominion-university",
    },
    {
      id: "jsearch-fallback-3",
      title: "Cybersecurity Analyst - SOC Level 1",
      company: "Capital One",
      employerLogo: "https://logo.clearbit.com/capitalone.com",
      location: "McLean, VA",
      city: "McLean",
      state: "VA",
      country: "USA",
      isRemote: true,
      employmentType: "Full-Time",
      postedAt: "3 days ago",
      description: "Investigating threat signals, anomaly detection alerts, and financial security telemetry.",
      salaryMin: 95000,
      salaryMax: 118000,
      salaryPeriod: "YEAR",
      applyLink: "https://www.capitalonecareers.com",
      requiredSkills: ["SIEM", "Python", "Incident Response", "Network Security"],
      institutionalAffinity: "virginia-tech",
    },
  ];

  const result = await executeRapidApiRequest<{ data: any[] }>({
    endpoint: "jsearch",
    url: "https://jsearch.p.rapidapi.com/search",
    host: "jsearch.p.rapidapi.com",
    params: {
      query: searchStr,
      page: String(params.page || 1),
      num_pages: "1",
    },
    ttlSeconds: 1800, // 30 minutes
    fallbackGenerator: () => ({ data: [] }),
  });

  if (result.source !== "fallback" && Array.isArray(result.data?.data) && result.data.data.length > 0) {
    const parsed: JSearchJobItem[] = result.data.data.map((item: any) => ({
      id: item.job_id || `job-${Math.random().toString(36).slice(2)}`,
      title: item.job_title || "Job Opening",
      company: item.employer_name || "Company",
      employerLogo: item.employer_logo || null,
      location: `${item.job_city || ""}${item.job_state ? `, ${item.job_state}` : ""}`,
      city: item.job_city,
      state: item.job_state,
      country: item.job_country,
      isRemote: Boolean(item.job_is_remote),
      employmentType: item.job_employment_type || "Full-Time",
      postedAt: item.job_posted_at_datetime_utc 
        ? new Date(item.job_posted_at_datetime_utc).toLocaleDateString()
        : "Recently",
      description: item.job_description ? item.job_description.slice(0, 300) + "..." : "",
      salaryMin: item.job_min_salary || null,
      salaryMax: item.job_max_salary || null,
      salaryPeriod: item.job_salary_period || "YEAR",
      applyLink: item.job_apply_link || "#",
      requiredSkills: Array.isArray(item.job_required_skills) ? item.job_required_skills : [],
      institutionalAffinity: params.campusSlug || null,
    }));

    return {
      query: searchStr,
      totalResults: parsed.length,
      jobs: parsed,
    };
  }

  return {
    query: searchStr,
    totalResults: fallbackJobs.length,
    jobs: fallbackJobs.map((j) => ({
      ...j,
      institutionalAffinity: params.campusSlug || j.institutionalAffinity,
    })),
  };
}
