import { Card } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organization: { name: string };
};

export default async function UsersPage() {
  let users: User[] = [];
  try {
    users = await serverApiGet<User[]>("/v1/users");
  } catch {
    users = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المستخدمون</h1>
        <p className="text-slate-600">أدوار وصلاحيات داخل المؤسسة.</p>
      </div>
      <Card>
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-slate-500">{u.email}</div>
              </div>
              <div className="text-slate-600">
                {u.organization.name} · {u.role}
              </div>
            </li>
          ))}
          {!users.length && <li className="py-3 text-slate-500">لا يوجد مستخدمون أو الـ API متوقف.</li>}
        </ul>
      </Card>
    </div>
  );
}
