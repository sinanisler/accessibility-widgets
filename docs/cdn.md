# نشر CDN

1. ابنِ الأداة: `pnpm --filter @a11y/widget build`
2. انشر الملف `packages/widget/dist/muneer.js` إلى مسار إصداري ثابت، مثال:
   - `https://cdn.example.com/v2/muneer.js`
   - `https://cdn.example.com/v2.0.1/muneer.js`
3. فعّل `Cache-Control: public, max-age=31536000, immutable` للإصدارات المرقّمة.
4. المسار `latest` يمكن أن يشير إلى آخر إصدار مستقر (مع cache أقصر).

حجم gzip الحالي أقل من 60KB (يُفحص في CI عبر `scripts/check-widget-size.mjs`).
