import { NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const [rows] = await pool.query(
    "SELECT id, name FROM sectors ORDER BY name ASC"
  );
  return NextResponse.json({ sectors: rows });
}
