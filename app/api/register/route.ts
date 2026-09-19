import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

const PHONE_PATTERN = /^05[0-9]{8}$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "الاسم مطلوب." }, { status: 400 });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { error: "رقم الجوال غير صحيح." },
      { status: 400 }
    );
  }

  await ensureSchema();
  await pool.query("INSERT INTO registrations (name, phone) VALUES (?, ?)", [
    name,
    phone,
  ]);

  return NextResponse.json({ ok: true });
}
