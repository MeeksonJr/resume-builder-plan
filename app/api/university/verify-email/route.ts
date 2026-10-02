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

    // Build origin and 1-click verify URL
    const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    const cleanOrigin = origin.replace(/\/$/, "");
    const verifyUrl = `${cleanOrigin}/dashboard/portal/verify?code=${code}&email=${encodeURIComponent(schoolEmail.trim().toLowerCase())}&slug=${universitySlug}`;

    // Import dynamic HTML template generator
    const { generateUniversityVerificationEmailHtml } = await import("@/lib/email/university-verification-template");
    const emailHtml = generateUniversityVerificationEmailHtml({
      schoolName: universityName || "University Student",
      schoolSlug: universitySlug,
      code,
      recipientEmail: schoolEmail.trim().toLowerCase(),
      verifyUrl,
      expiresInMinutes: 15,
    });

    // Try sending email via Resend
    let emailSent = false;
    let deliveredAddress = "";
    let emailErrorMsg = "";

    if (resend) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "ResumeForge <onboarding@resend.dev>";
      
      // 1. Try sending directly to university email (.edu)
      try {
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: schoolEmail.trim().toLowerCase(),
          subject: `Your ${universityName || "University"} Verification Code: ${code}`,
          html: emailHtml,
        });

        if (sendResult.error) {
          console.warn("[SCHOOL_VERIFICATION] Resend direct send rejected:", sendResult.error.message);
          emailErrorMsg = sendResult.error.message;
        } else {
          emailSent = true;
          deliveredAddress = schoolEmail.trim().toLowerCase();
        }
      } catch (err: any) {
        console.warn("[SCHOOL_VERIFICATION] Direct send failed:", err?.message);
        emailErrorMsg = err?.message;
      }

      // 2. If direct send failed due to Resend sandbox restriction (403), deliver to user's registered account email
      if (!emailSent && user.email) {
        try {
          console.info(`[SCHOOL_VERIFICATION] Resend sandbox fallback: sending to account email ${user.email}`);
          const fallbackResult = await resend.emails.send({
            from: fromEmail,
            to: user.email,
            subject: `[Verification Fallback] Your ${universityName || "University"} Code: ${code}`,
            html: emailHtml,
          });

          if (!fallbackResult.error) {
            emailSent = true;
            deliveredAddress = user.email;
          }
        } catch (fallbackErr: any) {
          console.warn("[SCHOOL_VERIFICATION] Fallback send failed:", fallbackErr?.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      deliveredAddress,
      code, // Instant sandbox code so testing is never blocked
      verifyUrl,
      message: emailSent
        ? deliveredAddress === user.email
          ? `Verification code delivered to your registered email (${user.email}) due to email provider sandbox testing. Check inbox or Spam!`
          : `Verification code sent to ${schoolEmail}. Note for Outlook users: check 'Other' tab and Junk Email.`
        : `Verification code generated! (Sandbox code: ${code})`,
      devCode: code,
      note: "For Outlook / Microsoft 365: Check the 'Other' inbox tab and Junk Email folder. In development sandbox, you can also use the instant code above.",
    });
  } catch (err: any) {
    console.error("[SCHOOL_VERIFY_EMAIL_ERROR]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
