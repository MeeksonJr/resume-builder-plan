export interface ResumeSnapshot {
    personalInfo: any;
    workExperiences: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
}

export interface VersionDiff {
    section: string;
    changes: {
        type: "added" | "removed" | "modified";
        field: string;
        oldValue?: string;
        newValue?: string;
    }[];
}

/**
 * Determines if changes are significant enough to create a new version
 */
export function shouldCreateVersion(oldSnapshot: ResumeSnapshot, newSnapshot: ResumeSnapshot): boolean {
    // Check if personal info changed (excluding minor fields)
    const oldInfo = oldSnapshot.personalInfo || {};
    const newInfo = newSnapshot.personalInfo || {};

    const significantFields = ["full_name", "email", "phone", "summary"];
    const personalInfoChanged = significantFields.some(
        field => oldInfo[field] !== newInfo[field]
    );

    // Check if array sections changed (count or content)
    const workChanged = oldSnapshot.workExperiences?.length !== newSnapshot.workExperiences?.length;
    const educationChanged = oldSnapshot.education?.length !== newSnapshot.education?.length;
    const skillsChanged = oldSnapshot.skills?.length !== newSnapshot.skills?.length;
    const projectsChanged = oldSnapshot.projects?.length !== newSnapshot.projects?.length;

    return personalInfoChanged || workChanged || educationChanged || skillsChanged || projectsChanged;
}

/**
 * Compares two resume snapshots and returns structured diff
 */
export function getVersionDiff(oldSnapshot: ResumeSnapshot, newSnapshot: ResumeSnapshot): VersionDiff[] {
    const diffs: VersionDiff[] = [];

    // Personal info diff
    const personalInfoChanges: VersionDiff["changes"] = [];
    const oldInfo = oldSnapshot.personalInfo || {};
    const newInfo = newSnapshot.personalInfo || {};

    Object.keys({ ...oldInfo, ...newInfo }).forEach(key => {
        if (oldInfo[key] !== newInfo[key]) {
            personalInfoChanges.push({
                type: !oldInfo[key] ? "added" : !newInfo[key] ? "removed" : "modified",
                field: key,
                oldValue: oldInfo[key],
                newValue: newInfo[key],
            });
        }
    });

    if (personalInfoChanges.length > 0) {
        diffs.push({ section: "Personal Info", changes: personalInfoChanges });
    }

    // Work experience diff
    const workChanges: VersionDiff["changes"] = [];
    const oldWorkCount = oldSnapshot.workExperiences?.length || 0;
    const newWorkCount = newSnapshot.workExperiences?.length || 0;

    if (oldWorkCount !== newWorkCount) {
        workChanges.push({
            type: newWorkCount > oldWorkCount ? "added" : "removed",
            field: "entries",
            oldValue: `${oldWorkCount} positions`,
            newValue: `${newWorkCount} positions`,
        });
    }

    if (workChanges.length > 0) {
        diffs.push({ section: "Work Experience", changes: workChanges });
    }

    // Education diff
    const educationDiff = (oldSnapshot.education?.length || 0) - (newSnapshot.education?.length || 0);
    if (educationDiff !== 0) {
        diffs.push({
            section: "Education",
            changes: [{
                type: educationDiff < 0 ? "added" : "removed",
                field: "entries",
                oldValue: `${oldSnapshot.education?.length || 0} degrees`,
                newValue: `${newSnapshot.education?.length || 0} degrees`,
            }],
        });
    }

    // Skills diff
    const oldSkills = new Set((oldSnapshot.skills || []).map((s: any) => (s.name || "").trim()).filter(Boolean));
    const newSkills = new Set((newSnapshot.skills || []).map((s: any) => (s.name || "").trim()).filter(Boolean));
    const skillChanges: VersionDiff["changes"] = [];

    newSkills.forEach(skill => {
        if (!oldSkills.has(skill)) {
            skillChanges.push({ type: "added", field: "skill", newValue: skill });
        }
    });

    oldSkills.forEach(skill => {
        if (!newSkills.has(skill)) {
            skillChanges.push({ type: "removed", field: "skill", oldValue: skill });
        }
    });

    if (skillChanges.length > 0) {
        diffs.push({ section: "Skills", changes: skillChanges });
    }

    // Projects diff
    const projectsDiff = (oldSnapshot.projects?.length || 0) - (newSnapshot.projects?.length || 0);
    if (projectsDiff !== 0) {
        diffs.push({
            section: "Projects",
            changes: [{
                type: projectsDiff < 0 ? "added" : "removed",
                field: "entries",
                oldValue: `${oldSnapshot.projects?.length || 0} projects`,
                newValue: `${newSnapshot.projects?.length || 0} projects`,
            }],
        });
    }

    // Certifications diff
    const certsDiff = (oldSnapshot.certifications?.length || 0) - (newSnapshot.certifications?.length || 0);
    if (certsDiff !== 0) {
        diffs.push({
            section: "Certifications",
            changes: [{
                type: certsDiff < 0 ? "added" : "removed",
                field: "entries",
                oldValue: `${oldSnapshot.certifications?.length || 0} certifications`,
                newValue: `${newSnapshot.certifications?.length || 0} certifications`,
            }],
        });
    }

    return diffs;
}
