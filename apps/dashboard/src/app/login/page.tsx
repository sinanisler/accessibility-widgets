"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiSend, setStoredToken } from "@/lib/api";
import { Button, Card } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
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
      const next = search.get("next") || "/";
      router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "Rate limit exceeded"
          ? "محاولات كثيرة، حاول بعد دقيقة"
          : msg === "Invalid credentials"
            ? "بيانات الدخول غير صحيحة"
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
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
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
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "جارٍ الدخول…" : "دخول"}
        </Button>
      </form>
      <p className="mt-4 text-xs text-slate-400">تجريبي: admin@example.com / admin123</p>
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
