import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseResumeText, type ResumeData } from "@/lib/ai";

// Dynamic import for pdf-parse to avoid build issues
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
    } catch {
      return NextResponse.json(
        { error: "Failed to extract text from PDF" },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from PDF. The file may be image-based or corrupted." },
        { status: 400 }
      );
    }

    // Parse with AI
    let resumeData: ResumeData;
    try {
      resumeData = await parseResumeText(text);
    } catch (error) {
      console.error("AI parsing error:", error);
      return NextResponse.json(
        { error: "Failed to parse resume content. Please try again." },
        { status: 500 }
      );
    }

    // Create resume record
    const title = resumeData.personalInfo?.fullName
      ? `${resumeData.personalInfo.fullName}'s Resume`
      : `Imported Resume ${new Date().toLocaleDateString()}`;

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
      })
      .select()
      .single();

    if (resumeError) {
      console.error("Resume creation error:", resumeError);
      return NextResponse.json(
        { error: "Failed to create resume record" },
        { status: 500 }
      );
    }

    // Update profile with personal info if available
    if (resumeData.personalInfo) {
      const { fullName, email, phone, location, linkedin, website, github, summary } =
        resumeData.personalInfo;

      await supabase
        .from("profiles")
        .update({
          full_name: fullName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          location: location || undefined,
          linkedin_url: linkedin || undefined,
          website_url: website || undefined,
          github_url: github || undefined,
          summary: summary || undefined,
        })
        .eq("id", user.id);
    }

    // Insert work experiences
    if (resumeData.workExperience?.length > 0) {
      const workExperiences = resumeData.workExperience.map((exp, index) => ({
        resume_id: resume.id,
        company: exp.company,
        position: exp.position,
        location: exp.location || null,
        start_date: exp.startDate || null,
        end_date: exp.current ? null : exp.endDate || null,
        is_current: exp.current || false,
        description: exp.description || null,
        highlights: exp.highlights || [],
        sort_order: index,
      }));

      await supabase.from("work_experiences").insert(workExperiences);
    }

    // Insert education
    if (resumeData.education?.length > 0) {
      const education = resumeData.education.map((edu, index) => ({
        resume_id: resume.id,
        institution: edu.institution,
        degree: edu.degree || null,
        field_of_study: edu.field || null,
        location: edu.location || null,
        start_date: edu.startDate || null,
        end_date: edu.endDate || null,
        gpa: edu.gpa || null,
        achievements: edu.highlights || [],
        sort_order: index,
      }));

      await supabase.from("education").insert(education);
    }

    // Insert skills
    if (resumeData.skills?.length > 0) {
      const skills = resumeData.skills.flatMap((skillGroup, groupIndex) =>
        skillGroup.items.map((skill, index) => ({
          resume_id: resume.id,
          name: skill,
          category: skillGroup.category || "General",
          sort_order: groupIndex * 100 + index,
        }))
      );

      await supabase.from("skills").insert(skills);
    }

    // Insert projects
    if (resumeData.projects?.length > 0) {
      const projects = resumeData.projects.map((proj, index) => ({
        resume_id: resume.id,
        name: proj.name,
        description: proj.description || null,
        technologies: proj.technologies || [],
        url: proj.url || null,
        highlights: proj.highlights || [],
        sort_order: index,
      }));

      await supabase.from("projects").insert(projects);
    }

    // Insert certifications
    if (resumeData.certifications?.length > 0) {
      const certifications = resumeData.certifications.map((cert, index) => ({
        resume_id: resume.id,
        name: cert.name,
        issuer: cert.issuer || null,
        issue_date: cert.date || null,
        credential_url: cert.url || null,
        sort_order: index,
      }));

      await supabase.from("certifications").insert(certifications);
    }

    // Insert languages
    if (resumeData.languages?.length > 0) {
      const languages = resumeData.languages.map((lang, index) => ({
        resume_id: resume.id,
        name: lang.language,
        proficiency: lang.proficiency || "Professional",
        sort_order: index,
      }));

      await supabase.from("languages").insert(languages);
    }

    // Store uploaded resume reference
    await supabase.from("uploaded_resumes").insert({
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      extracted_text: text,
      parsed_data: resumeData,
      processing_status: "completed",
    });

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      message: "Resume parsed and saved successfully",
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
