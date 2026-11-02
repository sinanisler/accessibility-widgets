"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput } from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

export function SiteActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    apiGet<{ user: { role: string } }>("/v1/auth/me")
      .then((res) => setCanWrite(res.user.role !== "viewer"))
      .catch(() => setCanWrite(false));
  }, []);

  async function createSite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const site = await apiSend<{ id: string }>("/v1/sites", "POST", { name, domain });
      setMsg("تم إنشاء الموقع");
      setOpen(false);
      setName("");
      setDomain("");
      router.push(`/sites/${site.id}`);
      router.refresh();
    } catch (err) {
      setMsg(errorMessage(err, "فشل إنشاء الموقع"));
    } finally {
      setBusy(false);
    }
  }

  if (!canWrite) return null;

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)}>إضافة موقع</Button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    );
  }

  return (
    <form onSubmit={createSite} className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <TextInput label="اسم الموقع" value={name} onChange={(e) => setName(e.target.value)} required />
      <TextInput
        label="النطاق"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="example.com"
        required
      />
      <Button type="submit" disabled={busy}>
        حفظ
      </Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
        إلغاء
      </Button>
      {msg && (
        <span role="alert" className="text-xs text-red-700">
          {msg}
        </span>
      )}
    </form>
  );
}
