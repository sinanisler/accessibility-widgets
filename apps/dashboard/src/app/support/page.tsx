import { Card, PageHeader } from "@/components/ui";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="الدعم" description="كيف نساعدك في تثبيت الأداة وتشغيلها." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">البدء السريع</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-ink-600">
            <li>أضف موقعك من صفحة المواقع.</li>
            <li>اضبط الخصائص والشكل ثم انشر الإعدادات.</li>
            <li>انسخ الكود من تبويب التثبيت والصقه قبل إغلاق body.</li>
          </ol>
        </Card>
        <Card>
          <h2 className="font-semibold">التواصل</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-600">
            <li>البريد: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "غير محدد بعد"}</li>
            <li>ساعات العمل: الأحد–الخميس 9ص–5م</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
