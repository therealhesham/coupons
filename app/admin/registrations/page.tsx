"use client";

import { useEffect, useState } from "react";

interface Registration {
  id: number;
  name: string;
  phone: string;
  email: string;
  allSectors: boolean;
  sectors: string[];
  registeredAt: string;
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/registrations");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRegistrations(data.registrations ?? []);
      } catch {
        setError("تعذر تحميل بيانات المسجلين، حاول تاني.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink">المسجلين</h1>
        <p className="text-base leading-7 text-ink-soft">
          الأشخاص اللي سجّلوا بياناتهم في المعرض.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">بيتحمّل...</p>
      ) : error ? (
        <p className="text-sm text-[#9b3b3b]">{error}</p>
      ) : registrations.length === 0 ? (
        <p className="text-sm text-ink-soft">لسه مفيش تسجيلات.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-paper-line bg-white">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-paper-line text-sm text-ink-soft">
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium">الجوال</th>
                <th className="px-4 py-3 font-medium">البريد الإلكتروني</th>
                <th className="px-4 py-3 font-medium">القطاعات</th>
                <th className="px-4 py-3 font-medium">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-b border-paper-line last:border-0">
                  <td className="px-4 py-3 text-base text-ink">{r.name}</td>
                  <td dir="ltr" className="px-4 py-3 text-base text-ink-soft">
                    {r.phone}
                  </td>
                  <td dir="ltr" className="px-4 py-3 text-base text-ink-soft">
                    {r.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-soft">
                    {r.allSectors ? "كل القطاعات" : r.sectors.join("، ") || "بدون قطاعات"}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-soft">
                    {new Date(r.registeredAt).toLocaleString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
