import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schoolEmail, universityName } = await req.json();

    if (!schoolEmail || !schoolEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid university email" }, { status: 400 });
    }

    const universitySlug = (universityName || schoolEmail.split("@")[1].split(".")[0])
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Insert into school_verification_codes
    const { error: dbError } = await supabase.from("school_verification_codes").insert({
      user_id: user.id,
      school_email: schoolEmail.trim().toLowerCase(),
      university_slug: universitySlug,
      university_name: universityName || "University Student",
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (dbError) {
      console.error("[SCHOOL_VERIFICATION] DB Error:", dbError);
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }

    // Try sending email via Resend
    let emailSent = false;
    let emailErrorMsg = "";
    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: "ResumeForge <onboarding@resend.dev>",
          to: schoolEmail.trim().toLowerCase(),
          subject: `Your ${universityName || "University"} Verification Code: ${code}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #102b2b; margin-top: 0;">University Portal Verification</h2>
              <p style="color: #4a5568; font-size: 15px;">You requested to verify your student status for <strong>${universityName}</strong> on ResumeForge.</p>
              <div style="margin: 24px 0; padding: 16px; background-color: #f7fafc; border-radius: 6px; text-align: center;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0d8274; font-family: monospace;">${code}</span>
              </div>
              <p style="color: #718096; font-size: 13px;">This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        });

        if (sendResult.error) {
          console.warn("[SCHOOL_VERIFICATION] Resend API error:", sendResult.error);
          emailErrorMsg = sendResult.error.message || "Email provider rejected send";
          emailSent = false;
        } else {
          emailSent = true;
        }
      } catch (emailErr: any) {
        console.warn("[SCHOOL_VERIFICATION] Resend email failed:", emailErr);
        emailErrorMsg = emailErr?.message || "Failed to reach email provider";
        emailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      code, // Include generated code so users can verify even without domain setup
      message: emailSent
        ? `Verification code sent to ${schoolEmail}. Check your inbox or Junk/Spam folder.`
        : `Verification code generated! (Sandbox mode: code is ${code})`,
      devCode: code,
      note: !emailSent
        ? "Resend test domain only sends to registered developer email. Use the instant code above to verify immediately."
        : "Check Outlook 'Focused' and 'Other' tabs as well as 'Junk Email'.",
    });
  } catch (err: any) {
    console.error("[SCHOOL_VERIFY_EMAIL_ERROR]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
