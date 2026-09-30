import { Resend } from "resend";
import nodemailer from "nodemailer";
import { getBaseUrl } from "@/lib/utils";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Global Resend client if key is configured
function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  return key && key.trim().length > 0 ? new Resend(key.trim()) : null;
}

// SMTP transporter if configured (e.g. Gmail App Password or custom SMTP)
function getSmtpTransporter() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim().replace(/\s+/g, ""),
      },
    });
  }
  return null;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const fromAddress = process.env.EMAIL_FROM || "Kartshart <onboarding@resend.dev>";

  // 1. Try Resend if API key is provided
  const resend = getResendClient();
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
        text,
      });

      if (response.error) {
        console.error("Resend delivery issue:", response.error);
        // If domain not verified yet, try sending from onboarding@resend.dev
        if (fromAddress !== "Kartshart <onboarding@resend.dev>") {
          const fallbackRes = await resend.emails.send({
            from: "Kartshart <onboarding@resend.dev>",
            to,
            subject,
            html,
            text,
          });
          if (!fallbackRes.error) {
            return { success: true, id: fallbackRes.data?.id };
          }
        }
      } else {
        return { success: true, id: response.data?.id };
      }
    } catch (err) {
      console.error("Failed sending email via Resend:", err);
    }
  }

  // 2. Try SMTP fallback (Gmail or Custom SMTP)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER ? `Kartshart <${process.env.SMTP_USER}>` : fromAddress,
        to,
        subject,
        html,
        text,
      });
      return { success: true, id: info.messageId };
    } catch (err) {
      console.error("Failed sending email via SMTP:", err);
    }
  }

  // 3. Fallback for development if no email keys set
  console.log("\n============================================================");
  console.log("📧 [DEV EMAIL CONSOLE FALLBACK]");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("------------------------------------------------------------");
  if (text) console.log(`Text: ${text}`);
  console.log("============================================================\n");

  return { success: true, id: "dev-simulated-id" };
}

// ============================================================================
// EMAIL TEMPLATES (BRANDED, CLEAN HTML)
// ============================================================================

function getEmailLayout(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 30px 15px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px 32px; text-align: left; }
    .brand { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-decoration: none; }
    .content { padding: 32px; }
    .otp-box { background: #f1f5f9; border-radius: 8px; padding: 18px 24px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1; }
    .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; font-family: monospace; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${getBaseUrl()}" class="brand">Kartshart</a>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Kartshart.com • All rights reserved.<br>
      This is an automated security notification.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Send OTP Login Code
 */
export async function sendOtpEmail(email: string, code: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n🔑 >>> DEV LOGIN OTP for ${email}: [ ${code} ] <<<\n`);
  }

  const subject = "Your Kartshart login code";
  const html = getEmailLayout(
    subject,
    `
    <h2 style="margin-top:0; font-size:20px; color:#0f172a;">Sign in to Kartshart</h2>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      Use the 6-digit verification code below to securely sign in to your Kartshart account. This code is valid for <strong>10 minutes</strong>.
    </p>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
    </div>
    <p style="color:#64748b; font-size:13px; line-height:1.5;">
      If you did not request this code, you can safely ignore this email. Do not share this code with anyone.
    </p>
    `
  );

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Your Kartshart verification code is: ${code}. It expires in 10 minutes.`,
  });
}

/**
 * 2. Access Request Received (to Requester)
 */
