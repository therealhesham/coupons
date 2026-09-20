"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-paper-line px-6 py-4 md:px-12">
        <nav className="flex items-center gap-6">
          <span className="font-display text-xl text-ink">إدارة المعرض</span>
          <Link
            href="/admin"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-teal-deep"
          >
            القطاعات
          </Link>
          <Link
            href="/admin/coupons"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-teal-deep"
          >
            الكوبونات
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="px-6 py-10 md:px-12">{children}</main>
    </div>
  );
}
