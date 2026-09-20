import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const [rows] = await pool.query(
    "SELECT id, name FROM sectors ORDER BY name ASC"
  );
  return NextResponse.json({ sectors: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "اسم القطاع مطلوب." }, { status: 400 });
  }

  await ensureSchema();
  try {
    const [result] = await pool.query(
      "INSERT INTO sectors (name) VALUES (?)",
      [name]
    );
    const insertId = (result as { insertId: number }).insertId;
    return NextResponse.json({ id: insertId, name });
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "القطاع ده موجود بالفعل." },
        { status: 409 }
      );
    }
    throw err;
  }
}
