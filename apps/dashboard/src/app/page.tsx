import { Stat, Card } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";

type Site = {
  id: string;
  name: string;
  domain: string;
  siteKey: string;
  _count?: { events: number; scans: number };
};

export default async function HomePage() {
  let sites: Site[] = [];
  let error: string | null = null;
  try {
    sites = await serverApiGet<Site[]>("/v1/sites");
  } catch {
    error = "تعذر الاتصال بالـ API. شغّل apps/api على المنفذ 8787.";
  }

  const totalEvents = sites.reduce((s, x) => s + (x._count?.events || 0), 0);
  const totalScans = sites.reduce((s, x) => s + (x._count?.scans || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نظرة عامة</h1>
        <p className="text-slate-600">متابعة المواقع والتفعيلات والفحوص من مكان واحد.</p>
      </div>

      {error && (
        <Card className="border-amber-300 bg-amber-50 text-amber-900">{error}</Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="المواقع" value={sites.length} />
        <Stat label="أحداث الاستخدام" value={totalEvents} />
        <Stat label="تقارير الماسح" value={totalScans} />
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">أحدث المواقع</h2>
        <ul className="divide-y divide-slate-100">
          {sites.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-slate-500">{s.domain}</div>
              </div>
              <code className="rounded bg-slate-100 px-2 py-1 text-xs">{s.siteKey}</code>
            </li>
          ))}
          {!sites.length && !error && <li className="py-3 text-slate-500">لا توجد مواقع بعد.</li>}
        </ul>
      </Card>
    </div>
  );
}