export async function sendAccessRequestReceivedEmail(
  email: string,
  name: string
) {
  const subject = "Your Kartshart dashboard access request has been received";
  const html = getEmailLayout(
    subject,
    `
    <h2 style="margin-top:0; font-size:20px; color:#0f172a;">Hello ${name},</h2>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      We have received your request for dashboard access on <strong>Kartshart</strong>.
    </p>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      Our Super Admin will review your request. Once approved, you will receive an email notification allowing you to sign in with your email OTP.
    </p>
    <p style="color:#64748b; font-size:13px;">Thank you for your interest in contributing to Kartshart.</p>
    `
  );

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Hello ${name}, your Kartshart access request has been received and is pending Super Admin review.`,
  });
}

/**
 * 3. New Access Request (to Super Admin)
 */
export async function sendNewAccessRequestToAdminEmail(
  superAdminEmail: string,
  requesterName: string,
  requesterEmail: string,
  reason: string
) {
  const subject = `[Action Required] New Dashboard Access Request from ${requesterName}`;
  const reviewUrl = `${getBaseUrl()}/dashboard/access-requests`;

  const html = getEmailLayout(
    subject,
    `
    <h2 style="margin-top:0; font-size:20px; color:#0f172a;">New Access Request</h2>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      A new user has requested access to the Kartshart dashboard:
    </p>
    <div style="background:#f8fafc; border-radius:8px; padding:16px; margin:16px 0; border:1px solid #e2e8f0;">
      <p style="margin:4px 0;"><strong>Name:</strong> ${requesterName}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${requesterEmail}</p>
      <p style="margin:8px 0 0 0;"><strong>Reason:</strong></p>
      <p style="margin:4px 0; color:#334155; font-style:italic;">"${reason}"</p>
    </div>
    <div style="text-align:center; margin:24px 0;">
      <a href="${reviewUrl}" class="btn">Review Request in Dashboard</a>
    </div>
    `
  );

  return sendEmail({
    to: superAdminEmail,
    subject,
    html,
    text: `New access request from ${requesterName} (${requesterEmail}). Reason: ${reason}. Review at: ${reviewUrl}`,
  });
}

/**
 * 4. Access Approved (to Requester)
 */
export async function sendAccessApprovedEmail(
  email: string,
  name: string,
  role: string
) {
  const loginUrl = `${getBaseUrl()}/login`;
  const subject = "Your Kartshart dashboard access has been approved! 🎉";

  const html = getEmailLayout(
    subject,
    `
    <h2 style="margin-top:0; font-size:20px; color:#0f172a;">Welcome to Kartshart, ${name}!</h2>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      Your request for dashboard access has been <strong>approved</strong> as an <strong>${role}</strong>.
    </p>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      You can now log in using your email address and a one-time OTP code:
    </p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${loginUrl}" class="btn">Log In to Dashboard</a>
    </div>
    <p style="color:#64748b; font-size:13px;">Login URL: <a href="${loginUrl}">${loginUrl}</a></p>
    `
  );

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Hello ${name}, your Kartshart access has been approved as ${role}. You can now log in at ${loginUrl}`,
  });
}

/**
 * 5. Access Rejected (to Requester)
 */
export async function sendAccessRejectedEmail(
  email: string,
  name: string,
  reviewNote?: string
) {
  const subject = "Update regarding your Kartshart dashboard access request";

  const html = getEmailLayout(
    subject,
    `
    <h2 style="margin-top:0; font-size:20px; color:#0f172a;">Hello ${name},</h2>
    <p style="color:#475569; font-size:15px; line-height:1.6;">
      Thank you for your interest in Kartshart. After review, we are unable to approve your dashboard access request at this time.
    </p>
    ${
      reviewNote
        ? `<div style="background:#f8fafc; border-radius:8px; padding:14px; margin:16px 0; border:1px solid #e2e8f0; font-size:14px; color:#475569;"><strong>Note:</strong> ${reviewNote}</div>`
        : ""
    }
    <p style="color:#64748b; font-size:13px;">You can continue reading and enjoying all public articles on Kartshart.</p>
    `
  );

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Hello ${name}, your Kartshart access request was not approved at this time.`,
  });
}

/**
 * 6. Contact Form Notification (to Super Admin)
 */
export async function sendContactFormNotificationEmail(
  superAdminEmail: string,
  senderName: string,
  senderEmail: string,
  subjectText: string,
  messageText: string
) {
  const subject = `[Kartshart Contact] ${subjectText} - from ${senderName}`;
  const inboxUrl = `${getBaseUrl()}/dashboard/messages`;

  const html = getEmailLayout(
    subject,
    `
    <h2 style="margin-top:0; font-size:20px; color:#0f172a;">New Contact Message Received</h2>
    <div style="background:#f8fafc; border-radius:8px; padding:16px; margin:16px 0; border:1px solid #e2e8f0;">
      <p style="margin:4px 0;"><strong>From:</strong> ${senderName} (&lt;${senderEmail}&gt;)</p>
      <p style="margin:4px 0;"><strong>Subject:</strong> ${subjectText}</p>
      <p style="margin:12px 0 0 0;"><strong>Message:</strong></p>
      <p style="margin:4px 0; color:#1e293b; white-space: pre-wrap;">${messageText}</p>
    </div>
    <div style="text-align:center; margin:24px 0;">
      <a href="${inboxUrl}" class="btn">View Messages Inbox</a>
    </div>
    `
  );

  return sendEmail({
    to: superAdminEmail,
    subject,
    html,
    text: `New contact message from ${senderName} (${senderEmail})\nSubject: ${subjectText}\nMessage: ${messageText}`,
  });
}
