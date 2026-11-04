"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { Button, Card, SelectInput, TextInput } from "@/components/ui";
import { useToast } from "@/components/toast";
import { apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

export function ScanForm({ sites }: { sites: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const [siteId, setSiteId] = useState(sites[0]?.id || "");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const report = await apiSend<{ score: number }>("/v1/scans", "POST", { siteId, url });
      toast(`اكتمل الفحص، والدرجة ${report.score} من 100`);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err, "تعذر إكمال الفحص. أعد المحاولة بعد قليل."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={run} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] md:items-end">
        <SelectInput label="الموقع" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </SelectInput>
        <TextInput
          label="رابط الصفحة"
          dir="ltr"
          type="url"
          placeholder="https://example.com/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" icon={ScanSearch} disabled={busy || !siteId || !url}>
          {busy ? "جارٍ الفحص…" : "بدء الفحص"}
        </Button>
      </form>
      {busy && (
        <p role="status" className="mt-3 text-sm text-ink-500">
          يفتح الماسح الصفحة في متصفح ويفحصها، وقد يستغرق ذلك دقيقة.
        </p>
      )}
    </Card>
  );
}
