import nodemailer from "nodemailer";
import { Resend } from "resend";
import { generateUniversityVerificationEmailHtml } from "./university-verification-template";

export interface SendVerificationOptions {
  schoolName: string;
  schoolSlug: string;
  code: string;
  recipientEmail: string;
  verifyUrl: string;
  fallbackEmail?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  provider: "gmail_smtp" | "outlook_smtp" | "resend" | "none";
  deliveredTo?: string;
  messageId?: string;
  error?: string;
}

/**
 * Multi-Tier Email Dispatcher:
 * Tier 1: Gmail SMTP (zero domain verification needed, delivers straight to Outlook/Exchange)
 * Tier 2: Microsoft 365 / Outlook SMTP (fallback if configured)
 * Tier 3: Resend API (tertiary fallback)
 */
export async function sendAcademicVerificationEmail(
  options: SendVerificationOptions
): Promise<EmailDispatchResult> {
  const { schoolName, schoolSlug, code, recipientEmail, verifyUrl, fallbackEmail } = options;
  const targetEmail = recipientEmail.trim().toLowerCase();

  const html = generateUniversityVerificationEmailHtml({
    schoolName,
    schoolSlug,
    code,
    recipientEmail: targetEmail,
    verifyUrl,
    expiresInMinutes: 15,
  });

  const subject = `Your ${schoolName} Verification Code: ${code}`;

  // -------------------------------------------------------------
  // TIER 1: Gmail SMTP via Nodemailer (Zero DNS records required)
  // -------------------------------------------------------------
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, "");

  if (gmailUser && gmailAppPass) {
    try {
      console.info(`[EMAIL_DISPATCHER] Attempting Tier 1 (Gmail SMTP) -> ${targetEmail}`);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.GMAIL_FROM_NAME || "ResumeForge Academic Verification"}" <${gmailUser}>`,
        to: targetEmail,
        replyTo: gmailUser,
        subject,
        html,
      });

      console.info(`[EMAIL_DISPATCHER] Tier 1 (Gmail SMTP) succeeded! ID: ${info.messageId}`);
      return {
        success: true,
        provider: "gmail_smtp",
        deliveredTo: targetEmail,
        messageId: info.messageId,
      };
    } catch (gmailErr: any) {
      console.warn("[EMAIL_DISPATCHER] Tier 1 (Gmail SMTP) failed:", gmailErr.message);
    }
  }

  // -------------------------------------------------------------
  // TIER 2: Outlook / Microsoft 365 SMTP via Nodemailer
  // -------------------------------------------------------------
  const outlookUser = process.env.OUTLOOK_USER?.trim();
  const outlookPass = process.env.OUTLOOK_PASS?.trim();

  if (outlookUser && outlookPass) {
    try {
      console.info(`[EMAIL_DISPATCHER] Attempting Tier 2 (Outlook SMTP) -> ${targetEmail}`);

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: outlookUser,
          pass: outlookPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"ResumeForge Verification" <${outlookUser}>`,
        to: targetEmail,
        subject,
        html,
      });

      console.info(`[EMAIL_DISPATCHER] Tier 2 (Outlook SMTP) succeeded! ID: ${info.messageId}`);
      return {
        success: true,
        provider: "outlook_smtp",
        deliveredTo: targetEmail,
        messageId: info.messageId,
      };
    } catch (outlookErr: any) {
      console.warn("[EMAIL_DISPATCHER] Tier 2 (Outlook SMTP) failed:", outlookErr.message);
    }
  }

  // -------------------------------------------------------------
  // TIER 3: Resend API (Tertiary Fallback)
  // -------------------------------------------------------------
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      console.info(`[EMAIL_DISPATCHER] Attempting Tier 3 (Resend API) -> ${targetEmail}`);
      const resend = new Resend(resendKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "ResumeForge <onboarding@resend.dev>";

      // Try sending directly to target school email
      const directResult = await resend.emails.send({
        from: fromEmail,
        to: targetEmail,
        subject,
        html,
      });

      if (!directResult.error) {
        console.info(`[EMAIL_DISPATCHER] Tier 3 (Resend direct) succeeded! ID: ${directResult.data?.id}`);
        return {
          success: true,
          provider: "resend",
          deliveredTo: targetEmail,
          messageId: directResult.data?.id,
        };
      }

      console.warn("[EMAIL_DISPATCHER] Resend direct rejected (likely sandbox restriction):", directResult.error.message);

      // If sandbox restriction and we have a verified fallback account email
      if (fallbackEmail) {
        console.info(`[EMAIL_DISPATCHER] Resend sandbox fallback -> ${fallbackEmail}`);
        const fallbackResult = await resend.emails.send({
          from: fromEmail,
          to: fallbackEmail.trim().toLowerCase(),
          subject: `[Verification Fallback] ${subject}`,
          html,
        });

        if (!fallbackResult.error) {
          return {
            success: true,
            provider: "resend",
            deliveredTo: fallbackEmail,
            messageId: fallbackResult.data?.id,
          };
        }
      }
    } catch (resendErr: any) {
      console.warn("[EMAIL_DISPATCHER] Tier 3 (Resend API) failed:", resendErr.message);
    }
  }

  return {
    success: false,
    provider: "none",
    error: "All configured email providers failed to dispatch message.",
  };
}
