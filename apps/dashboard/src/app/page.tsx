import Link from "next/link";
import { clsx } from "clsx";
import { Activity, Check, Globe, Plus, ScanSearch } from "lucide-react";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, Stat } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";
import {
  numberFormat,
  scoreTone,
  siteStatus,
  type ScanSummary,
  type SiteSummary,
} from "@/lib/sites";

export default async function HomePage() {
  let sites: SiteSummary[] = [];
  let scans: ScanSummary[] = [];
  let error: string | null = null;
  try {
    [sites, scans] = await Promise.all([
      serverApiGet<SiteSummary[]>("/v1/sites"),
      serverApiGet<ScanSummary[]>("/v1/scans"),
    ]);
  } catch {
    error = "تعذر تحميل البيانات الآن. أعد تحميل الصفحة بعد قليل.";
  }

  const totalEvents = sites.reduce((s, x) => s + (x._count?.events || 0), 0);
  const installedCount = sites.filter((s) => siteStatus(s).installed).length;
  const latestScan = new Map<string, ScanSummary>();
  for (const scan of scans) if (!latestScan.has(scan.site.id)) latestScan.set(scan.site.id, scan);

  const firstSite = sites[0];
  const steps = [
    {
      done: sites.length > 0,
      title: "أضف موقعك",
      body: "اسم الموقع ونطاقه، ونعطيك مفتاحاً خاصاً به.",
      href: "/sites",
      cta: "إضافة موقع",
    },
    {
      done: installedCount > 0,
      title: "ثبّت الأداة",
      body: "الصق سطر الكود قبل إغلاق body. تكتمل الخطوة عند أول زيارة للموقع بعد التثبيت.",
      href: firstSite ? `/sites/${firstSite.id}?tab=install` : "/sites",
      cta: "عرض كود التثبيت",
    },
    {
      done: scans.length > 0,
      title: "افحص أول صفحة",
      body: "يكشف الماسح مشكلات الوصول في صفحاتك، ومنها قواعد خاصة بالمحتوى العربي.",
      href: "/scans",
      cta: "فتح الماسح",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="نظرة عامة"
        description="حالة مواقعك واستخدام الأداة ونتائج الفحص."
        actions={
          <ButtonLink href="/sites" icon={Plus}>
            إضافة موقع
          </ButtonLink>
        }
      />

      {error && (
        <p role="alert" className="rounded-xl border border-warning-line bg-warning-soft px-4 py-3 text-sm text-warning">
          {error}
        </p>
      )}

      {doneCount < steps.length && !error && (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200 px-5 py-4">
            <h2 className="font-semibold">ابدأ في ثلاث خطوات</h2>
            <span className="text-sm text-ink-500">
              {doneCount} من {steps.length} مكتملة
            </span>
          </div>
          <ol className="divide-y divide-ink-100">
            {steps.map((step, i) => (
              <li key={step.title} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span
                  className={clsx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                    step.done ? "bg-emerald-600 text-white" : "border-2 border-ink-300 text-ink-500",
                  )}
                >
                  {step.done ? <Check aria-label="مكتملة" className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-[12rem] flex-1">
                  <div className={clsx("font-medium", step.done && "text-ink-500 line-through")}>{step.title}</div>
                  {!step.done && <div className="text-sm text-ink-500">{step.body}</div>}
                </div>
                {!step.done && (
                  <ButtonLink href={step.href} variant="secondary" size="sm">
                    {step.cta}
                  </ButtonLink>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="المواقع"
          value={numberFormat.format(sites.length)}
          hint={`${numberFormat.format(installedCount)} مثبّت عليها الأداة`}
          icon={Globe}
        />
        <Stat label="أحداث الاستخدام" value={numberFormat.format(totalEvents)} hint="تحميل الأداة وتغيير الخصائص" icon={Activity} />
        <Stat label="تقارير الماسح" value={numberFormat.format(scans.length)} hint="آخر 50 فحصاً" icon={ScanSearch} />
      </div>

      <section aria-labelledby="sites-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="sites-heading" className="text-lg font-semibold">
            المواقع
          </h2>
          {sites.length > 0 && (
            <Link href="/sites" className="text-sm font-medium text-brand hover:underline">
              كل المواقع
            </Link>
          )}
        </div>
        {sites.length === 0 && !error ? (
          <EmptyState
            icon={Globe}
            title="لا توجد مواقع بعد"
            action={
              <ButtonLink href="/sites" icon={Plus}>
                إضافة موقعك الأول
              </ButtonLink>
            }
          >
            أضف موقعاً لتحصل على كود التثبيت وتتحكم بشكل الأداة وخصائصها.
          </EmptyState>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="border-b border-ink-200 text-start text-xs text-ink-500">
                <tr>
                  <th scope="col" className="px-5 py-3 text-start font-medium">الموقع</th>
                  <th scope="col" className="px-5 py-3 text-start font-medium">الحالة</th>
                  <th scope="col" className="px-5 py-3 text-start font-medium">آخر فحص</th>
                  <th scope="col" className="px-5 py-3 text-start font-medium">الأحداث</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {sites.slice(0, 6).map((site) => {
                  const status = siteStatus(site);
                  const scan = latestScan.get(site.id);
                  return (
                    <tr key={site.id} className="hover:bg-ink-50">
                      <td className="px-5 py-3">
                        <Link href={`/sites/${site.id}`} className="font-medium text-ink-900 hover:text-brand hover:underline">
                          {site.name}
                        </Link>
                        <div className="text-xs text-ink-500" dir="ltr">
                          {site.domain}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {status.paused ? (
                          <Badge tone="danger">متوقفة</Badge>
                        ) : status.installed ? (
                          <Badge tone="success">تعمل</Badge>
                        ) : (
                          <Badge tone="warning">بانتظار التثبيت</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {scan ? <Badge tone={scoreTone(scan.score)}>{scan.score} / 100</Badge> : <span className="text-ink-400">—</span>}
                      </td>
                      <td className="px-5 py-3 tabular-nums">{numberFormat.format(site._count?.events ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}
