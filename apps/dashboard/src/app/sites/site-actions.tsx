"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, TextInput } from "@/components/ui";
import { useToast } from "@/components/toast";
import { apiGet, apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

export function SiteActions() {
  const router = useRouter();
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    apiGet<{ user: { role: string } }>("/v1/auth/me")
      .then((res) => setCanWrite(res.user.role !== "viewer"))
      .catch(() => setCanWrite(false));
  }, []);

  function close() {
    dialog.current?.close();
    setError("");
  }

  async function createSite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const site = await apiSend<{ id: string }>("/v1/sites", "POST", { name, domain });
      close();
      setName("");
      setDomain("");
      toast("تمت إضافة الموقع");
      router.push(`/sites/${site.id}`);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "تعذّرت إضافة الموقع. تحقق من النطاق وأعد المحاولة."));
    } finally {
      setBusy(false);
    }
  }

  if (!canWrite) return null;

  return (
    <>
      <Button icon={Plus} onClick={() => dialog.current?.showModal()}>
        إضافة موقع
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="add-site-title"
        onClose={() => setError("")}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-surface p-0 text-ink-900 shadow-pop"
      >
        <form onSubmit={createSite}>
          <div className="space-y-4 p-6">
            <div>
              <h2 id="add-site-title" className="text-lg font-bold">
                إضافة موقع
              </h2>
              <p className="text-sm text-ink-500">تعمل الأداة فقط على هذا النطاق وما يتبعه.</p>
            </div>
            <TextInput label="اسم الموقع" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            <TextInput
              label="النطاق"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              dir="ltr"
              required
            />
            {error && (
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-ink-200 bg-ink-50 px-6 py-4">
            <Button type="button" variant="secondary" onClick={close}>
              إلغاء
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "جارٍ الإضافة…" : "إضافة"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
