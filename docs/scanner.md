# الماسح

يستخدم Playwright + axe-core مع قواعد عربية (`lang`/`dir`، تسلسل العناوين، النص البديل، تلميحات التباين).

## CLI

```bash
pnpm --filter @a11y/scanner exec playwright install chromium
pnpm scanner:cli https://example.com
```

## عبر لوحة التحكم

من صفحة «الماسح» اختر موقعاً وأدخل رابطاً ثم ابدأ الفحص. تُحفظ التقارير في قاعدة البيانات.
