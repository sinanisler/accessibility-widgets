import Link from "next/link";
import { ChevronLeft, Globe } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";
import { numberFormat, siteStatus, type SiteSummary } from "@/lib/sites";
import { SiteActions } from "./site-actions";

const POSITIONS: Record<string, string> = {
  "bottom-right": "أسفل اليمين",
  "bottom-left": "أسفل اليسار",
  "top-right": "أعلى اليمين",
  "top-left": "أعلى اليسار",
};

export default async function SitesPage() {
  let sites: SiteSummary[] = [];
  let failed = false;
  try {
    sites = await serverApiGet<SiteSummary[]>("/v1/sites");
  } catch {
    failed = true;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواقع"
        description="النطاقات ومفاتيح التضمين وإعدادات الأداة لكل موقع."
        actions={<SiteActions />}
      />

      {failed && (
        <p role="alert" className="rounded-xl border border-warning-line bg-warning-soft px-4 py-3 text-sm text-warning">
          تعذر تحميل المواقع الآن. أعد تحميل الصفحة بعد قليل.
        </p>
      )}

      {sites.length === 0 && !failed && (
        <EmptyState icon={Globe} title="لا توجد مواقع بعد">
          أضف موقعك الأول من زر «إضافة موقع» لتحصل على كود التثبيت.
        </EmptyState>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {sites.map((site) => {
          const status = siteStatus(site);
          let cfg: { language?: string; position?: string; colors?: { primary?: string } } = {};
          try {
            cfg = JSON.parse(site.config?.json || "{}");
          } catch {
            /* show defaults */
          }
          return (
            <li key={site.id}>
              <Link
                href={`/sites/${site.id}`}
                className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Card className="h-full transition group-hover:border-brand/40 group-hover:shadow-pop">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 h-10 w-10 shrink-0 rounded-xl"
                      style={{ background: cfg.colors?.primary || "#2347C5" }}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-base font-semibold text-ink-900">{site.name}</h2>
                        {status.paused ? (
                          <Badge tone="danger">متوقفة</Badge>
                        ) : status.installed ? (
                          <Badge tone="success">تعمل</Badge>
                        ) : (
                          <Badge tone="warning">بانتظار التثبيت</Badge>
                        )}
                        {status.unpublished && <Badge tone="brand">مسودة غير منشورة</Badge>}
                      </div>
                      <p className="text-sm text-ink-500" dir="ltr">
                        {site.domain}
                      </p>
                      <p className="text-xs text-ink-500">
                        {cfg.language === "en" ? "الإنجليزية" : "العربية"} · {POSITIONS[cfg.position ?? "bottom-right"]} ·{" "}
                        {numberFormat.format(site._count?.events ?? 0)} حدث
                      </p>
                    </div>
                    <ChevronLeft aria-hidden="true" className="mt-2 h-5 w-5 shrink-0 text-ink-300 transition group-hover:text-brand" />
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
