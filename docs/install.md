# التثبيت والدمج

## تضمين الأداة (سطر واحد)

```html
<script>
  window.ACCESSIBILITY_WIDGET_CONFIG = {
    siteKey: "demo-site-key",
    apiBaseUrl: "https://api.example.com",
    language: "ar"
  };
</script>
<script src="https://cdn.example.com/v2/muneer.js" defer></script>
```

للتطوير المحلي بعد البناء:

```html
<script src="/packages/widget/dist/muneer.js"></script>
```

## التشغيل المحلي

```bash
pnpm install
pnpm --filter @a11y/api db:push
pnpm --filter @a11y/widget build
pnpm --filter @a11y/api dev
pnpm --filter @a11y/dashboard dev
pnpm --filter @a11y/widget dev
```

- الأداة التجريبية: http://127.0.0.1:5173/demo/
- لوحة التحكم: http://127.0.0.1:3000
- API: http://127.0.0.1:8787

## تسجيل دخول لوحة التحكم

بعد `db:push` يُنشأ حساب تجريبي:

- البريد: `admin@example.com`
- كلمة المرور: `admin123` (أو قيمة `SEED_ADMIN_PASSWORD`)

اضبط `JWT_SECRET` في بيئة الإنتاج.

## محرر إعدادات الودجت

1. سجّل الدخول إلى اللوحة.
2. افتح **المواقع** → **تحرير الإعدادات**.
3. عدّل الخصائص / الشكل / النصوص / السلوك.
4. استخدم **المعاينة الحية** (تتطلب تشغيل `@a11y/widget` على المنفذ 5173).
5. **حفظ المسودة** ثم **نشر** ليصل الإعداد للمواقع عبر `GET /v1/config/:siteKey`.
6. **إيقاف طارئ** يعطّل الودجت فوراً على الموقع المنشور.

## إعدادات مهمة للودجت

| الحقل | الوظيفة |
|---|---|
| `enabled` | إيقاف/تشغيل الودجت (kill switch) |
| `features[]` | تفعيل وترتيب ومستوى افتراضي لكل خاصية v1 |
| `excludedPaths` | مسارات لا يظهر فيها الودجت (`*` / `**`) |
| `openShortcut` | اختصار لوحة المفاتيح (افتراضي `Alt+A`) |
| `statementUrl` | رابط بيان إمكانية الوصول |
| `persistPreferences` | حفظ تفضيلات الزائر محلياً |
| `enableAnalytics` | إرسال أحداث مجمّعة |

## متغيرات البيئة

| المتغير | أين | الوصف |
|---|---|---|
| `DATABASE_URL` | API | مسار SQLite/Postgres |
| `JWT_SECRET` | API | سر توقيع الجلسة |
| `SEED_ADMIN_PASSWORD` | API | كلمة مرور الأدمن عند أول seed |
| `DASHBOARD_ORIGIN` | API | أصل اللوحة لـ CORS |
| `NEXT_PUBLIC_API_BASE` | Dashboard | عنوان الـ API |
| `NEXT_PUBLIC_WIDGET_PREVIEW` | Dashboard | أصل معاينة الودجت (افتراضي `http://127.0.0.1:5173`) |
