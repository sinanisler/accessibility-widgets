import { Card } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";
import { ScanForm } from "./scan-form";

type Scan = {
  id: string;
  url: string;
  score: number;
  createdAt: string;
  site: { name: string; id: string };
  json: string;
};

export default async function ScansPage() {
  let scans: Scan[] = [];
  let sites: Array<{ id: string; name: string }> = [];
  try {
    scans = await serverApiGet<Scan[]>("/v1/scans");
    sites = await serverApiGet("/v1/sites");
  } catch {
    /* offline */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ماسح إمكانية الوصول</h1>
        <p className="text-slate-600">افحص الصفحات وفق axe-core وقواعد عربية مخصصة.</p>
      </div>
      <ScanForm sites={sites} />
      <div className="grid gap-4">
        {scans.map((s) => {
          const report = JSON.parse(s.json) as { summary?: Record<string, number> };
          return (
            <Card key={s.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.site.name}</div>
                  <div className="text-sm text-slate-500">{s.url}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {new Date(s.createdAt).toLocaleString("ar")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand">{s.score}</div>
                  <div className="text-xs text-slate-500">الدرجة</div>
                </div>
              </div>
              {report.summary && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {Object.entries(report.summary).map(([k, v]) => (
                    <span key={k} className="rounded-full bg-slate-100 px-2 py-1">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
