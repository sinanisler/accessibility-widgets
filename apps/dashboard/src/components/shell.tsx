"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState, type PropsWithChildren } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="min-h-screen md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        تخطي إلى المحتوى
      </a>
      <aside className="border-b border-slate-200 bg-white p-4 md:border-b-0 md:border-l">
        <div className="flex items-center justify-between md:mb-8 md:block">
          <div>
            <div className="text-xl font-bold text-brand">منير</div>
            <div className="text-xs text-slate-500">لوحة تحكم إمكانية الوصول</div>
          </div>
          <Button
            variant="ghost"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            القائمة
          </Button>
        </div>
        <div id="main-nav" className={clsx("mt-4 md:mt-0 md:block", !menuOpen && "hidden")}>
          <nav aria-label="القائمة الرئيسية" className="space-y-1">
            {links.map((l) => {
              const current =
                pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "block rounded-xl px-3 py-2 text-sm font-medium",
                    current ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8">
            <Button variant="ghost" className="w-full" onClick={() => void logout()}>
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>
      <main id="main" tabIndex={-1} className="min-w-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
