import { Users } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organization: { name: string };
};

const ROLES: Record<string, string> = { owner: "مالك", admin: "مدير", viewer: "مشاهد" };

export default async function UsersPage() {
  let users: User[] = [];
  try {
    users = await serverApiGet<User[]>("/v1/users");
  } catch {
    users = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader title="المستخدمون" description="الأدوار والصلاحيات داخل المؤسسة." />
      {!users.length ? (
        <EmptyState icon={Users} title="لا يوجد مستخدمون">
          تعذر تحميل قائمة المستخدمين الآن.
        </EmptyState>
      ) : (
      <Card className="p-0">
        <ul className="divide-y divide-ink-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <div>
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-ink-500" dir="ltr">{u.email}</div>
              </div>
              <div className="flex items-center gap-2 text-ink-500">
                {u.organization.name}
                <Badge tone={u.role === "viewer" ? "neutral" : "brand"}>{ROLES[u.role] ?? u.role}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      )}
    </div>
  );
}
