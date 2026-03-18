import nodemailer from "nodemailer";

async function getTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Fallback to Ethereal for local dev only
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

export async function sendCredentialsEmail(to: string, name: string, tempPassword: string) {
  const transport = await getTransport();

  const info = await transport.sendMail({
    from: `"Lesotho Home Affairs" <${process.env.SMTP_FROM ?? "noreply@homeaffairs.gov.ls"}>`,
    to,
    subject: "Your Lesotho Home Affairs Portal Account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#003580;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">Ministry of Home Affairs</h1>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Kingdom of Lesotho — National ID Portal</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:15px;">Dear <strong>${name}</strong>,</p>
          <p style="color:#374151;font-size:14px;">Your account has been created on the Lesotho National ID Registration Portal. Use the credentials below to sign in.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Email Address</p>
            <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#111827;">${to}</p>
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Temporary Password</p>
            <p style="margin:0;font-size:18px;font-weight:bold;color:#003580;letter-spacing:2px;">${tempPassword}</p>
          </div>
          <p style="color:#dc2626;font-size:13px;font-weight:600;">⚠ You will be required to change this password on your first login.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://id-application.vercel.app"}/login" style="display:inline-block;margin-top:16px;background:#003580;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
            Sign In to Portal
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you did not request this account, please contact Home Affairs immediately.</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("📧 Email preview:", previewUrl);
  return previewUrl || null;
}
