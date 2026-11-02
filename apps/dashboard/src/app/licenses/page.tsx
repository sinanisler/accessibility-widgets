import { Card } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";

type License = {
  id: string;
  plan: string;
  status: string;
  domains: string;
  expiresAt: string | null;
  organization: { name: string };
};

export default async function LicensesPage() {
  let licenses: License[] = [];
  try {
    licenses = await serverApiGet<License[]>("/v1/licenses");
  } catch {
    licenses = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الرخص</h1>
        <p className="text-slate-600">إدارة الخطط وحالة التفعيل والنطاقات المسموحة.</p>
      </div>
      <div className="grid gap-4">
        {licenses.map((l) => (
          <Card key={l.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{l.organization.name}</div>
                <div className="text-sm text-slate-500">النطاقات: {l.domains}</div>
              </div>
              <div className="text-sm">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{l.status}</span>
                <span className="mr-2 rounded-full bg-slate-100 px-3 py-1">{l.plan}</span>
              </div>
            </div>
          </Card>
        ))}
        {!licenses.length && <Card>لا توجد رخص أو تعذر الاتصال بالـ API.</Card>}
      </div>
    </div>
  );
}
