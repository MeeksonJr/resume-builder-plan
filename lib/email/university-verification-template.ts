/**
 * High-aesthetic, responsive, institutional HTML email template for University Verification.
 * Designed for 100% deliverability and pixel-perfect rendering across Microsoft Outlook,
 * Microsoft 365 Exchange, Gmail, Apple Mail, and mobile inboxes.
 */

export interface UniversityVerificationEmailOptions {
  schoolName: string;
  schoolSlug: string;
  code: string;
  recipientEmail: string;
  verifyUrl: string;
  expiresInMinutes?: number;
}

export function generateUniversityVerificationEmailHtml({
  schoolName,
  schoolSlug,
  code,
  recipientEmail,
  verifyUrl,
  expiresInMinutes = 15,
}: UniversityVerificationEmailOptions): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${schoolName} Verification - ResumeForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #102b2b;">
  <!-- Preheader preview text in inbox -->
  <div style="display:none;font-size:1px;color:#f0f4f2;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Your ResumeForge student verification code is ${code}. Verify your student affiliation for ${schoolName} to unlock your campus portal.
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f0f4f2; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 590px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d4dfd9; box-shadow: 0 10px 32px rgba(16, 43, 43, 0.08);">
          
          <!-- Top Brand & School Header Banner -->
          <tr>
            <td style="background-color: #0d1f1f; padding: 32px 32px 28px; text-align: center; border-bottom: 4px solid #0d8274;">
              
              <!-- ResumeForge Logo Mark -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0d8274 0%, #085a50 100%); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle; border: 1px solid #20b2aa;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 20px; font-weight: 900; color: #d8f36b; letter-spacing: -0.5px; display: inline-block;">RF</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.1;">ResumeForge</div>
                    <div style="font-size: 11px; font-weight: 600; color: #8bbcb2; letter-spacing: 0.5px; text-transform: uppercase;">AI Career Studio & Campus Network</div>
                  </td>
                </tr>
              </table>

              <!-- Badge Pill -->
              <div style="display: inline-block; background-color: rgba(216, 243, 107, 0.15); border: 1px solid #d8f36b; color: #d8f36b; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 14px; border-radius: 999px; margin-bottom: 12px;">
                FERPA-COMPLIANT ACADEMIC PORTAL
              </div>

              <!-- Institution Heading -->
              <h1 style="margin: 0 0 4px; font-size: 24px; font-weight: 800; color: #f8faf8; letter-spacing: -0.5px;">
                ${schoolName}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #9cb8b0; font-weight: 500;">
                Institutional Student Identity Verification
              </p>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #0d1f1f;">
                Hello Scholar,
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #37534d;">
                We received a request to confirm your student enrollment status at <strong>${schoolName}</strong> for your academic email <strong>${recipientEmail}</strong>.
              </p>

              <!-- Stylized OTP Verification Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f7faf8 0%, #edf4f1 100%); border: 2px dashed #0d8274; border-radius: 12px; padding: 24px 16px; margin: 26px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #52716a; margin-bottom: 8px;">
                      Your Single-Use Verification Code
                    </div>
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #0d8274; line-height: 1.2; display: inline-block; padding: 4px 0;">
                      ${code}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 10px; font-weight: 600;">
                      ⏱️ Valid for ${expiresInMinutes} minutes &bull; Single-use security token
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 1-Click Verification Action Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; background-color: #0d1f1f; color: #d8f36b; text-decoration: none; font-size: 15px; font-weight: 800; padding: 15px 36px; border-radius: 10px; border: 1px solid #0d8274; box-shadow: 0 6px 18px rgba(13, 31, 31, 0.25);">
                      ⚡ Verify Student Status with 1-Click &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What This Unlocks Section -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8faf9; border: 1px solid #e1e9e5; border-radius: 10px; padding: 16px 20px; margin: 24px 0;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 800; color: #0d1f1f; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                      🎓 What your verification unlocks:
                    </div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #37534d;">
                      <li>Official listing in the <strong>${schoolName} Student Cohort Directory</strong></li>
                      <li>Campus Career Fair recruiter showcase & pitch deck portfolio</li>
                      <li>Direct access to alumni networking & institutional job leads</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- University Outlook / Exchange Deliverability Helper -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f7fd; border: 1px solid #c7dcf7; border-radius: 8px; padding: 14px 18px; margin-top: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">
                      📬 Using University Outlook or Microsoft 365?
                    </div>
                    <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #334155;">
                      University spam filters often place automated career emails in your <strong>Other</strong> inbox tab or <strong>Junk Email</strong> folder. Move this email to <strong>Focused</strong> or add ResumeForge to your Safe Senders list to never miss career opportunities.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7faf8; padding: 24px 32px; border-top: 1px solid #e2ece7; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #102b2b;">
                ResumeForge &bull; Verified Academic Network
              </p>
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748b; line-height: 1.5;">
                Access your campus portal anytime at: <br>
                <a href="${verifyUrl}" style="color: #0d8274; font-weight: 600; text-decoration: underline;">https://resume-builder-plan.vercel.app/dashboard/portal/${schoolSlug}</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 10px; color: #94a3b8;">
                &copy; ${currentYear} ResumeForge Inc. All rights reserved. &bull; If you did not initiate this request, you can disregard this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
