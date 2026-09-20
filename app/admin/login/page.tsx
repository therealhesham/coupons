"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "حصل خطأ، حاول تاني.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-paper-line bg-white p-8"
      >
        <h1 className="font-display text-3xl text-ink">تسجيل دخول الإدارة</h1>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">اسم المستخدم</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal-deep"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">كلمة المرور</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="rounded-xl border border-paper-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-teal-deep"
          />
        </label>

        {error && <p className="text-sm text-[#9b3b3b]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-teal-deep px-6 py-3.5 text-base font-medium text-paper transition-colors hover:bg-teal-mid disabled:opacity-60"
        >
          {submitting ? "بيدخل..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
