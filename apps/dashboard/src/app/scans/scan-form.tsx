"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

export function ScanForm({ sites }: { sites: Array<{ id: string; name: string }> }) {
  const [siteId, setSiteId] = useState(sites[0]?.id || "");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setBusy(true);
    setMsg("جاري الفحص… قد يستغرق دقيقة");
    try {
      const report = await apiSend<{ score: number }>("/v1/scans", "POST", { siteId, url });
      setMsg(`اكتمل الفحص — الدرجة ${report.score}`);
      window.location.reload();
    } catch (err) {
      setMsg(errorMessage(err, "تعذر إكمال الفحص. أعد المحاولة بعد قليل."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          الموقع
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          الرابط
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            dir="ltr"
            type="url"
            placeholder="https://example.com/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      </div>
      <Button disabled={busy || !siteId || !url} onClick={run}>
        بدء الفحص
      </Button>
      <p role="status" className="text-sm text-slate-600">
        {msg}
      </p>
    </Card>
  );
}
