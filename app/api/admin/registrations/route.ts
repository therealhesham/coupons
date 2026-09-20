import { NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface RegistrationRow extends RowDataPacket {
  id: number;
  name: string;
  phone: string;
  email: string;
  all_sectors: number;
  registered_at: string;
}

interface RegistrationSectorRow extends RowDataPacket {
  registration_id: number;
  sector_name: string;
}

export async function GET() {
  await ensureSchema();
  const [rows] = await pool.query<RegistrationRow[]>(
    "SELECT id, name, phone, email, all_sectors, registered_at FROM registrations ORDER BY registered_at DESC"
  );
  const [regSectors] = await pool.query<RegistrationSectorRow[]>(
    `SELECT rs.registration_id, s.name AS sector_name
     FROM registration_sectors rs
     JOIN sectors s ON s.id = rs.sector_id`
  );

  const sectorsByRegistration = new Map<number, string[]>();
  for (const row of regSectors) {
    const list = sectorsByRegistration.get(row.registration_id) ?? [];
    list.push(row.sector_name);
    sectorsByRegistration.set(row.registration_id, list);
  }

  const registrations = rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    allSectors: Boolean(row.all_sectors),
    sectors: sectorsByRegistration.get(row.id) ?? [],
    registeredAt: row.registered_at,
  }));

  return NextResponse.json({ registrations });
}
