import nodemailer from "nodemailer";
import { escapeHtml } from "@/lib/utils/escape-html";

// Swap to any email provider by replacing this file.
// Required env vars: GMAIL_USER, GMAIL_APP_PASSWORD, EMAIL_FROM
function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const FROM =
  process.env.EMAIL_FROM ??
  `Lumevelo <${process.env.GMAIL_USER ?? "noreply@lumevelo.com"}>`;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  await getTransporter().sendMail({
    from: FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com";
  await sendEmail({
    to: email,
    subject: `${code} — Your Lumevelo verification code`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a3c5e;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Lumevelo</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1a1a2e;">Verify your email address</p>
            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
              Use the code below to complete your verification. It expires in <strong>5 minutes</strong>.
            </p>

            <!-- OTP box -->
            <div style="background:#f0f4ff;border:2px dashed #3b6fd4;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
              <span style="font-size:38px;font-weight:800;letter-spacing:12px;color:#1a3c5e;font-family:monospace;">${code}</span>
            </div>

            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Do not share this code with anyone. Lumevelo staff will never ask for your verification code.
            </p>
          </td>
        </tr>

        <!-- Security notice -->
        <tr>
          <td style="padding:0 40px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-left:4px solid #f97316;border-radius:4px;">
              <tr>
                <td style="padding:16px 18px;">
                  <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#92400e;">Didn't request this code?</p>
                  <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">
                    Someone may have entered your email address. Secure your account immediately by reviewing your recent login activity.
                  </p>
                  <a href="${appUrl}/account/security"
                     style="display:inline-block;margin-top:12px;font-size:13px;font-weight:600;color:#ea580c;text-decoration:none;">
                    Review account security →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Lumevelo ·
              <a href="${appUrl}" style="color:#9ca3af;text-decoration:none;">lumevelo.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendEnquiryNotification(
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  buyerName: string,
  message: string,
): Promise<void> {
  await sendEmail({
    to: sellerEmail,
    subject: `Lumevelo: New enquiry on "${listingTitle}"`,
    html: `
      <h2>New Enquiry</h2>
      <p>Hi ${escapeHtml(sellerName)},</p>
      <p><strong>${escapeHtml(buyerName)}</strong> sent an enquiry on your listing <strong>${escapeHtml(listingTitle)}</strong>:</p>
      <blockquote>${escapeHtml(message)}</blockquote>
      <p>Log in to your dashboard to respond.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/enquiries">View enquiry →</a>
    `,
  });
}

export async function sendSubscriptionConfirmation(
  email: string,
  name: string,
  planName: string,
  periodEnd: Date,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `You're now on Lumevelo ${planName}`,
    html: `
      <h2>Subscription Confirmed</h2>
      <p>Hi ${escapeHtml(name)}, welcome to <strong>${escapeHtml(planName)}</strong>!</p>
      <p>Your plan is active until <strong>${periodEnd.toLocaleDateString()}</strong>.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to your dashboard →</a>
    `,
  });
}

export async function sendDailyMetalPriceDigest(
  email: string,
  name: string,
  prices: { metal: string; priceUsd: number; changePct: number }[],
): Promise<void> {
  const rows = prices
    .map(
      (p) =>
        `<tr><td>${p.metal}</td><td>$${p.priceUsd.toFixed(2)}/g</td>
         <td style="color:${p.changePct >= 0 ? "green" : "red"}">${p.changePct >= 0 ? "▲" : "▼"} ${Math.abs(p.changePct).toFixed(2)}%</td></tr>`,
    )
    .join("");

  await sendEmail({
    to: email,
    subject: `Daily metal price update: ${new Date().toLocaleDateString()}`,
    html: `
      <h2>Today's Metal Prices</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <table border="1" cellpadding="8" style="border-collapse:collapse">
        <tr><th>Metal</th><th>Price/gram</th><th>24h Change</th></tr>
        ${rows}
      </table>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/metal-prices">View full chart →</a></p>
    `,
  });
}
