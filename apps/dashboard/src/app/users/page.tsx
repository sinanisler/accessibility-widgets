import { Users } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { serverApiGet } from "@/lib/api-server";
import { UsersManager, type Member } from "./users-manager";

export default async function UsersPage() {
  let users: Member[] = [];
  let me: Member | null = null;
  try {
    const [list, session] = await Promise.all([
      serverApiGet<Member[]>("/v1/users"),
      serverApiGet<{ user: Member }>("/v1/auth/me"),
    ]);
    users = list;
    me = session.user;
  } catch {
    users = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader title="المستخدمون" description="من يستطيع الدخول إلى اللوحة، وما الذي يستطيع فعله." />
      {!users.length || !me ? (
        <EmptyState icon={Users} title="تعذر تحميل المستخدمين">
          أعد تحميل الصفحة بعد قليل.
        </EmptyState>
      ) : (
        <UsersManager me={me} members={users} />
      )}
    </div>
  );
}
