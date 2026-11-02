import Link from "next/link";
import { Card } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";
import { SiteActions } from "./site-actions";

type Site = {
  id: string;
  name: string;
  domain: string;
  siteKey: string;
  config?: { json: string; draftJson?: string } | null;
};

export default async function SitesPage() {
  let sites: Site[] = [];
  try {
    sites = await serverApiGet<Site[]>("/v1/sites");
  } catch {
    sites = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المواقع</h1>
          <p className="text-slate-600">إدارة النطاقات ومفاتيح التضمين وإعدادات الأداة.</p>
        </div>
        <SiteActions />
      </div>

      <div className="grid gap-4">
        {sites.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">لا توجد مواقع بعد، أو يلزم تسجيل الدخول.</p>
          </Card>
        )}
        {sites.map((site) => {
          const cfg = site.config ? JSON.parse(site.config.json || "{}") : {};
          return (
            <Card key={site.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{site.name}</h2>
                  <p className="text-sm text-slate-500">{site.domain}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    المفتاح: <code className="rounded bg-slate-100 px-2 py-1">{site.siteKey}</code>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    اللغة: {cfg.language || "ar"} · الموضع: {cfg.position || "bottom-right"}
                    {cfg.enabled === false ? " · متوقف" : ""}
                  </p>
                </div>
                <Link
                  href={`/sites/${site.id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  تحرير الإعدادات
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
