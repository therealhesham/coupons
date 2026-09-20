import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/mailer";

const PHONE_PATTERN = /^05[0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "الاسم مطلوب." }, { status: 400 });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { error: "رقم الجوال غير صحيح." },
      { status: 400 }
    );
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "البريد الإلكتروني غير صحيح." },
      { status: 400 }
    );
  }

  await ensureSchema();
  await pool.query(
    "INSERT INTO registrations (name, phone, email) VALUES (?, ?, ?)",
    [name, phone, email]
  );

  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return NextResponse.json({ ok: true });
}
