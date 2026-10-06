// Centralized University / Campus Domain Knowledge & Auto-Detection

export interface SchoolInfo {
  name: string;
  slug: string;
  domain: string;
  location: string;
  emailFormat: string;
  sampleEmail?: string;
  emailDomains: string[];
}

export const KNOWN_EDU_DOMAINS: Record<string, { name: string; slug: string; location: string }> = {
  // Virginia Universities & Community Colleges
  "odu.edu": { name: "Old Dominion University", slug: "old-dominion-university", location: "Norfolk, VA" },
  "cs.odu.edu": { name: "Old Dominion University", slug: "old-dominion-university", location: "Norfolk, VA" },
  "email.vccs.edu": { name: "Tidewater Community College", slug: "tidewater-community-college", location: "Norfolk, VA" },
  "vccs.edu": { name: "Virginia Community College System", slug: "vccs", location: "Virginia" },
  "tcc.edu": { name: "Tidewater Community College", slug: "tidewater-community-college", location: "Norfolk, VA" },
  "email.tcc.edu": { name: "Tidewater Community College", slug: "tidewater-community-college", location: "Norfolk, VA" },
  "virginia.edu": { name: "University of Virginia", slug: "uva", location: "Charlottesville, VA" },
  "vt.edu": { name: "Virginia Tech", slug: "virginia-tech", location: "Blacksburg, VA" },
  "vcu.edu": { name: "Virginia Commonwealth University", slug: "vcu", location: "Richmond, VA" },
  "gmu.edu": { name: "George Mason University", slug: "george-mason", location: "Fairfax, VA" },
  "jmu.edu": { name: "James Madison University", slug: "james-madison", location: "Harrisonburg, VA" },
  "wm.edu": { name: "William & Mary", slug: "william-and-mary", location: "Williamsburg, VA" },
  "nsu.edu": { name: "Norfolk State University", slug: "norfolk-state", location: "Norfolk, VA" },
  "hamptonu.edu": { name: "Hampton University", slug: "hampton-university", location: "Hampton, VA" },
  "cnup.edu": { name: "Christopher Newport University", slug: "cnu", location: "Newport News, VA" },
  "cnu.edu": { name: "Christopher Newport University", slug: "cnu", location: "Newport News, VA" },

  // Top National Universities
  "stanford.edu": { name: "Stanford University", slug: "stanford", location: "Stanford, CA" },
  "mit.edu": { name: "Massachusetts Institute of Technology", slug: "mit", location: "Cambridge, MA" },
  "berkeley.edu": { name: "University of California, Berkeley", slug: "berkeley", location: "Berkeley, CA" },
  "harvard.edu": { name: "Harvard University", slug: "harvard", location: "Cambridge, MA" },
  "cmu.edu": { name: "Carnegie Mellon University", slug: "cmu", location: "Pittsburgh, PA" },
  "nyu.edu": { name: "New York University", slug: "nyu", location: "New York, NY" },
  "umich.edu": { name: "University of Michigan", slug: "umich", location: "Ann Arbor, MI" },
  "gatech.edu": { name: "Georgia Institute of Technology", slug: "gatech", location: "Atlanta, GA" },
  "uw.edu": { name: "University of Washington", slug: "uw", location: "Seattle, WA" },
  "columbia.edu": { name: "Columbia University", slug: "columbia", location: "New York, NY" },
  "cornell.edu": { name: "Cornell University", slug: "cornell", location: "Ithaca, NY" },
  "princeton.edu": { name: "Princeton University", slug: "princeton", location: "Princeton, NJ" },
  "yale.edu": { name: "Yale University", slug: "yale", location: "New Haven, CT" },
  "ucla.edu": { name: "University of California, Los Angeles", slug: "ucla", location: "Los Angeles, CA" },
  "usc.edu": { name: "University of Southern California", slug: "usc", location: "Los Angeles, CA" },
  "utexas.edu": { name: "University of Texas at Austin", slug: "ut-austin", location: "Austin, TX" },
  "tamu.edu": { name: "Texas A&M University", slug: "texas-am", location: "College Station, TX" },
  "illinois.edu": { name: "University of Illinois Urbana-Champaign", slug: "uiuc", location: "Urbana, IL" },
  "purdue.edu": { name: "Purdue University", slug: "purdue", location: "West Lafayette, IN" },
  "osu.edu": { name: "Ohio State University", slug: "ohio-state", location: "Columbus, OH" },
  "psu.edu": { name: "Penn State University", slug: "penn-state", location: "University Park, PA" },
  "rutgers.edu": { name: "Rutgers University", slug: "rutgers", location: "New Brunswick, NJ" },
  "ufl.edu": { name: "University of Florida", slug: "uf", location: "Gainesville, FL" },
  "fsu.edu": { name: "Florida State University", slug: "fsu", location: "Tallahassee, FL" },
  "unc.edu": { name: "University of North Carolina at Chapel Hill", slug: "unc", location: "Chapel Hill, NC" },
  "duke.edu": { name: "Duke University", slug: "duke", location: "Durham, NC" },
  "ncsu.edu": { name: "North Carolina State University", slug: "nc-state", location: "Raleigh, NC" },
  "umd.edu": { name: "University of Maryland", slug: "umd", location: "College Park, MD" },
  "jhu.edu": { name: "Johns Hopkins University", slug: "johns-hopkins", location: "Baltimore, MD" },
};

