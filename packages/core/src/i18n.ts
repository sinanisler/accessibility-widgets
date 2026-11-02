export type LocaleDict = Record<string, string>;

export const locales: Record<string, LocaleDict> = {
  ar: {
    menuTitle: "قائمة إمكانية الوصول",
    openMenu: "فتح قائمة إمكانية الوصول",
    closeMenu: "إغلاق",
    reset: "إعادة ضبط الكل",
    search: "بحث في الخصائص…",
    visual: "بصري",
    cognitive: "معرفي",
    navigation: "تنقل",
    reader: "قارئ",
    profiles: "ملفات تعريف",
    highContrast: "تباين عالٍ",
    darkContrast: "تباين داكن",
    lightContrast: "تباين فاتح",
    invertColors: "عكس الألوان",
    biggerText: "تكبير النص",
    textSpacing: "تباعد النص",
    lineHeight: "ارتفاع الأسطر",
    textAlign: "محاذاة النص",
    hideImages: "إخفاء الصور",
    biggerCursor: "مؤشر أكبر",
    saturation: "التشبع",
    colorFilter: "فلتر عمى الألوان",
    customColors: "ألوان مخصصة",
    highlightLinks: "إبراز الروابط",
    highlightHeadings: "إبراز العناوين",
    pageZoom: "تكبير الصفحة",
    magnifier: "مكبّر عدسة",
    dyslexiaFont: "خط عسر القراءة",
    fontFamily: "اختيار الخط",
    pauseAnimations: "إيقاف الحركة",
    readingMask: "قناع القراءة",
    readingGuide: "دليل القراءة",
    focusMode: "وضع التركيز",
    muteMedia: "كتم الوسائط",
    simplifyLayout: "تبسيط التخطيط",
    tooltipDictionary: "قاموس الكلمات",
    pageMap: "خريطة الصفحة",
    strongFocus: "مؤشر التركيز",
    keyboardNav: "تنقل لوحة المفاتيح",
    landmarkNav: "تنقل المعالم",
    skipLinks: "روابط التخطي",
    largeClickTargets: "أهداف نقر أكبر",
    clickToSpeak: "اضغط للاستماع",
    wordHighlight: "تظليل الكلمات",
    readingMode: "وضع القراءة",
    ttsSpeed: "سرعة القراءة",
    voiceControl: "التحكم بالصوت",
    screenReader: "قارئ الشاشة",
    profileLowVision: "ضعف البصر",
    profileEpilepsy: "الصرع / الحساسية للحركة",
    profileAdhd: "اضطراب فرط الحركة",
    profileDyslexia: "عسر القراءة",
    profileSeniors: "كبار السن",
    profileBlind: "المكفوفون",
    profileMotor: "صعوبات حركية",
    language: "اللغة",
    active: "مفعّل",
    inactive: "معطّل",
    decrease: "تقليل",
    increase: "زيادة",
    level: "المستوى",
    hideWidget: "إخفاء الأداة لهذه الجلسة",
    accessibilityStatement: "بيان إمكانية الوصول",
    switchLanguage: "تبديل اللغة",
    featuresActive: "خصائص مفعّلة",
    resetDone: "تمت إعادة الضبط",
    hiddenHint: "أُخفيت الأداة. اضغط {shortcut} لإظهارها",
    "level.bigger-text.medium": "كبير",
    "level.bigger-text.large": "أكبر",
    "level.bigger-text.xlarge": "الأكبر",
    "level.high-contrast.medium": "أسود على أبيض",
    "level.high-contrast.high": "أبيض على أسود",
    "level.high-contrast.ultra": "أصفر على أسود",
    "level.text-spacing.light": "خفيف",
    "level.text-spacing.medium": "متوسط",
    "level.text-spacing.heavy": "واسع",
    "level.line-height.2": "مريح",
    "level.line-height.3": "واسع",
    "level.line-height.4": "الأوسع",
    "level.bigger-cursor.black": "أسود",
    "level.bigger-cursor.white": "أبيض",
    featureOn: "تم التفعيل",
    featureOff: "تم الإيقاف",
  },
  en: {
    menuTitle: "Accessibility Menu",
    openMenu: "Open accessibility menu",
    closeMenu: "Close",
    reset: "Reset all",
    search: "Search features…",
    visual: "Visual",
    cognitive: "Cognitive",
    navigation: "Navigation",
    reader: "Reader",
    profiles: "Profiles",
    highContrast: "High contrast",
    darkContrast: "Dark contrast",
    lightContrast: "Light contrast",
    invertColors: "Invert colors",
    biggerText: "Bigger text",
    textSpacing: "Text spacing",
    lineHeight: "Line height",
    textAlign: "Text align",
    hideImages: "Hide images",
    biggerCursor: "Bigger cursor",
    saturation: "Saturation",
    colorFilter: "Color filter",
    customColors: "Custom colors",
    highlightLinks: "Highlight links",
    highlightHeadings: "Highlight headings",
    pageZoom: "Page zoom",
    magnifier: "Magnifier",
    dyslexiaFont: "Dyslexia font",
    fontFamily: "Font family",
    pauseAnimations: "Pause animations",
    readingMask: "Reading mask",
    readingGuide: "Reading guide",
    focusMode: "Focus mode",
    muteMedia: "Mute media",
    simplifyLayout: "Simplify layout",
    tooltipDictionary: "Word dictionary",
    pageMap: "Page map",
    strongFocus: "Strong focus",
    keyboardNav: "Keyboard navigation",
    landmarkNav: "Landmark navigation",
    skipLinks: "Skip links",
    largeClickTargets: "Large click targets",
    clickToSpeak: "Click to speak",
    wordHighlight: "Word highlight",
    readingMode: "Reading mode",
    ttsSpeed: "Speech rate",
    voiceControl: "Voice control",
    screenReader: "Screen reader",
    profileLowVision: "Low vision",
    profileEpilepsy: "Epilepsy / motion",
    profileAdhd: "ADHD",
    profileDyslexia: "Dyslexia",
    profileSeniors: "Seniors",
    profileBlind: "Blind",
    profileMotor: "Motor",
    language: "Language",
    active: "On",
    inactive: "Off",
    decrease: "Decrease",
    increase: "Increase",
    level: "Level",
    hideWidget: "Hide widget for this session",
    accessibilityStatement: "Accessibility statement",
    switchLanguage: "Switch language",
    featuresActive: "active features",
    resetDone: "Preferences reset",
    hiddenHint: "Widget hidden. Press {shortcut} to show it again",
    "level.bigger-text.medium": "Large",
    "level.bigger-text.large": "Larger",
    "level.bigger-text.xlarge": "Largest",
    "level.high-contrast.medium": "Black on white",
    "level.high-contrast.high": "White on black",
    "level.high-contrast.ultra": "Yellow on black",
    "level.text-spacing.light": "Light",
    "level.text-spacing.medium": "Medium",
    "level.text-spacing.heavy": "Wide",
    "level.line-height.2": "Comfortable",
    "level.line-height.3": "Wide",
    "level.line-height.4": "Widest",
    "level.bigger-cursor.black": "Black",
    "level.bigger-cursor.white": "White",
    featureOn: "Enabled",
    featureOff: "Disabled",
  },
};

/** Resolve a label with optional per-language overrides from admin config. */
export function tLabel(
  lang: string,
  key: string,
  overrides?: Record<string, Partial<Record<string, string>>>,
): string {
  const fromOverride = overrides?.[lang]?.[key] ?? overrides?.["*"]?.[key];
  if (fromOverride) return fromOverride;
  return t(lang, key);
}

export function t(lang: string, key: string): string {
  const dict = locales[lang] ?? locales.en;
  const hit = dict[key] ?? locales.en[key];
  if (hit) return hit;
  // Humanize unknown keys: darkContrast -> Dark contrast
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/** `bigger-text` -> `biggerText`; the dictionary key shared by the widget and the dashboard. */
export function featureLabelKey(featureId: string): string {
  return featureId.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
}

export function levelLabelKey(featureId: string, level: string | number | boolean): string {
  return `level.${featureId}.${String(level)}`;
}

export function isSupportedLanguage(lang: string): boolean {
  return Object.prototype.hasOwnProperty.call(locales, lang);
}

export function isRtl(lang: string): boolean {
  return ["ar", "he", "fa", "ur"].some((l) => lang.toLowerCase().startsWith(l));
}
