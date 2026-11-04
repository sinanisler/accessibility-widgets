"use client";

import { FormEvent, useState } from "react";
import { Button, Card, PageHeader, TextInput } from "@/components/ui";
import { useToast } from "@/components/toast";
import { apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

const MIN_LENGTH = 10;

export default function AccountPage() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== next;
  const tooShort = next.length > 0 && next.length < MIN_LENGTH;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mismatch || tooShort) return;
    setBusy(true);
    setError("");
    try {
      await apiSend("/v1/auth/password", "POST", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("تغيّرت كلمة المرور، وخرجت جلساتك على الأجهزة الأخرى");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "Invalid credentials"
          ? "كلمة المرور الحالية غير صحيحة."
          : msg === "Rate limit exceeded"
            ? "محاولات كثيرة. حاول بعد ربع ساعة."
            : errorMessage(err, "تعذّر تغيير كلمة المرور."),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="حسابي" description="كلمة المرور وجلسات الدخول." />
      <Card className="max-w-lg">
        <h2 className="text-base font-semibold">تغيير كلمة المرور</h2>
        <p className="mt-1 text-sm text-ink-500">
          تخرج كل جلساتك على الأجهزة الأخرى بعد التغيير، وتبقى داخلاً على هذا الجهاز.
        </p>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <TextInput
            label="كلمة المرور الحالية"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <TextInput
            label={`كلمة المرور الجديدة (${MIN_LENGTH} أحرف على الأقل)`}
            type="password"
            dir="ltr"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            value={next}
            error={tooShort ? `أقصر من ${MIN_LENGTH} أحرف.` : undefined}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          <TextInput
            label="تأكيد كلمة المرور الجديدة"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            value={confirm}
            error={mismatch ? "لا تطابق كلمة المرور الجديدة." : undefined}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && (
            <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || mismatch || tooShort}>
            {busy ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