export function isAcademicDomain(domain: string): boolean {
  if (!domain) return false;
  const lower = domain.toLowerCase().trim();
  return (
    lower.endsWith(".edu") ||
    lower.endsWith(".ac.uk") ||
    lower.endsWith(".edu.au") ||
    lower.endsWith(".edu.cn") ||
    lower.endsWith(".edu.ca") ||
    lower.includes("vccs.edu")
  );
}

export function detectSchoolFromEmail(emailOrDomain: string): SchoolInfo | null {
  if (!emailOrDomain) return null;
  const domain = emailOrDomain.includes("@")
    ? emailOrDomain.split("@")[1]?.toLowerCase().trim()
    : emailOrDomain.toLowerCase().trim();

  if (!domain || !isAcademicDomain(domain)) {
    return null;
  }

  // Exact known domain match
  if (KNOWN_EDU_DOMAINS[domain]) {
    const known = KNOWN_EDU_DOMAINS[domain];
    return {
      name: known.name,
      slug: known.slug,
      domain,
      location: known.location,
      emailFormat: `[username]@${domain}`,
      sampleEmail: emailOrDomain.includes("@") ? emailOrDomain : undefined,
      emailDomains: [domain],
    };
  }

  // Subdomain match (e.g. cs.odu.edu or eng.vt.edu)
  const parts = domain.split(".");
  if (parts.length > 2) {
    const rootDomain = parts.slice(-2).join(".");
    if (KNOWN_EDU_DOMAINS[rootDomain]) {
      const known = KNOWN_EDU_DOMAINS[rootDomain];
      return {
        name: known.name,
        slug: known.slug,
        domain: rootDomain,
        location: known.location,
        emailFormat: `[username]@${domain}`,
        sampleEmail: emailOrDomain.includes("@") ? emailOrDomain : undefined,
        emailDomains: [domain, rootDomain],
      };
    }
  }

  // Fallback: derive school name from domain root
  const rootName = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  const formattedName = rootName
    .replace(/[^a-z0-9]/gi, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const schoolName = formattedName.length <= 4 ? `${formattedName.toUpperCase()} University` : `${formattedName} University`;
  const slug = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    name: schoolName,
    slug,
    domain,
    location: "United States",
    emailFormat: `[username]@${domain}`,
    sampleEmail: emailOrDomain.includes("@") ? emailOrDomain : undefined,
    emailDomains: [domain],
  };
}
