"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { PropsWithChildren } from "react";
import { apiSend, setStoredToken } from "@/lib/api";
import { Button } from "@/components/ui";

const links = [
  { href: "/", label: "نظرة عامة" },
  { href: "/sites", label: "المواقع" },
  { href: "/licenses", label: "الرخص" },
  { href: "/scans", label: "الماسح" },
  { href: "/users", label: "المستخدمون" },
  { href: "/support", label: "الدعم" },
];

export function Shell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  async function logout() {
    try {
      await apiSend("/v1/auth/logout", "POST");
    } catch {
      /* ignore */
    }
    setStoredToken(null);
    router.replace("/login");
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-l border-slate-200 bg-white p-4">
        <div className="mb-8">
          <div className="text-xl font-bold text-brand">منصة الوصول</div>
          <div className="text-xs text-slate-500">لوحة تحكم مركزية</div>
        </div>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "block rounded-xl px-3 py-2 text-sm font-medium",
                pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
                  ? "bg-brand text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <Button variant="ghost" className="w-full" onClick={() => void logout()}>
            تسجيل الخروج
          </Button>
        </div>
      </aside>
      <main className="p-6 md:p-8">{children}</main>
    </div>
  );
}
