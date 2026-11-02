"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiSend, setStoredToken } from "@/lib/api";
import { Button, Card } from "@/components/ui";

/** Browsers treat `/\\host` like `//host`, so only a same-origin parse is trusted. */
function safeNext(next: string | null): string {
  if (!next) return "/";
  try {
    const url = new URL(next, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}` : "/";
  } catch {
    return "/";
  }
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await apiSend<{ token: string; user: { name: string | null } }>(
        "/v1/auth/login",
        "POST",
        { email, password },
      );
      setStoredToken(res.token);
      router.replace(safeNext(search.get("next")));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "Rate limit exceeded"
          ? "محاولات كثيرة، حاول بعد دقيقة"
          : msg === "Invalid credentials"
            ? "بيانات الدخول غير صحيحة"
            : msg === "Invalid request"
              ? "تحقق من صيغة البريد الإلكتروني"
              : "تعذّر الاتصال بالخادم، حاول مرة أخرى",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-bold text-slate-900">تسجيل الدخول</h1>
      <p className="mt-1 text-sm text-slate-500">لوحة تحكم منير لإمكانية الوصول</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">البريد</span>
          <input
            className="w-full rounded-xl border border-slate-400 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">كلمة المرور</span>
          <input
            className="w-full rounded-xl border border-slate-400 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "جارٍ الدخول…" : "دخول"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<Card className="w-full max-w-md">جارٍ التحميل…</Card>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
