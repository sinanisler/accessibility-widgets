import { Card } from "@/components/ui";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الدعم</h1>
        <p className="text-slate-600">قنوات المساعدة ومركز المعرفة.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">مركز المعرفة</h2>
          <p className="mt-2 text-sm text-slate-600">
            راجع التوثيق في مجلد <code>docs/</code> لخطوات التثبيت والدمج والماسح.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">التواصل</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>البريد: support@example.com</li>
            <li>ساعات العمل: الأحد–الخميس 9ص–5م</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
