import nodemailer, { Transporter } from "nodemailer";

declare global {
  var _mailTransporter: Transporter | undefined;
}

function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });
}

const transporter = global._mailTransporter ?? createTransporter();

if (process.env.NODE_ENV !== "production") {
  global._mailTransporter = transporter;
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "المعرض <no-reply@example.com>",
    to,
    subject: "أهلاً بيك في المعرض",
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; font-size: 16px; color: #222;">
        <p>أهلاً ${name}،</p>
        <p>تم تسجيل بياناتك بنجاح. هيوصلك كل عرض وخصم جديد في المعرض أول بأول.</p>
      </div>
    `,
  });
}
