"use client";

import { useEffect, useState, FormEvent } from "react";

interface Sector {
  id: number;
  name: string;
}

function CouponMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 12a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4v2a4 4 0 0 0 0 8v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2a4 4 0 0 0 0-8v-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M24 10v20" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 4" />
    </svg>
  );
}

function CheckMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15 24.5 21 30l12-13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PHONE_PATTERN = /^05[0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [allSectors, setAllSectors] = useState(true);
  const [selectedSectorIds, setSelectedSectorIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [registeredName, setRegisteredName] = useState("");

  useEffect(() => {
    fetch("/api/sectors")
      .then((res) => res.json())
      .then((data) => setSectors(data.sectors ?? []))
      .catch(() => {});
  }, []);

  function toggleSector(id: number) {
    setSelectedSectorIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("محتاجين اسم الزائر.");
      return;
    }
    if (!PHONE_PATTERN.test(phone.trim())) {
      setError("رقم الجوال غير صحيح، تأكد إنه ١٠ أرقام ويبدأ بـ 05.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("البريد الإلكتروني غير صحيح.");
      return;
    }
    if (!allSectors && selectedSectorIds.length === 0) {
      setError("اختار قطاع واحد على الأقل، أو حدد كل القطاعات.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: phone.trim(),
          email: email.trim(),
          allSectors,
          sectorIds: selectedSectorIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "حصل خطأ، حاول تاني.");
      }
      setRegisteredName(trimmedName);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
      setStatus("idle");
    }
  }

  function handleReset() {
    setName("");
    setPhone("");
    setEmail("");
    setAllSectors(true);
    setSelectedSectorIds([]);
    setError(null);
    setStatus("idle");
    setRegisteredName("");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <section className="relative flex flex-col justify-between gap-6 overflow-hidden bg-teal-deep px-8 py-8 text-paper md:w-[46%] md:gap-10 md:px-14 md:py-16">
        <div
          className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        />

        <div className="relative flex items-center gap-3">
          <CouponMark className="h-8 w-12 text-gold-soft" />
          <span className="font-display text-2xl tracking-wide">المعرض</span>
        </div>

        <div className="relative flex flex-col gap-5">
          <h1 className="font-display text-3xl leading-[1.15] md:text-5xl">
            خصومات المعرض في انتظارك
          </h1>
          <p className="max-w-sm text-lg leading-8 text-paper/80">
            اترك اسمك ورقم جوالك عند الموظف، وهيوصلك كل عرض وخصم جديد أول بأول.
          </p>
        </div>

        <div className="relative flex items-center gap-3 border-t border-paper/15 pt-6 text-sm text-paper/60">
          <span>بياناتك بتتحفظ عندنا وتُستخدم للتواصل بخصوص العروض بس.</span>
        </div>
      </section>

      <section className="flex flex-1 items-start justify-center bg-paper px-6 py-10 md:items-center md:px-16 md:py-14">
        <div className="w-full max-w-sm">
          {status === "done" ? (
            <div className="flex flex-col items-start gap-5">
              <CheckMark className="h-12 w-12 text-teal-deep" />
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-3xl text-ink">
                  تم تسجيل {registeredName}
                </h2>
                <p className="text-base leading-7 text-ink-soft">
                  هيتقدملك أحسن العروض والخصومات في المعرض.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-full border border-ink/15 px-6 py-3 text-base font-medium text-ink transition-colors hover:border-teal-deep hover:text-teal-deep"
              >
                تسجيل زائر تاني
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-7" noValidate>
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-3xl text-ink">تسجيل بيانات زائر جديد</h2>
                <p className="text-base leading-7 text-ink-soft">
                  خد ثانيتين، واملأ البيانات التالية:
                </p>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink-soft">الاسم</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الثلاثي"
                  autoComplete="name"
                  className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-teal-deep"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink-soft">رقم الجوال</span>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="rounded-xl border border-paper-line bg-white px-4 py-3 text-right text-base text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-teal-deep"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink-soft">البريد الإلكتروني</span>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  className="rounded-xl border border-paper-line bg-white px-4 py-3 text-right text-base text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-teal-deep"
                />
              </label>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-ink-soft">القطاعات اللي تهمك</span>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSectors}
                    onChange={(e) => setAllSectors(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-base text-ink">كل القطاعات</span>
                </label>

                {!allSectors && (
                  <div className="flex flex-col gap-2 rounded-xl border border-paper-line p-4">
                    {sectors.length === 0 ? (
                      <p className="text-sm text-ink-soft">لسه مفيش قطاعات متاحة.</p>
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
                disabled={status === "submitting"}
                className="mt-2 rounded-full bg-teal-deep px-6 py-3.5 text-base font-medium text-paper transition-colors hover:bg-teal-mid disabled:opacity-60"
              >
                {status === "submitting" ? "بيتسجل..." : "تسجيل"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
