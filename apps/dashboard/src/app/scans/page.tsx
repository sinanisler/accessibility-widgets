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

type Issue = {
  id: string;
  impact: string;
  message: string;
  selector?: string;
  helpUrl?: string;
};

const SEVERITY: Record<string, string> = {
  critical: "حرجة",
  serious: "خطيرة",
  moderate: "متوسطة",
  minor: "طفيفة",
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
          const report = JSON.parse(s.json) as {
            summary?: Record<string, number>;
            issues?: Issue[];
          };
          return (
            <Card key={s.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.site.name}</div>
                  <div className="text-sm text-slate-500">{s.url}</div>
                  <div className="mt-1 text-xs text-slate-500">
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
                      {SEVERITY[k] ?? k}: {v}
                    </span>
                  ))}
                </div>
              )}
              {!!report.issues?.length && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-brand">
                    عرض المشكلات ({report.issues.length})
                  </summary>
                  <ul className="mt-2 divide-y divide-slate-100">
                    {report.issues.map((issue) => (
                      <li key={issue.id} className="space-y-1 py-2">
                        <div className="font-medium">
                          {SEVERITY[issue.impact] ?? issue.impact}: {issue.message}
                        </div>
                        {issue.selector && (
                          <code dir="ltr" className="block break-all text-xs text-slate-600">
                            {issue.selector}
                          </code>
                        )}
                        {issue.helpUrl && (
                          <a href={issue.helpUrl} className="text-xs text-brand underline">
                            طريقة الإصلاح
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
