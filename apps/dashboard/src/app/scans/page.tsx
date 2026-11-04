import { clsx } from "clsx";
import { ExternalLink, ScanSearch } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";
import { scoreTone } from "@/lib/sites";
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

const SEVERITY: { id: string; label: string; tone: "danger" | "warning" | "neutral" }[] = [
  { id: "critical", label: "حرجة", tone: "danger" },
  { id: "serious", label: "خطيرة", tone: "danger" },
  { id: "moderate", label: "متوسطة", tone: "warning" },
  { id: "minor", label: "طفيفة", tone: "neutral" },
];

const RING = { success: "#059669", warning: "#F2A900", danger: "#DC2626" } as const;

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(score);
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center" role="img" aria-label={`الدرجة ${score} من 100`}>
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" className="stroke-ink-100" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={RING[tone]}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(100, score)) / 100)}
        />
      </svg>
      <span className="text-lg font-bold tabular-nums text-ink-900" aria-hidden="true">
        {score}
      </span>
    </div>
  );
}

export default async function ScansPage() {
  let scans: Scan[] = [];
  let sites: Array<{ id: string; name: string }> = [];
  try {
    [scans, sites] = await Promise.all([
      serverApiGet<Scan[]>("/v1/scans"),
      serverApiGet<Array<{ id: string; name: string }>>("/v1/sites"),
    ]);
  } catch {
    /* offline */
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ماسح إمكانية الوصول"
        description="يفحص الصفحة وفق axe-core وقواعد خاصة بالمحتوى العربي. النتيجة الآلية لا تغني عن مراجعة يدوية."
      />
      <ScanForm sites={sites} />

      {scans.length === 0 && (
        <EmptyState icon={ScanSearch} title="لا توجد فحوص بعد">
          اختر موقعاً وأدخل رابط صفحة منه لبدء أول فحص.
        </EmptyState>
      )}

      <div className="grid gap-4">
        {scans.map((s) => {
          let report: { summary?: Record<string, number>; issues?: Issue[] } = {};
          try {
            report = JSON.parse(s.json);
          } catch {
            /* show the score only */
          }
          const issues = report.issues ?? [];
          return (
            <Card key={s.id} className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <ScoreRing score={s.score} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.site.name}</div>
                  <div className="truncate text-sm text-ink-500" dir="ltr">
                    {s.url}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">
                    {new Date(s.createdAt).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                {report.summary && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="ملخص المشكلات حسب الخطورة">
                    {SEVERITY.filter((sev) => (report.summary?.[sev.id] ?? 0) > 0).map((sev) => (
                      <li key={sev.id}>
                        <Badge tone={sev.tone}>
                          {sev.label}: {report.summary![sev.id]}
                        </Badge>
                      </li>
                    ))}
                    {SEVERITY.every((sev) => !(report.summary?.[sev.id] ?? 0)) && (
                      <li>
                        <Badge tone="success">لا مشكلات آلية</Badge>
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {issues.length > 0 && (
                <details className="group rounded-xl border border-ink-200">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                    عرض المشكلات ({issues.length})
                  </summary>
                  <div className="space-y-4 border-t border-ink-200 p-4">
                    {SEVERITY.map((sev) => {
                      const group = issues.filter((i) => i.impact === sev.id);
                      if (!group.length) return null;
                      return (
                        <section key={sev.id} aria-label={`مشكلات ${sev.label}`} className="space-y-2">
                          <Badge tone={sev.tone}>
                            {sev.label} · {group.length}
                          </Badge>
                          <ul className="divide-y divide-ink-100">
                            {group.map((issue) => (
                              <li key={issue.id} className={clsx("space-y-1 py-2 text-sm")}>
                                <div className="font-medium text-ink-900">{issue.message}</div>
                                {issue.selector && (
                                  <code dir="ltr" className="block break-all rounded bg-ink-50 px-2 py-1 text-xs text-ink-600">
                                    {issue.selector}
                                  </code>
                                )}
                                {issue.helpUrl && (
                                  <a
                                    href={issue.helpUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                                  >
                                    طريقة الإصلاح
                                    <ExternalLink aria-hidden="true" className="h-3 w-3" />
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </section>
                      );
                    })}
                  </div>
                </details>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
