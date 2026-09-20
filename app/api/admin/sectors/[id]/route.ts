import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await ensureSchema();
  await pool.query("DELETE FROM sectors WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
