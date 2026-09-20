"use client";

import { useEffect, useState, FormEvent } from "react";

interface Sector {
  id: number;
  name: string;
}

interface Coupon {
  id: number;
  code: string;
  title: string;
  discountPercent: number;
  appliesToAllSectors: boolean;
  sectors: string[];
}

export default function AdminCouponsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [appliesToAllSectors, setAppliesToAllSectors] = useState(true);
  const [selectedSectorIds, setSelectedSectorIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [sectorsRes, couponsRes] = await Promise.all([
        fetch("/api/admin/sectors"),
        fetch("/api/admin/coupons"),
      ]);
      if (!sectorsRes.ok || !couponsRes.ok) throw new Error();
      const sectorsData = await sectorsRes.json();
      const couponsData = await couponsRes.json();
      setSectors(sectorsData.sectors ?? []);
      setCoupons(couponsData.coupons ?? []);
    } catch {
      setError("تعذر تحميل البيانات، حاول تاني.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  function toggleSector(id: number) {
    setSelectedSectorIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function resetForm() {
    setTitle("");
    setCode("");
    setDiscountPercent("");
    setAppliesToAllSectors(true);
    setSelectedSectorIds([]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !code.trim()) {
      setError("العنوان والكود مطلوبين.");
      return;
    }
    if (!appliesToAllSectors && selectedSectorIds.length === 0) {
      setError("اختار قطاع واحد على الأقل، أو حدد كل القطاعات.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim(),
          discountPercent: Number(discountPercent),
          appliesToAllSectors,
          sectorIds: selectedSectorIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "حصل خطأ، حاول تاني.");
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink">الكوبونات</h1>
        <p className="text-base leading-7 text-ink-soft">
          حدّد الخصم هيتطبق على كل القطاعات، أو على قطاع معين، أو على أكتر من قطاع مع بعض.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-paper-line bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">اسم الكوبون</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: خصم نهاية الأسبوع"
              className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal-deep"
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">الكود</span>
            <input
              type="text"
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SAVE20"
              className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal-deep"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 sm:w-48">
          <span className="text-sm font-medium text-ink-soft">نسبة الخصم (%)</span>
          <input
            type="number"
            min={1}
            max={100}
            dir="ltr"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="20"
            className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal-deep"
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-ink-soft">نطاق الخصم</span>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={appliesToAllSectors}
              onChange={(e) => setAppliesToAllSectors(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-base text-ink">كل القطاعات</span>
          </label>

          {!appliesToAllSectors && (
            <div className="flex flex-col gap-2 rounded-xl border border-paper-line p-4">
              {sectors.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  لسه مفيش قطاعات، أضف قطاعات الأول من صفحة القطاعات.
                </p>
              ) : (
                sectors.map((sector) => (
                  <label key={sector.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSectorIds.includes(sector.id)}
                      onChange={() => toggleSector(sector.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-base text-ink">{sector.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-[#9b3b3b]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-teal-deep px-6 py-3.5 text-base font-medium text-paper transition-colors hover:bg-teal-mid disabled:opacity-60"
        >
          {submitting ? "بيتحفظ..." : "إنشاء الكوبون"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-ink">الكوبونات الحالية</h2>
        {loading ? (
          <p className="text-sm text-ink-soft">بيتحمّل...</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-ink-soft">لسه مفيش كوبونات.</p>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between rounded-xl border border-paper-line bg-white px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-ink">
                  {coupon.title} — {coupon.discountPercent}%
                </span>
                <span dir="ltr" className="text-sm text-ink-soft">
                  {coupon.code}
                </span>
                <span className="text-sm text-ink-soft">
                  {coupon.appliesToAllSectors
                    ? "كل القطاعات"
                    : coupon.sectors.join("، ") || "بدون قطاعات"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(coupon.id)}
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
