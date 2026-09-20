import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@/lib/auth";

interface AdminUserRow {
  id: number;
  password_hash: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "اسم المستخدم وكلمة المرور مطلوبين." },
      { status: 400 }
    );
  }

  await ensureSchema();
  const [rows] = await pool.query(
    "SELECT id, password_hash FROM admin_users WHERE username = ? LIMIT 1",
    [username]
  );
  const admin = (rows as AdminUserRow[])[0];

  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return NextResponse.json(
      { error: "اسم المستخدم أو كلمة المرور غير صحيحة." },
      { status: 401 }
    );
  }

  const token = createSessionToken(admin.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
