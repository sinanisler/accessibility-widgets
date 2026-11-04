"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Contrast, MousePointer2, PersonStanding, Type } from "lucide-react";
import { apiSend, setStoredToken } from "@/lib/api";
import { Button, TextInput } from "@/components/ui";

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
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-ink-900">تسجيل الدخول</h1>
      <p className="mt-1 text-sm text-ink-500">لوحة تحكم مبصر لإمكانية الوصول</p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <TextInput
          label="البريد الإلكتروني"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <TextInput
          label="كلمة المرور"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "جارٍ الدخول…" : "دخول"}
        </Button>
      </form>
    </div>
  );
}

const FEATURES = [
  { icon: Type, label: "حجم النص" },
  { icon: Contrast, label: "تباين عالٍ" },
  { icon: MousePointer2, label: "مؤشر أكبر" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">
        <Suspense fallback={<p className="text-sm text-ink-500">جارٍ التحميل…</p>}>
          <LoginForm />
        </Suspense>
      </div>
      <div aria-hidden="true" className="relative hidden overflow-hidden bg-[#16245E] lg:flex lg:items-center lg:justify-center">
        <div className="absolute -start-24 -top-24 h-96 w-96 rounded-full bg-[#2347C5] opacity-40 blur-3xl" />
        <div className="relative w-80 space-y-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#2347C5]">
              <PersonStanding className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold">مبصر</span>
          </div>
          <p className="text-lg leading-relaxed text-white/85">
            أداة وصول عربية تتحكم بشكلها وخصائصها من مكان واحد، وتنشر التغييرات على موقعك فوراً.
          </p>
          <div className="rounded-2xl bg-surface p-4 text-ink-900 shadow-pop">
            <div className="mb-3 text-sm font-bold">إمكانية الوصول</div>
            <div className="grid grid-cols-3 gap-2">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className={
                    i === 0
                      ? "rounded-xl bg-brand p-3 text-xs font-semibold text-brand-fg"
                      : "rounded-xl bg-ink-100 p-3 text-xs font-semibold"
                  }
                >
                  <Icon className="mb-3 h-5 w-5" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
