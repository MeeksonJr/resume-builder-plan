/**
 * Dynamic University Branding & Institutional Colorway Engine
 * Provides official hex colors, secondary accents, and CSS variables for Virginia colleges.
 */

export interface UniversityBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeTextColor: string;
  crestBgColor: string;
  motto: string;
  athleticsMascot: string;
}

const BRANDING_MAP: Record<string, UniversityBranding> = {
  "old-dominion-university": {
    primaryColor: "#003057", // ODU Navy
    secondaryColor: "#7C878E", // Monarch Silver
    accentColor: "#0072CE", // Accent Blue
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#003057",
    motto: "Idea Fusion",
    athleticsMascot: "Big Blue the Monarch",
  },
  "virginia-tech": {
    primaryColor: "#861F41", // Chicago Maroon
    secondaryColor: "#E87722", // Burnt Orange
    accentColor: "#C64600",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#861F41",
    motto: "Ut Prosim (That I May Serve)",
    athleticsMascot: "HokieBird",
  },
  "university-of-virginia": {
    primaryColor: "#232D4B", // Jefferson Blue
    secondaryColor: "#E57200", // Rotunda Orange
    accentColor: "#F8971D",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#232D4B",
    motto: "Honor, Truth, Virtue",
    athleticsMascot: "Cavalier",
  },
  "virginia-commonwealth-university": {
    primaryColor: "#000000",
    secondaryColor: "#FFB300", // VCU Gold
    accentColor: "#FFC72C",
    badgeTextColor: "#000000",
    crestBgColor: "#000000",
    motto: "Make It Real",
    athleticsMascot: "Rodney the Ram",
  },
  "george-mason-university": {
    primaryColor: "#006633", // Mason Green
    secondaryColor: "#FFCC33", // Mason Gold
    accentColor: "#004D25",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#006633",
    motto: "Freedom and Learning",
    athleticsMascot: "The Patriot",
  },
  "james-madison-university": {
    primaryColor: "#450084", // JMU Purple
    secondaryColor: "#CBB677", // JMU Gold
    accentColor: "#5B12A8",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#450084",
    motto: "Knowledge is Liberty",
    athleticsMascot: "Duke Dog",
  },
  "william-mary": {
    primaryColor: "#115740", // W&M Green
    secondaryColor: "#B9975B", // W&M Gold
    accentColor: "#D0B787",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#115740",
    motto: "The Hark Upon The Gale",
    athleticsMascot: "Griffin",
  },
  "tidewater-community-college": {
    primaryColor: "#002855", // TCC Navy
    secondaryColor: "#FFB81C", // TCC Gold
    accentColor: "#0055A5",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#002855",
    motto: "From Here, Go Anywhere",
    athleticsMascot: "Timmy the Storm",
  },
  "northern-virginia-community-college": {
    primaryColor: "#005A36", // NVCC Green
    secondaryColor: "#FFC72C", // NVCC Gold
    accentColor: "#007A48",
    badgeTextColor: "#FFFFFF",
    crestBgColor: "#005A36",
    motto: "Quality Education for a Lifetime",
    athleticsMascot: "Nighthawk",
  },
};

const DEFAULT_BRANDING: UniversityBranding = {
  primaryColor: "#102b2b",
  secondaryColor: "#d8f36b",
  accentColor: "#164743",
  badgeTextColor: "#d8f36b",
  crestBgColor: "#102b2b",
  motto: "Excellence in Collegiate Career Development",
  athleticsMascot: "Collegiate Scholar",
};

export function getInstitutionBranding(slug: string): UniversityBranding {
  const norm = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return BRANDING_MAP[norm] || DEFAULT_BRANDING;
}
