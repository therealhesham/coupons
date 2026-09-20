import { NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const [rows] = await pool.query(
    "SELECT id, name, phone, email, registered_at FROM registrations ORDER BY registered_at DESC"
  );
  return NextResponse.json({ registrations: rows });
}
