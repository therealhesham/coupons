import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/mailer";
import { ResultSetHeader } from "mysql2";

const PHONE_PATTERN = /^05[0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const allSectors = body?.allSectors !== false;
  const sectorIds: number[] = Array.isArray(body?.sectorIds)
    ? body.sectorIds.filter((id: unknown) => Number.isInteger(id))
    : [];

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
  if (!allSectors && sectorIds.length === 0) {
    return NextResponse.json(
      { error: "لازم تختار قطاع واحد على الأقل، أو تحدد كل القطاعات." },
      { status: 400 }
    );
  }

  await ensureSchema();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO registrations (name, phone, email, all_sectors) VALUES (?, ?, ?, ?)",
      [name, phone, email, allSectors]
    );
    const registrationId = result.insertId;

    if (!allSectors && sectorIds.length > 0) {
      const values = sectorIds.map((sectorId) => [registrationId, sectorId]);
      await connection.query(
        "INSERT INTO registration_sectors (registration_id, sector_id) VALUES ?",
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return NextResponse.json({ ok: true });
}
