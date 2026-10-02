/**
 * Premium HTML Email Templates for Supabase Auth.
 * These can be copied directly into Supabase Dashboard -> Authentication -> Email Templates,
 * or used programmatically with custom auth hooks / nodemailer.
 * 
 * Supports Supabase template variables:
 * - {{ .ConfirmationURL }} : The link to confirm email / reset password
 * - {{ .Token }}           : The 6-digit confirmation code
 * - {{ .Email }}           : Recipient email address
 * - {{ .SiteURL }}         : Base URL of the website
 */

export const SUPABASE_CONFIRM_SIGNUP_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your ResumeForge Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #102b2b;">
  <div style="display:none;font-size:1px;color:#f0f4f2;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Welcome to ResumeForge! Confirm your account to begin crafting AI-powered resumes and unlocking campus networks.
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f0f4f2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d4dfd9; box-shadow: 0 8px 30px rgba(16, 43, 43, 0.08);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #0d1f1f; padding: 32px 32px 28px; text-align: center; border-bottom: 4px solid #0d8274;">
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
              <div style="display: inline-block; background-color: rgba(216, 243, 107, 0.15); border: 1px solid #d8f36b; color: #d8f36b; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 14px; border-radius: 999px;">
                ACCOUNT ACTIVATION
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0d1f1f; letter-spacing: -0.5px;">
                Welcome to ResumeForge! 👋
              </h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #37534d;">
                You're just one step away from building ATS-beating resumes, preparing for interviews with real-time AI agents, and connecting with recruiter showcases.
              </p>

              <!-- Confirmation CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #0d1f1f; color: #d8f36b; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 10px; border: 1px solid #0d8274; box-shadow: 0 4px 14px rgba(13, 31, 31, 0.25);">
                      🚀 Confirm Your Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- OTP Code (if using token-based confirmation) -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f7faf8; border: 1.5px dashed #0d8274; border-radius: 10px; padding: 18px; margin: 20px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #52716a; margin-bottom: 6px;">
                      Alternative Confirmation Code
                    </div>
                    <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0d8274; line-height: 1.2;">
                      {{ .Token }}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.6; color: #64748b;">
                If the button above does not work, copy and paste this link into your web browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #0d8274; word-break: break-all; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Security Tip -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">🔒 Security Notice</div>
                    <div style="font-size: 11px; line-height: 1.5; color: #475569;">
                      ResumeForge will never ask for your password via email. If you did not create an account using <strong>{{ .Email }}</strong>, you can safely ignore this email.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7faf8; padding: 24px 32px; border-top: 1px solid #e2ece7; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #102b2b;">
                ResumeForge &bull; Career Workspace & Campus Talent Network
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} ResumeForge. All rights reserved.
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

export const SUPABASE_MAGIC_LINK_TEMPLATE = SUPABASE_CONFIRM_SIGNUP_TEMPLATE
  .replace("ACCOUNT ACTIVATION", "MAGIC LOGIN LINK")
  .replace("Welcome to ResumeForge! 👋", "Your Secure Login Link 🔑")
  .replace("You're just one step away from building ATS-beating resumes, preparing for interviews with real-time AI agents, and connecting with recruiter showcases.", "Click the button below to instantly sign in to your ResumeForge workspace without needing a password.")
  .replace("🚀 Confirm Your Account &rarr;", "⚡ Sign In to ResumeForge &rarr;");

export const SUPABASE_RESET_PASSWORD_TEMPLATE = SUPABASE_CONFIRM_SIGNUP_TEMPLATE
  .replace("ACCOUNT ACTIVATION", "PASSWORD RESET REQUEST")
  .replace("Welcome to ResumeForge! 👋", "Reset Your Password 🔐")
  .replace("You're just one step away from building ATS-beating resumes, preparing for interviews with real-time AI agents, and connecting with recruiter showcases.", "We received a request to reset the password for your ResumeForge account. Click the button below to choose a new password.")
  .replace("🚀 Confirm Your Account &rarr;", "🔒 Reset Password &rarr;");
