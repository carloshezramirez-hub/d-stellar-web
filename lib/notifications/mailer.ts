import nodemailer from "nodemailer";
import { emailEnv, isEmailConfigured } from "./env";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailEnv.user,
        pass: emailEnv.appPassword,
      },
    });
  }
  return transporter;
}

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, replyTo }: SendMailInput) {
  if (!isEmailConfigured()) {
    console.warn("[mailer] Email not configured (missing GMAIL_USER/GMAIL_APP_PASSWORD) — skipping send.");
    return { skipped: true as const };
  }

  await getTransporter().sendMail({
    from: `"d-stellar" <${emailEnv.user}>`,
    to,
    replyTo,
    subject,
    html,
  });

  return { skipped: false as const };
}
