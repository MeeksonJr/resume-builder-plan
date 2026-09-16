import { createClient } from "@/lib/supabase/server";
import {
    ResumeSnapshot,
    VersionDiff,
    shouldCreateVersion,
    getVersionDiff,
} from "./version-diff";

export type { ResumeSnapshot, VersionDiff };
export { shouldCreateVersion, getVersionDiff };

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
        supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
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
        .maybeSingle();

    if (!resume) return null;

    // Create snapshot
    const snapshot = await createResumeSnapshot(resumeId);

    // Get next version number
    const { data: versionNumber } = await supabase
        .rpc("get_next_version_number", { p_resume_id: resumeId });

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
