import { createClient } from "@/lib/supabase/server";

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
 * Creates a complete snapshot of a resume's current state
 */
export async function createResumeSnapshot(resumeId: string): Promise<ResumeSnapshot> {
    const supabase = await createClient();

    const [
        { data: personalInfo },
        { data: workExperiences },
        { data: education },
        { data: skills },
        { data: projects },
        { data: certifications },
        { data: languages },
    ] = await Promise.all([
        supabase.from("personal_info").select("*").eq("resume_id", resumeId).single(),
        supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
    ]);

    return {
        personalInfo: personalInfo || {},
        workExperiences: workExperiences || [],
        education: education || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        languages: languages || [],
    };
}

/**
 * Saves a new version of the resume
 */
export async function saveResumeVersion(
    resumeId: string,
    userId: string,
    changeSummary?: string
): Promise<string | null> {
    const supabase = await createClient();

    // Get resume details
    const { data: resume } = await supabase
        .from("resumes")
        .select("title, template")
        .eq("id", resumeId)
        .single();

    if (!resume) return null;

    // Create snapshot
    const snapshot = await createResumeSnapshot(resumeId);

    // Get next version number
    const { data: versionNumber } = await supabase
        .rpc("get_next_version_number", { p_resume_id: resumeId })
        .single();

    // Save version
    const { data: version, error } = await supabase
        .from("resume_versions")
        .insert({
            resume_id: resumeId,
            version_number: versionNumber,
            title: resume.title,
            template: resume.template,
            snapshot_data: snapshot,
            change_summary: changeSummary || `Version ${versionNumber}`,
            created_by: userId,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error saving version:", error);
        return null;
    }

    // Initialize metrics for this version
    await supabase.from("version_metrics").insert({
        version_id: version.id,
    });

    return version.id;
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

    // Similar logic for other sections...
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

    return diffs;
}

/**
 * Restores a resume to a specific version
 */
export async function restoreResumeVersion(
    resumeId: string,
    versionId: string,
    userId: string
): Promise<boolean> {
    const supabase = await createClient();

    // Get the version snapshot
    const { data: version } = await supabase
        .from("resume_versions")
        .select("snapshot_data, title, template")
        .eq("id", versionId)
        .single();

    if (!version) return false;

    // Create a backup version before restoring
    await saveResumeVersion(resumeId, userId, "Backup before restore");

    const snapshot = version.snapshot_data as ResumeSnapshot;

    // Update resume metadata
    await supabase
        .from("resumes")
        .update({
            title: version.title,
            template: version.template,
        })
        .eq("id", resumeId);

    // Clear existing data and restore from snapshot
    await supabase.from("personal_info").delete().eq("resume_id", resumeId);
    await supabase.from("work_experiences").delete().eq("resume_id", resumeId);
    await supabase.from("education").delete().eq("resume_id", resumeId);
    await supabase.from("skills").delete().eq("resume_id", resumeId);
    await supabase.from("projects").delete().eq("resume_id", resumeId);
    await supabase.from("certifications").delete().eq("resume_id", resumeId);
    await supabase.from("languages").delete().eq("resume_id", resumeId);

    // Restore data
    if (snapshot.personalInfo) {
        await supabase.from("personal_info").insert({
            resume_id: resumeId,
            ...snapshot.personalInfo,
        });
    }

    if (snapshot.workExperiences?.length > 0) {
        await supabase.from("work_experiences").insert(
            snapshot.workExperiences.map((exp: any) => ({
                ...exp,
                resume_id: resumeId,
            }))
        );
    }

    if (snapshot.education?.length > 0) {
        await supabase.from("education").insert(
            snapshot.education.map((edu: any) => ({
                ...edu,
                resume_id: resumeId,
            }))
        );
    }

    if (snapshot.skills?.length > 0) {
        await supabase.from("skills").insert(
            snapshot.skills.map((skill: any) => ({
                ...skill,
                resume_id: resumeId,
            }))
        );
    }

    if (snapshot.projects?.length > 0) {
        await supabase.from("projects").insert(
            snapshot.projects.map((project: any) => ({
                ...project,
                resume_id: resumeId,
            }))
        );
    }

    if (snapshot.certifications?.length > 0) {
        await supabase.from("certifications").insert(
            snapshot.certifications.map((cert: any) => ({
                ...cert,
                resume_id: resumeId,
            }))
        );
    }

    if (snapshot.languages?.length > 0) {
        await supabase.from("languages").insert(
            snapshot.languages.map((lang: any) => ({
                ...lang,
                resume_id: resumeId,
            }))
        );
    }

    return true;
}
