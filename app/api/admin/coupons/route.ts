import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface CouponRow extends RowDataPacket {
  id: number;
  code: string;
  title: string;
  discount_percent: number;
  applies_to_all_sectors: number;
  created_at: string;
}

interface CouponSectorRow extends RowDataPacket {
  coupon_id: number;
  sector_id: number;
  sector_name: string;
}

export async function GET() {
  await ensureSchema();
  const [coupons] = await pool.query<CouponRow[]>(
    "SELECT id, code, title, discount_percent, applies_to_all_sectors, created_at FROM coupons ORDER BY created_at DESC"
  );
  const [couponSectors] = await pool.query<CouponSectorRow[]>(
    `SELECT cs.coupon_id, cs.sector_id, s.name AS sector_name
     FROM coupon_sectors cs
     JOIN sectors s ON s.id = cs.sector_id`
  );

  const sectorsByCoupon = new Map<number, string[]>();
  for (const row of couponSectors) {
    const list = sectorsByCoupon.get(row.coupon_id) ?? [];
    list.push(row.sector_name);
    sectorsByCoupon.set(row.coupon_id, list);
  }

  const result = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    title: coupon.title,
    discountPercent: coupon.discount_percent,
    appliesToAllSectors: Boolean(coupon.applies_to_all_sectors),
    sectors: sectorsByCoupon.get(coupon.id) ?? [],
    createdAt: coupon.created_at,
  }));

  return NextResponse.json({ coupons: result });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const discountPercent = Number(body?.discountPercent);
  const appliesToAllSectors = body?.appliesToAllSectors === true;
  const sectorIds: number[] = Array.isArray(body?.sectorIds)
    ? body.sectorIds.filter((id: unknown) => Number.isInteger(id))
    : [];

  if (!code) {
    return NextResponse.json({ error: "كود الكوبون مطلوب." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "اسم الكوبون مطلوب." }, { status: 400 });
  }
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return NextResponse.json(
      { error: "نسبة الخصم لازم تكون رقم بين 1 و 100." },
      { status: 400 }
    );
  }
  if (!appliesToAllSectors && sectorIds.length === 0) {
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
      "INSERT INTO coupons (code, title, discount_percent, applies_to_all_sectors) VALUES (?, ?, ?, ?)",
      [code, title, discountPercent, appliesToAllSectors]
    );
    const couponId = result.insertId;

    if (!appliesToAllSectors && sectorIds.length > 0) {
      const values = sectorIds.map((sectorId) => [couponId, sectorId]);
      await connection.query(
        "INSERT INTO coupon_sectors (coupon_id, sector_id) VALUES ?",
        [values]
      );
    }

    await connection.commit();
    return NextResponse.json({ ok: true, id: couponId });
  } catch (err) {
    await connection.rollback();
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "كود الكوبون ده مستخدم بالفعل." },
        { status: 409 }
      );
    }
    throw err;
  } finally {
    connection.release();
  }
}
