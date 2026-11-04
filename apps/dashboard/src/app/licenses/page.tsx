import { KeyRound } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";

type License = {
  id: string;
  plan: string;
  status: string;
  domains: string;
  expiresAt: string | null;
  organization: { name: string };
};

const STATUS: Record<string, string> = { active: "فعّالة", expired: "منتهية", suspended: "موقوفة", trial: "تجريبية" };

export default async function LicensesPage() {
  let licenses: License[] = [];
  try {
    licenses = await serverApiGet<License[]>("/v1/licenses");
  } catch {
    licenses = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader title="الرخص" description="الخطط وحالة التفعيل والنطاقات المسموحة." />
      <div className="grid gap-4">
        {licenses.map((l) => (
          <Card key={l.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{l.organization.name}</div>
                <div className="text-sm text-ink-500">النطاقات: <span dir="ltr">{l.domains}</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={l.status === "active" ? "success" : "warning"}>{STATUS[l.status] ?? l.status}</Badge>
                <Badge>{l.plan}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {!licenses.length && (
          <EmptyState icon={KeyRound} title="لا توجد رخص">
            لم تُسجَّل رخص لمؤسستك بعد، أو تعذر الاتصال بالخادم.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
