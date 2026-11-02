# حالة التطوير — منصة إمكانية الوصول (منير)

> آخر تحديث: 19 أكتوبر 2026 — الإصدار `0.1.0`

## ملخص سريع

المشروع monorepo (pnpm + Turborepo) مرخّص Apache-2.0. اكتملت طبقة **تحكم الأدمن الكامل** مع مسودة/نشر، وتحسين UX للودجت (الخصائص العشر)، ومصادقة JWT لمسارات الإدارة.

---

## ما تم تطويره

### 1. `packages/core` — النواة المشتركة
- مخطط `WidgetConfig` موسّع (`schemaVersion: 2`): خصائص مرتبة، شكل، نصوص، سلوك، إيقاف طارئ.
- ترحيل تلقائي من `enabledFeatures`/`disabledFeatures` القديمة.
- فحص تباين اللون الأساسي، ومطابقة المسارات المستثناة.
- ترجمات عربي/إنجليزي + تجاوز تسميات من الأدمن (`tLabel`).

### 2. `packages/widget` — أداة الوصول (`muneer.js`)
- لوحة بدون إعادة `innerHTML` كامل: مفاتيح `role="switch"`، مستويات −/+، حبس تركيز، عدّاد على الزر.
- Bottom sheet على الجوال، اختصار فتح قابل للضبط، تبديل لغة، رابط بيان الوصول، إخفاء للجلسة.
- احترام `enabled` / `excludedPaths` (مع تنقل SPA) / `defaultLevel` / تخزين مؤقت للإعدادات.
- وضع معاينة عبر `postMessage` (`muneer:preview-config`).

### 3. `apps/api` — الخادم
- مصادقة: تسجيل دخول، JWT في كوكي/`Authorization`، أدوار `owner|admin|viewer`.
- مسودة/نشر: `draftJson` + `ConfigVersion` + استعادة + kill-switch.
- `GET /v1/config/:siteKey` للنسخة المنشورة فقط مع ETag وCache-Control.
- تحقق Origin مقابل النطاق، وrate limit على config/events/scans.
- Seed ينشئ `admin@example.com` بكلمة مرور مُهشّشة (argon2).

### 4. `apps/dashboard` — لوحة التحكم
- صفحة `/login` وحماية عبر middleware.
- محرر موقع `/sites/[id]`: تبويبات (خصائص، شكل، نصوص، سلوك، تثبيت، سجل) + معاينة حية.
- إنشاء موقع بنموذج حقيقي (اسم + نطاق).

### 5. الماسح والخطوط
- كما في السابق: Playwright + axe-core + قواعد عربية؛ خط Tajawal كبديل مؤقت.

---

## فجوات متبقية

### قبل الإنتاج
1. PostgreSQL بدل SQLite + enums صارمة.
2. عزل أقوى للفاحص (queue/worker) ومنع SSRF أشمل.
3. ESLint فعلي وإزالة أي `allow_failure` من typecheck في CI.
4. خط عسر قراءة عربي حقيقي.
5. اختبارات E2E كاملة مع قارئات الشاشة (NVDA / VoiceOver).

### جودة
- تغطية E2E للوحة ما زالت محدودة (اختبارات وحدة للـ API واللوحة والودجت موجودة).
- الفوترة وتفعيل الرخص ما زالت سجلات فقط.

---

## أوامر التشغيل

```bash
pnpm install
pnpm --filter @a11y/api db:push
pnpm dev          # API (8787) + اللوحة (3000) + الأداة (5173)
pnpm test
```

دخول اللوحة: `admin@example.com` / `admin123`
