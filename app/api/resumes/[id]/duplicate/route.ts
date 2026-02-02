
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Fetch Source Resume
        const { data: sourceResume, error: fetchError } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !sourceResume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        // 2. Create Duplicate Resume
        const { data: duplicateResume, error: createError } = await supabase
            .from("resumes")
            .insert({
                user_id: user.id,
                title: `${sourceResume.title} (Copy)`,
                template_id: sourceResume.template_id,
                is_public: false, // Default to private
                visual_config: sourceResume.visual_config,
                section_order: sourceResume.section_order,
                language: sourceResume.language,
                is_rtl: sourceResume.is_rtl,
            })
            .select()
            .single();

        if (createError || !duplicateResume) {
            console.error("Duplication Error (Resume):", createError);
            return new NextResponse("Failed to duplicate resume", { status: 500 });
        }

        const newId = duplicateResume.id;

        // 3. Duplicate Related Sections
        const sections = [
            "personal_info",
            "work_experiences",
            "education",
            "skills",
            "projects",
            "certifications",
            "languages"
        ];

        for (const section of sections) {
            const { data: sectionData } = await supabase
                .from(section)
                .select("*")
                .eq("resume_id", id);

            if (sectionData && sectionData.length > 0) {
                const duplicatedSectionData = sectionData.map((item: any) => {
                    const { id: _, resume_id: __, created_at: ___, updated_at: ____, ...rest } = item;
                    return {
                        ...rest,
                        resume_id: newId
                    };
                });

                const { error: sectionInsertError } = await supabase
                    .from(section)
                    .insert(duplicatedSectionData);

                if (sectionInsertError) {
                    console.error(`Duplication Error (${section}):`, sectionInsertError);
                }
            }
        }

        return NextResponse.json({ id: newId });
    } catch (error) {
        console.error("Duplication Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
