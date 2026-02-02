
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDuplication() {
    console.log("Starting verification...");

    // 1. Get a test resume
    const { data: resumes, error: fetchError } = await supabase
        .from('resumes')
        .select('id, title, user_id')
        .limit(1);

    if (fetchError || !resumes || resumes.length === 0) {
        console.error("Could not find a resume to duplicate:", fetchError);
        return;
    }

    const sourceId = resumes[0].id;
    const userId = resumes[0].user_id;
    console.log(`Duplicating resume: ${resumes[0].title} (${sourceId})`);

    // 2. Fetch Source Resume
    const { data: sourceResume } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", sourceId)
        .single();

    // 3. Create Duplicate
    const { data: duplicateResume, error: createError } = await supabase
        .from("resumes")
        .insert({
            user_id: userId,
            title: `${sourceResume.title} (Verification Copy)`,
            template_id: sourceResume.template_id,
            is_public: false,
            visual_config: sourceResume.visual_config,
            section_order: sourceResume.section_order,
            language: sourceResume.language,
            is_rtl: sourceResume.is_rtl,
        })
        .select()
        .single();

    if (createError) {
        console.error("Failed to create duplicate:", createError);
        return;
    }

    const newId = duplicateResume.id;
    console.log(`Duplicate created: ${newId}`);

    // 4. Copy one section (e.g., personal_info) to verify integrity
    const { data: sectionData } = await supabase
        .from("personal_info")
        .select("*")
        .eq("resume_id", sourceId);

    if (sectionData && sectionData.length > 0) {
        const { id: _, resume_id: __, created_at: ___, updated_at: ____, ...rest } = sectionData[0];
        const { error: insertError } = await supabase
            .from("personal_info")
            .insert({ ...rest, resume_id: newId });

        if (insertError) {
            console.error("Failed to copy personal_info:", insertError);
        } else {
            console.log("personal_info copied successfully.");
        }
    }

    console.log("Verification complete. Cleaning up...");
    // Cleanup
    await supabase.from('resumes').delete().eq('id', newId);
    console.log("Cleanup complete.");
}

verifyDuplication();
