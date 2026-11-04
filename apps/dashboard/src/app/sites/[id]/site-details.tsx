"use client";

import { FormEvent, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button, TextInput } from "@/components/ui";
import { useToast } from "@/components/toast";
import { apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

type SiteFields = { id: string; name: string; domain: string };

export function SiteDetailsButton({
  site,
  onSaved,
}: {
  site: SiteFields;
  onSaved: (site: SiteFields) => void;
}) {
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(site.name);
  const [domain, setDomain] = useState(site.domain);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function open() {
    setName(site.name);
    setDomain(site.domain);
    setError("");
    dialog.current?.showModal();
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const updated = await apiSend<SiteFields>(`/v1/sites/${site.id}`, "PATCH", { name, domain });
      onSaved(updated);
      dialog.current?.close();
      toast("حُفظت بيانات الموقع");
    } catch (err) {
      setError(
        err instanceof Error && err.message === "Invalid domain"
          ? "النطاق غير صالح. اكتبه مثل example.com دون مسار."
          : errorMessage(err, "تعذّر حفظ بيانات الموقع."),
      );
    } finally {
      setBusy(false);
    }
  }

  const domainChanged = domain.trim().toLowerCase() !== site.domain;

  return (
    <>
      <Button variant="secondary" size="sm" icon={Pencil} onClick={open}>
        تعديل الموقع
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="site-details-title"
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-surface p-0 text-ink-900 shadow-pop"
      >
        <form onSubmit={save}>
          <div className="space-y-4 p-6">
            <h2 id="site-details-title" className="text-lg font-bold">
              بيانات الموقع
            </h2>
            <TextInput label="اسم الموقع" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextInput
              label="النطاق"
              dir="ltr"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
            {domainChanged && (
              <p className="rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
                بعد الحفظ تعمل الأداة على النطاق الجديد ونطاقاته الفرعية فقط، وتتوقف على{" "}
                <span dir="ltr">{site.domain}</span> إن لم يكن ضمن الرخصة.
              </p>
            )}
            {error && (
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-ink-200 bg-ink-50 px-6 py-4">
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
              إلغاء
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "جارٍ الحفظ…" : "حفظ"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
