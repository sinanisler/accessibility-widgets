"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FEATURE_CATALOG,
  checkPrimaryContrast,
  defaultFeatureEntries,
  featureLabelKey,
  levelLabelKey,
  mergeWidgetConfig,
  t,
  widgetConfigSchema,
  type FeatureConfigEntry,
  type WidgetConfig,
} from "@a11y/core";
import {
  Button,
  Card,
  ColorInput,
  SelectInput,
  Switch,
  TAB_PANEL_ID,
  Tabs,
  TextInput,
  tabId,
} from "@/components/ui";
import { apiGet, apiSend, API_BASE } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

const PREVIEW_ORIGIN = process.env.NEXT_PUBLIC_WIDGET_PREVIEW || "http://127.0.0.1:5173";
const WIDGET_CDN = process.env.NEXT_PUBLIC_WIDGET_CDN || "https://cdn.example.com/v2/muneer.js";
const PREVIEW_URL = `/preview.html?widget=${encodeURIComponent(`${PREVIEW_ORIGIN}/src/index.ts`)}`;

type Site = {
  id: string;
  name: string;
  domain: string;
  siteKey: string;
};

type VersionRow = {
  id: string;
  note: string | null;
  createdAt: string;
  createdBy: { email: string; name: string | null } | null;
  config: WidgetConfig;
};

const TABS = [
  { id: "features", label: "الخصائص" },
  { id: "look", label: "الشكل" },
  { id: "text", label: "النصوص" },
  { id: "behavior", label: "السلوك" },
  { id: "usage", label: "الاستخدام" },
  { id: "install", label: "التثبيت" },
  { id: "history", label: "السجل" },
];

function featureLabel(id: string): string {
  return t("ar", featureLabelKey(id));
}

const FIELD_ERRORS: Record<string, string> = {
  statementUrl: "أدخل رابطاً كاملاً يبدأ بـ https://",
  buttonSize: "القيمة بين 40 و96",
  radius: "القيمة بين 0 و32",
  widgetWidth: "مثال صحيح: 380px",
  "offset.x": "القيمة بين 0 و400",
  "offset.y": "القيمة بين 0 و400",
  openShortcut: "مثال صحيح: Alt+A",
};

const COLOR_ERROR = "أدخل لون hex مثل #0B5FFF";

/** Numeric fields may be empty while typing; empty means "use the default". */
function numberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

const EVENT_LABELS: Record<string, string> = {
  widget_init: "مرات تحميل الودجت",
  feature_toggle: "تغيير الخصائص",
  reset: "إعادة الضبط",
};

type Analytics = {
  total: number;
  byEvent: Record<string, number>;
  byFeature: Record<string, number>;
};

