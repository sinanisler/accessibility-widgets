"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput } from "@/components/ui";
import { apiSend } from "@/lib/api";

export function SiteActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

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
      setMsg(err instanceof Error ? err.message : "فشل الإنشاء");
    } finally {
      setBusy(false);
    }
  }

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
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </form>
  );
}
