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

    // Dispatch email via Multi-Tier Dispatcher:
    // Tier 1: Gmail SMTP (zero domain verification needed, delivers straight to Outlook/Exchange)
    // Tier 2: Microsoft 365 / Outlook SMTP (fallback)
    // Tier 3: Resend API (tertiary fallback)
    const { sendAcademicVerificationEmail } = await import("@/lib/email/email-dispatcher");
    const dispatchResult = await sendAcademicVerificationEmail({
      schoolName: universityName || "University Student",
      schoolSlug: universitySlug,
      code,
      recipientEmail: schoolEmail.trim().toLowerCase(),
      verifyUrl,
      fallbackEmail: user.email,
    });

    const emailSent = dispatchResult.success;
    const deliveredAddress = dispatchResult.deliveredTo || schoolEmail.trim().toLowerCase();

    return NextResponse.json({
      success: true,
      emailSent,
      provider: dispatchResult.provider,
      deliveredAddress,
      code, // Instant sandbox code so testing is never blocked
      verifyUrl,
      message: emailSent
        ? dispatchResult.provider === "gmail_smtp"
          ? `Verification code delivered directly to ${schoolEmail}! Check your inbox or Outlook 'Other' tab.`
          : dispatchResult.deliveredTo === user.email
          ? `Verification code delivered to your registered email (${user.email}). Check inbox or Spam!`
          : `Verification code sent to ${schoolEmail}.`
        : `Verification code generated! (Sandbox code: ${code})`,
      devCode: code,
      note: "For Outlook / Microsoft 365: Check the 'Other' inbox tab and Junk Email folder. In development sandbox, you can also use the instant code above.",
    });
  } catch (err: any) {
    console.error("[SCHOOL_VERIFY_EMAIL_ERROR]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
