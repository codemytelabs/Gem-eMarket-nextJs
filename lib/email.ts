import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils/escape-html";

// Swap to any email provider by replacing this file.
// Required env vars: RESEND_API_KEY, EMAIL_FROM
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "GemCeylon <noreply@gemceylon.com>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
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
    subject: `New enquiry on "${listingTitle}" — GemCeylon`,
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
    subject: `You're now on GemCeylon ${planName}`,
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
    subject: `Daily metal price update — ${new Date().toLocaleDateString()}`,
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
