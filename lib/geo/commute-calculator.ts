/**
 * Collegiate Commute & Transit Distance Calculator
 * Calculates estimated commute times from Virginia campus locations to employer offices.
 */

export interface CommuteEstimate {
  originCampus: string;
  destinationCity: string;
  distanceMiles: number;
  driveTimeMinutes: number;
  transitTimeMinutes?: number;
  commuteTier: "Walkable / On-Campus" | "Short Commute (< 30 min)" | "Moderate Commute (30-60 min)" | "Regional Transit (> 60 min)";
}

const VIRGINIA_CITY_DISTANCES: Record<string, Record<string, number>> = {
  norfolk: {
    norfolk: 5,
    "virginia beach": 18,
    chesapeake: 12,
    portsmouth: 6,
    "newport news": 26,
    hampton: 20,
    williamsburg: 45,
    richmond: 92,
    mclean: 195,
  },
  blacksburg: {
    blacksburg: 3,
    christiansburg: 9,
    roanoke: 42,
    radford: 15,
    lynchburg: 95,
    richmond: 215,
  },
  charlottesville: {
    charlottesville: 4,
    richmond: 71,
    harrisonburg: 58,
    mclean: 114,
    fairfax: 105,
  },
  richmond: {
    richmond: 5,
    petersburg: 24,
    norfolk: 92,
    charlottesville: 71,
    fairfax: 104,
    mclean: 108,
  },
  fairfax: {
    fairfax: 5,
    mclean: 12,
    arlington: 14,
    alexandria: 16,
    reston: 11,
    richmond: 105,
  },
};

export function estimateCommute(campusSlug: string, jobLocation: string): CommuteEstimate {
  const normCampus = campusSlug.toLowerCase();
  let baseKey = "norfolk";
  let campusName = "Old Dominion University";

  if (normCampus.includes("tech") || normCampus.includes("vt")) {
    baseKey = "blacksburg";
    campusName = "Virginia Tech";
  } else if (normCampus.includes("virginia") && !normCampus.includes("old") && !normCampus.includes("west")) {
    baseKey = "charlottesville";
    campusName = "University of Virginia";
  } else if (normCampus.includes("vcu") || normCampus.includes("richmond")) {
    baseKey = "richmond";
    campusName = "Virginia Commonwealth University";
  } else if (normCampus.includes("gmu") || normCampus.includes("mason") || normCampus.includes("nvcc")) {
    baseKey = "fairfax";
    campusName = "George Mason University";
  }

  const jobLower = jobLocation.toLowerCase();
  const campusDistances = VIRGINIA_CITY_DISTANCES[baseKey] || VIRGINIA_CITY_DISTANCES.norfolk;

  let miles = 22; // default
  for (const [city, dist] of Object.entries(campusDistances)) {
    if (jobLower.includes(city)) {
      miles = dist;
      break;
    }
  }

  const driveMins = Math.round(miles * 1.4); // average Virginia traffic factor
  let tier: CommuteEstimate["commuteTier"] = "Short Commute (< 30 min)";
  if (miles <= 3) {
    tier = "Walkable / On-Campus";
  } else if (driveMins <= 30) {
    tier = "Short Commute (< 30 min)";
  } else if (driveMins <= 60) {
    tier = "Moderate Commute (30-60 min)";
  } else {
    tier = "Regional Transit (> 60 min)";
  }

  return {
    originCampus: campusName,
    destinationCity: jobLocation,
    distanceMiles: miles,
    driveTimeMinutes: driveMins,
    transitTimeMinutes: Math.round(driveMins * 1.5),
    commuteTier: tier,
  };
}
