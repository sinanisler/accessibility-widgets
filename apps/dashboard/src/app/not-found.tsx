import Link from "next/link";
import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-md space-y-3">
      <h1 className="text-xl font-bold">الصفحة غير موجودة</h1>
      <p className="text-sm text-ink-600">ربما تغيّر الرابط أو حُذفت الصفحة.</p>
      <Link href="/" className="text-sm font-semibold text-brand">
        العودة إلى النظرة العامة
      </Link>
    </Card>
  );
}
