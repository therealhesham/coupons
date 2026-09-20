"use client";

import { useEffect, useState, FormEvent } from "react";

interface Sector {
  id: number;
  name: string;
}

export default function AdminSectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadSectors() {
    try {
      const res = await fetch("/api/admin/sectors");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSectors(data.sectors ?? []);
    } catch {
      setError("تعذر تحميل القطاعات، حاول تاني.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSectors();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/sectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "حصل خطأ، حاول تاني.");
      }
      setName("");
      await loadSectors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/sectors/${id}`, { method: "DELETE" });
    await loadSectors();
  }

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink">القطاعات</h1>
        <p className="text-base leading-7 text-ink-soft">
          القطاعات دي بتظهر للموظف وقت ما بيحدد الخصم هيتطبق فين.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">اسم القطاع الجديد</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: الإلكترونيات"
            className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal-deep"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-teal-deep px-6 py-3 text-base font-medium text-paper transition-colors hover:bg-teal-mid disabled:opacity-60"
        >
          إضافة
        </button>
      </form>

      {error && <p className="text-sm text-[#9b3b3b]">{error}</p>}

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-ink-soft">بيتحمّل...</p>
        ) : sectors.length === 0 ? (
          <p className="text-sm text-ink-soft">لسه مفيش قطاعات مضافة.</p>
        ) : (
          sectors.map((sector) => (
            <div
              key={sector.id}
              className="flex items-center justify-between rounded-xl border border-paper-line bg-white px-4 py-3"
            >
              <span className="text-base text-ink">{sector.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(sector.id)}
                className="text-sm text-[#9b3b3b] transition-colors hover:underline"
              >
                حذف
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
