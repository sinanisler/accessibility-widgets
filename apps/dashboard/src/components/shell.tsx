"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Globe,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  PersonStanding,
  ScanSearch,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type PropsWithChildren } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { ToastProvider } from "@/components/toast";
import { ThemeSwitch } from "@/components/theme-switch";

const links = [
  { href: "/", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/sites", label: "المواقع", icon: Globe },
  { href: "/scans", label: "الماسح", icon: ScanSearch },
  { href: "/licenses", label: "الرخص", icon: KeyRound },
  { href: "/users", label: "المستخدمون", icon: Users },
  { href: "/support", label: "الدعم", icon: LifeBuoy },
];

const ROLE_LABELS: Record<string, string> = { owner: "مالك", admin: "مدير", viewer: "مشاهد" };

type Me = { email: string; name: string | null; role: string };

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-fg">
        <PersonStanding aria-hidden="true" className="h-5 w-5" />
      </span>
      <div>
        <div className="text-lg font-bold leading-tight text-ink-900">مبصر</div>
        <div className="text-xs text-ink-500">لوحة تحكم إمكانية الوصول</div>
      </div>
    </div>
  );
}

export function Shell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const isLogin = pathname === "/login";

  useEffect(() => {
    if (isLogin) return;
    apiGet<{ user: Me }>("/v1/auth/me")
      .then((res) => setMe(res.user))
      .catch(() => setMe(null));
  }, [isLogin]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (isLogin) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  async function logout() {
    try {
      await apiSend("/v1/auth/logout", "POST");
    } catch {
      /* ignore */
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <ToastProvider>
      <div className="min-h-screen md:grid md:grid-cols-[264px_minmax(0,1fr)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
        >
          تخطي إلى المحتوى
        </a>

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-surface px-4 py-3 md:hidden">
          <BrandMark />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </header>

        <aside
          id="main-nav"
          className={clsx(
            "border-ink-200 bg-surface md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-e",
            menuOpen ? "block border-b" : "hidden",
          )}
        >
          <div className="hidden px-5 pb-6 pt-6 md:block">
            <BrandMark />
          </div>
          <nav aria-label="القائمة الرئيسية" className="space-y-1 px-3 py-3 md:flex-1 md:py-0">
            {links.map(({ href, label, icon: Icon }) => {
              const current = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand",
                    current ? "bg-brand-soft text-brand-ink" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                  )}
                >
                  <Icon aria-hidden="true" className={clsx("h-5 w-5", current ? "text-brand" : "text-ink-400")} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-ink-200 p-3">
            <div className="mb-3 px-1">
              <ThemeSwitch />
            </div>
            {me && (
              <Link
                href="/account"
                aria-current={pathname === "/account" ? "page" : undefined}
                className="mb-2 flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand aria-[current=page]:bg-brand-soft"
              >
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-100 text-sm font-bold text-ink-700"
                >
                  {(me.name || me.email).trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink-900">{me.name || me.email}</div>
                  <div className="text-xs text-ink-500">{ROLE_LABELS[me.role] ?? me.role} · حسابي</div>
                </div>
              </Link>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              <LogOut aria-hidden="true" className="h-5 w-5 text-ink-400" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        <main id="main" tabIndex={-1} className="min-w-0 px-4 py-6 focus:outline-none md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
