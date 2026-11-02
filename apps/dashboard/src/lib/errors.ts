const MESSAGES: Record<string, string> = {
  Forbidden: "ليست لديك صلاحية لهذا الإجراء.",
  Unauthorized: "انتهت الجلسة، سجّل الدخول مرة أخرى.",
  "Contrast check failed": "اللون الأساسي لا يحقق تباين 4.5:1 مع النص الأبيض. اختر لوناً أغمق.",
  "Invalid config": "بعض الإعدادات غير صالحة. راجع الحقول المحددة.",
  "Invalid domain": "أدخل نطاقاً صحيحاً مثل example.com.",
  "Invalid URL": "أدخل رابطاً صحيحاً يبدأ بـ https://.",
  "Invalid request": "تحقق من البيانات المدخلة.",
  "URL is outside the site domain": "الرابط خارج نطاق هذا الموقع.",
  "Internal hosts are not allowed": "لا يمكن فحص العناوين الداخلية.",
  "Scan target unreachable": "تعذر الوصول إلى الصفحة. تأكد من الرابط وأن الموقع متاح.",
  "Rate limit exceeded": "محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة.",
  "Internal error": "حدث خطأ في الخادم. أعد المحاولة بعد قليل.",
};

export function errorMessage(err: unknown, fallback: string): string {
  const key = err instanceof Error ? err.message : "";
  return MESSAGES[key] ?? fallback;
}