export function EditorClient({ siteId }: { siteId: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [draft, setDraft] = useState<WidgetConfig | null>(null);
  const [published, setPublished] = useState<WidgetConfig | null>(null);
  const [dirty, setDirty] = useState(false);
  const [localDirty, setLocalDirty] = useState(false);
  const [tab, setTab] = useState("features");
  const [msg, setMsg] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const contrast = useMemo(
    () => checkPrimaryContrast(draft?.colors),
    [draft?.colors],
  );

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const parsed = widgetConfigSchema.safeParse(draft ?? {});
    if (parsed.success) return errors;
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      errors[path] = path.startsWith("colors.") ? COLOR_ERROR : FIELD_ERRORS[path] ?? "قيمة غير صالحة";
    }
    return errors;
  }, [draft]);
  const invalid = Object.keys(fieldErrors).length > 0;

  const load = useCallback(async () => {
    const [s, cfg, vers, usage, me] = await Promise.all([
      apiGet<Site>(`/v1/sites/${siteId}`),
      apiGet<{ draft: WidgetConfig; published: WidgetConfig; dirty: boolean }>(
        `/v1/sites/${siteId}/config/draft`,
      ),
      apiGet<VersionRow[]>(`/v1/sites/${siteId}/config/versions`),
      apiGet<Analytics>(`/v1/sites/${siteId}/analytics`),
      apiGet<{ user: { role: string } }>("/v1/auth/me"),
    ]);
    setSite(s);
    setDraft(mergeWidgetConfig(cfg.draft));
    setPublished(mergeWidgetConfig(cfg.published));
    setDirty(cfg.dirty);
    setLocalDirty(false);
    setVersions(vers);
    setAnalytics(usage);
    setReadOnly(me.user.role === "viewer");
  }, [siteId]);

  useEffect(() => {
    void load().catch(() => setLoadFailed(true));
  }, [load]);

  // beforeunload does not cover in-app navigation, so internal links are guarded here.
  useEffect(() => {
    if (!localDirty) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (link && !window.confirm("لديك تعديلات غير محفوظة. هل تريد المغادرة دون حفظها؟")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [localDirty]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!localDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [localDirty]);

  const pushPreview = useCallback(
    (config: WidgetConfig) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage(
        {
          type: "muneer:preview-config",
          config: {
            ...config,
            language: previewLang,
            persistPreferences: false,
            enableAnalytics: false,
          },
        },
        window.location.origin,
      );
    },
    [previewLang],
  );

  useEffect(() => {
    if (!draft) return;
    const t = window.setTimeout(() => pushPreview(draft), 200);
    return () => window.clearTimeout(t);
  }, [draft, pushPreview, previewDevice]);

  function update(partial: Partial<WidgetConfig>) {
    setDraft((prev) => {
      if (!prev) return prev;
      // Kept unvalidated so half-typed values stay in the field; checked by fieldErrors and on save.
      return { ...prev, ...partial };
    });
    setLocalDirty(true);
  }

  function updateFeatures(next: FeatureConfigEntry[]) {
    update({ features: next });
  }

  async function saveDraft() {
    if (!draft) return;
    if (invalid) {
      setMsg("صحّح الحقول المحددة قبل الحفظ.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", draft);
      setMsg("تم حفظ المسودة");
      setLocalDirty(false);
      setDirty(true);
      await load();
    } catch (err) {
      setMsg(errorMessage(err, "فشل الحفظ"));
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!draft) return;
    if (invalid) {
      setMsg("صحّح الحقول المحددة قبل النشر.");
      return;
    }
    if (!window.confirm("نشر هذه الإعدادات على الموقع الآن؟")) return;
    setBusy(true);
    try {
      if (localDirty) await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", draft);
      await apiSend(`/v1/sites/${siteId}/config/publish`, "POST", { note: "نشر من المحرر" });
      setMsg("تم النشر");
      setLocalDirty(false);
      await load();
    } catch (err) {
      setMsg(errorMessage(err, "فشل النشر"));
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!published) return;
    if (!window.confirm("حذف كل التعديلات والعودة إلى النسخة المنشورة؟")) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", published);
      await load();
      setMsg("تمت العودة إلى النسخة المنشورة");
    } catch (err) {
      setMsg(errorMessage(err, "تعذر تجاهل التغييرات"));
    } finally {
      setBusy(false);
    }
  }

  async function killSwitch(enabled: boolean) {
    if (!confirm(enabled ? "تفعيل الودجت؟" : "إيقاف الودجت فوراً على الموقع؟")) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/kill-switch`, "POST", { enabled });
      setMsg(enabled ? "تم التفعيل" : "تم الإيقاف الطارئ");
      // Only `enabled` changed, so unsaved edits in the form stay as they are.
      setDraft((prev) => (prev ? { ...prev, enabled } : prev));
      setPublished((prev) => (prev ? { ...prev, enabled } : prev));
    } catch (err) {
      setMsg(errorMessage(err, "تعذر تنفيذ الإيقاف"));
    } finally {
      setBusy(false);
    }
  }

  async function restore(versionId: string) {
    if (localDirty && !window.confirm("ستُستبدل التعديلات غير المحفوظة. هل تريد المتابعة؟")) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/versions/${versionId}/restore`, "POST");
      setMsg("تمت الاستعادة إلى المسودة");
      await load();
      setLocalDirty(true);
    } catch (err) {
      setMsg(errorMessage(err, "فشل الاستعادة"));
    } finally {
      setBusy(false);
    }
  }

  function moveFeature(id: string, dir: -1 | 1) {
    if (!draft?.features) return;
    const sorted = [...draft.features].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((f) => f.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx]!;
    const b = sorted[swap]!;
    const next = draft.features.map((f) => {
      if (f.id === a.id) return { ...f, order: b.order };
      if (f.id === b.id) return { ...f, order: a.order };
      return f;
    });
    updateFeatures(next);
  }

  if (loadFailed) {
    return (
      <Card className="max-w-md space-y-3">
        <h1 className="text-xl font-bold">تعذر فتح هذا الموقع</h1>
        <p className="text-sm text-slate-600">قد يكون الموقع غير موجود أو غير متاح لحسابك.</p>
        <Link href="/sites" className="text-sm font-semibold text-brand">
          العودة إلى المواقع
        </Link>
      </Card>
    );
  }

  if (!draft || !site) {
    return <p className="text-slate-500">جارٍ التحميل…</p>;
  }

  const features = [...(draft.features ?? defaultFeatureEntries())].sort(
    (a, b) => a.order - b.order,
  );

  const embed = `<script src="${WIDGET_CDN}" data-site-key="${site.siteKey}" data-api="${API_BASE}" defer></script>`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/sites" className="text-sm text-brand">
            ← المواقع
          </Link>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-sm text-slate-500">{site.domain}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(dirty || localDirty) && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              مسودة غير منشورة
            </span>
          )}
          {readOnly && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              عرض فقط
            </span>
          )}
          <Button variant="ghost" disabled={busy || readOnly} onClick={() => void discard()}>
            تجاهل التغييرات
          </Button>
          <Button variant="ghost" disabled={busy || readOnly} onClick={() => void saveDraft()}>
            حفظ المسودة
          </Button>
          <Button disabled={busy || readOnly} onClick={() => void publish()}>
            نشر
          </Button>
          <Button
            variant="danger"
            disabled={busy || readOnly}
            onClick={() => void killSwitch(draft.enabled === false)}
          >
            {draft.enabled === false ? "إلغاء الإيقاف" : "إيقاف طارئ"}
          </Button>
        </div>
      </div>
      <p role="status" className="min-h-5 text-sm text-slate-600">
        {msg}
      </p>
      {!contrast.passesAa && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          تباين اللون الأساسي مع النص الأبيض {contrast.ratio}:1، والمطلوب 4.5:1 على الأقل.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="space-y-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div role="tabpanel" id={TAB_PANEL_ID} aria-labelledby={tabId(tab)} tabIndex={0}>

          {tab === "features" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                الخصائص العشر المعتمدة. استخدم الأسهم لإعادة الترتيب.
              </p>
              {features.map((f) => {
                const catalog = FEATURE_CATALOG.find((c) => c.id === f.id);
                const levels = f.allowedLevels ?? catalog?.levels ?? [true];
                return (
                  <div
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <div className="font-semibold">{featureLabel(f.id)}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        type="button"
                        aria-label={`نقل ${featureLabel(f.id)} لأعلى`}
                        onClick={() => moveFeature(f.id, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        aria-label={`نقل ${featureLabel(f.id)} لأسفل`}
                        onClick={() => moveFeature(f.id, 1)}
                      >
                        ↓
                      </Button>
                      <Switch
                        label={`تفعيل ${featureLabel(f.id)}`}
                        checked={f.enabled}
                        onChange={(enabled) =>
                          updateFeatures(
                            features.map((x) => (x.id === f.id ? { ...x, enabled } : x)),
                          )
                        }
                      />
                      {levels.length > 1 && (
                        <select
                          aria-label={`المستوى الافتراضي لخاصية ${featureLabel(f.id)}`}
                          className="rounded-lg border border-slate-400 px-2 py-1 text-sm"
                          value={String(f.defaultLevel ?? "")}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const defaultLevel =
                              raw === "" ? null : levels.find((l) => String(l) === raw) ?? raw;
                            updateFeatures(
                              features.map((x) => (x.id === f.id ? { ...x, defaultLevel } : x)),
                            );
                          }}
                        >
                          <option value="">بدون افتراضي</option>
                          {levels.map((l) => (
                            <option key={String(l)} value={String(l)}>
                              {t("ar", levelLabelKey(f.id, l))}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "look" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                label="الموضع"
                value={draft.position || "bottom-right"}
                onChange={(e) => update({ position: e.target.value as WidgetConfig["position"] })}
              >
                <option value="bottom-right">أسفل يمين</option>
                <option value="bottom-left">أسفل يسار</option>
                <option value="top-right">أعلى يمين</option>
                <option value="top-left">أعلى يسار</option>
              </SelectInput>
              <TextInput
                label="عرض اللوحة"
                value={draft.widgetWidth ?? ""}
                error={fieldErrors.widgetWidth}
                onChange={(e) => update({ widgetWidth: e.target.value })}
              />
              <TextInput
                label="حجم الزر"
                type="number"
                value={draft.buttonSize ?? ""}
                error={fieldErrors.buttonSize}
                onChange={(e) => update({ buttonSize: numberOrUndefined(e.target.value) })}
              />
              <TextInput
                label="نصف القطر"
                type="number"
                value={draft.radius ?? ""}
                error={fieldErrors.radius}
                onChange={(e) => update({ radius: numberOrUndefined(e.target.value) })}
              />
              <SelectInput
                label="الأيقونة"
                value={draft.buttonIcon || "person"}
                onChange={(e) =>
                  update({ buttonIcon: e.target.value as WidgetConfig["buttonIcon"] })
                }
              >
                <option value="person">شخص</option>
                <option value="a11y">وصول</option>
                <option value="eye">عين</option>
                <option value="text">نص</option>
              </SelectInput>
              <SelectInput
                label="السمة"
                value={draft.theme || "light"}
                onChange={(e) => update({ theme: e.target.value as WidgetConfig["theme"] })}
              >
                <option value="light">فاتح</option>
                <option value="dark">داكن</option>
                <option value="auto">تلقائي</option>
              </SelectInput>
              <TextInput
                label="إزاحة أفقية"
                type="number"
                value={draft.offset?.x ?? 20}
                error={fieldErrors["offset.x"]}
                onChange={(e) =>
                  update({ offset: { x: Number(e.target.value), y: draft.offset?.y ?? 20 } })
                }
              />
              <TextInput
                label="إزاحة رأسية"
                type="number"
                value={draft.offset?.y ?? 20}
                error={fieldErrors["offset.y"]}
                onChange={(e) =>
                  update({ offset: { x: draft.offset?.x ?? 20, y: Number(e.target.value) } })
                }
              />
              <ColorInput
                label="اللون الأساسي"
                value={draft.colors?.primary ?? ""}
                error={fieldErrors["colors.primary"]}
                onChange={(primary) => update({ colors: { ...draft.colors, primary } })}
              />
              <ColorInput
                label="لون الخلفية"
                value={draft.colors?.background ?? ""}
                error={fieldErrors["colors.background"]}
                onChange={(background) => update({ colors: { ...draft.colors, background } })}
              />
              <ColorInput
                label="لون النص"
                value={draft.colors?.text ?? ""}
                error={fieldErrors["colors.text"]}
                onChange={(text) => update({ colors: { ...draft.colors, text } })}
              />
              <SelectInput
                label="موضع الجوال"
                value={draft.mobile?.position || draft.position || "bottom-right"}
                onChange={(e) =>
                  update({
                    mobile: {
                      ...draft.mobile,
                      position: e.target.value as WidgetConfig["position"],
                    },
                  })
                }
              >
                <option value="bottom-right">أسفل يمين</option>
                <option value="bottom-left">أسفل يسار</option>
                <option value="top-right">أعلى يمين</option>
                <option value="top-left">أعلى يسار</option>
              </SelectInput>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                <span className="text-sm">إخفاء على الجوال</span>
                <Switch
                  label="إخفاء على الجوال"
                  checked={!!draft.mobile?.hide}
                  onChange={(hide) => update({ mobile: { ...draft.mobile, hide } })}
                />
              </div>
            </div>
          )}

          {tab === "text" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput
                label="اللغة الافتراضية"
                value={draft.defaultLanguage || draft.language || "ar"}
                onChange={(e) =>
                  update({ defaultLanguage: e.target.value, language: e.target.value })
                }
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </SelectInput>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                <span className="text-sm">اكتشاف لغة الصفحة</span>
                <Switch
                  label="اكتشاف لغة الصفحة"
                  checked={!!draft.autoDetectLanguage}
                  onChange={(autoDetectLanguage) => update({ autoDetectLanguage })}
                />
              </div>
              <TextInput
                label="رابط بيان الوصول"
                className="sm:col-span-2"
                value={draft.statementUrl || ""}
                error={fieldErrors.statementUrl}
                onChange={(e) => update({ statementUrl: e.target.value })}
                placeholder="https://example.com/accessibility"
              />
              <TextInput
                label="عنوان القائمة (عربي)"
                value={draft.labels?.ar?.menuTitle || ""}
                onChange={(e) =>
                  update({
                    labels: {
                      ...draft.labels,
                      ar: { ...draft.labels?.ar, menuTitle: e.target.value },
                    },
                  })
                }
              />
              <TextInput
                label="عنوان القائمة (إنجليزي)"
                value={draft.labels?.en?.menuTitle || ""}
                onChange={(e) =>
                  update({
                    labels: {
                      ...draft.labels,
                      en: { ...draft.labels?.en, menuTitle: e.target.value },
                    },
                  })
                }
              />
            </div>
          )}

          {tab === "behavior" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                <span className="text-sm">الودجت مفعّل</span>
                <Switch
                  label="الودجت مفعّل"
                  checked={draft.enabled !== false}
                  onChange={(enabled) => update({ enabled })}
                />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                <span className="text-sm">حفظ التفضيلات محلياً</span>
                <Switch
                  label="حفظ التفضيلات"
                  checked={draft.persistPreferences !== false}
                  onChange={(persistPreferences) => update({ persistPreferences })}
                />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                <span className="text-sm">التحليلات</span>
                <Switch
                  label="التحليلات"
                  checked={draft.enableAnalytics !== false}
                  onChange={(enableAnalytics) => update({ enableAnalytics })}
                />
              </div>
              <TextInput
                label="اختصار الفتح"
                value={draft.openShortcut ?? ""}
                error={fieldErrors.openShortcut}
                onChange={(e) => update({ openShortcut: e.target.value })}
              />
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-600">
                  صفحات مستثناة (مسار في كل سطر، يدعم * و **)
                </span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={(draft.excludedPaths || []).join("\n")}
                  onChange={(e) =>
                    update({
                      excludedPaths: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder={"/admin\n/checkout/**"}
                />
              </label>
            </div>
          )}

          {tab === "usage" && (
            <div className="space-y-3">
              {!analytics?.total && (
                <p className="text-sm text-slate-500">لا توجد بيانات استخدام بعد.</p>
              )}
              {!!analytics?.total && (
                <>
                  <ul className="divide-y divide-slate-100 text-sm">
                    {Object.entries(analytics.byEvent).map(([event, count]) => (
                      <li key={event} className="flex justify-between py-2">
                        <span>{EVENT_LABELS[event] ?? event}</span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                  <h2 className="text-sm font-semibold">أكثر الخصائص استخداماً</h2>
                  <ul className="divide-y divide-slate-100 text-sm">
                    {Object.entries(analytics.byFeature)
                      .sort((a, b) => b[1] - a[1])
                      .map(([feature, count]) => (
                        <li key={feature} className="flex justify-between py-2">
                          <span>{featureLabel(feature)}</span>
                          <span className="font-semibold">{count}</span>
                        </li>
                      ))}
                  </ul>
                </>
              )}
              <p className="text-xs text-slate-500">آخر 500 حدث، دون أي بيانات شخصية.</p>
            </div>
          )}

          {tab === "install" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">الصق هذا السكربت قبل إغلاق body:</p>
              <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
                {embed}
              </pre>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  void navigator.clipboard.writeText(embed);
                  setMsg("تم نسخ كود التضمين");
                }}
              >
                نسخ الكود
              </Button>
              <p className="text-xs text-slate-500">Site key: {site.siteKey}</p>
              <p className="text-xs text-slate-500">API: {API_BASE}</p>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {versions.length === 0 && (
                <p className="text-sm text-slate-500">لا توجد نسخ منشورة بعد.</p>
              )}
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {new Date(v.createdAt).toLocaleString("ar")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {v.createdBy?.name || v.createdBy?.email || "—"}
                      {v.note ? ` · ${v.note}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      موضع: {v.config.position} · لغة: {v.config.language}
                    </div>
                  </div>
                  <Button variant="ghost" disabled={busy} onClick={() => void restore(v.id)}>
                    استعادة للمسودة
                  </Button>
                </div>
              ))}
            </div>
          )}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">معاينة حية</h2>
            <div className="flex gap-2">
              <Button
                variant={previewDevice === "desktop" ? "primary" : "ghost"}
                type="button"
                onClick={() => setPreviewDevice("desktop")}
              >
                سطح مكتب
              </Button>
              <Button
                variant={previewDevice === "mobile" ? "primary" : "ghost"}
                type="button"
                onClick={() => setPreviewDevice("mobile")}
              >
                جوال
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setPreviewLang((l) => (l === "ar" ? "en" : "ar"))}
              >
                {previewLang === "ar" ? "EN" : "عربي"}
              </Button>
            </div>
          </div>
          <div
            className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            style={{
              width: previewDevice === "mobile" ? 375 : "100%",
              height: 640,
            }}
          >
            <iframe
              ref={iframeRef}
              title="معاينة الودجت"
              src={PREVIEW_URL}
              className="h-full w-full bg-white"
              onLoad={() => draft && pushPreview(draft)}
            />
          </div>
          <p className="text-xs text-slate-500">
            تتطلب المعاينة تشغيل خادم الودجت على {PREVIEW_ORIGIN}
          </p>
        </Card>
      </div>
    </div>
  );
}
