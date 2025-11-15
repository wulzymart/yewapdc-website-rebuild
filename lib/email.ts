import nodemailer from "nodemailer";

import { env } from "@/lib/utils/env";

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<void> {
  if (!to) {
    return;
  }
  const bodyHtml = html ?? text;

  // If configured for SMTP and credentials are present, send a real email.
  if (env.EMAIL_PROVIDER === "smtp") {
    const host = env.SMTP_HOST;
    const port = env.SMTP_PORT ? Number(env.SMTP_PORT) : 587;
    const user = env.SMTP_USER;
    const password = env.SMTP_PASSWORD;
    const from = env.SMTP_FROM;

    if (host && user && password && from) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass: password,
          },
        });

        await transporter.sendMail({
          from,
          to,
          subject,
          text,
          html: bodyHtml,
        });

        return;
      } catch (error) {
        console.error("[email] SMTP send failed, falling back to console log", error);
      }
    } else {
      console.warn("[email] SMTP provider selected but SMTP_* env vars are incomplete; falling back to console log.");
    }
  }

  // Fallback: log to console (useful in development or when EMAIL_PROVIDER=console).
  console.log("[email] send (console)", {
    to,
    subject,
    text,
    hasHtml: typeof bodyHtml === "string" && bodyHtml.length > 0,
  });
}
