"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  V1_FEATURE_IDS,
  FEATURE_CATALOG,
  checkPrimaryContrast,
  defaultFeatureEntries,
  mergeWidgetConfig,
  type FeatureConfigEntry,
  type WidgetConfig,
} from "@a11y/core";
import {
  Button,
  Card,
  ColorInput,
  SelectInput,
  Switch,
  Tabs,
  TextInput,
} from "@/components/ui";
import { apiGet, apiSend, API_BASE } from "@/lib/api";

const PREVIEW_ORIGIN = process.env.NEXT_PUBLIC_WIDGET_PREVIEW || "http://127.0.0.1:5173";
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
  { id: "install", label: "التثبيت" },
  { id: "history", label: "السجل" },
];

function featureLabel(id: string): string {
  const map: Record<string, string> = {
    "bigger-text": "تكبير النص",
    "high-contrast": "تباين عالٍ",
    "text-spacing": "تباعد النص",
    "line-height": "ارتفاع الأسطر",
    "highlight-links": "إبراز الروابط",
    "highlight-headings": "إبراز العناوين",
    "strong-focus": "مؤشر التركيز",
    "pause-animations": "إيقاف الحركة",
    "reading-guide": "دليل القراءة",
    "bigger-cursor": "مؤشر أكبر",
  };
  return map[id] || id;
}

export function EditorClient({ siteId }: { siteId: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [draft, setDraft] = useState<WidgetConfig | null>(null);
  const [published, setPublished] = useState<WidgetConfig | null>(null);
  const [dirty, setDirty] = useState(false);
  const [localDirty, setLocalDirty] = useState(false);
  const [tab, setTab] = useState("features");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const contrast = useMemo(
    () => checkPrimaryContrast(draft?.colors),
    [draft?.colors],
  );

  const load = useCallback(async () => {
    const [s, cfg, vers] = await Promise.all([
      apiGet<Site>(`/v1/sites/${siteId}`),
      apiGet<{ draft: WidgetConfig; published: WidgetConfig; dirty: boolean }>(
        `/v1/sites/${siteId}/config/draft`,
      ),
      apiGet<VersionRow[]>(`/v1/sites/${siteId}/config/versions`),
    ]);
    setSite(s);
    setDraft(mergeWidgetConfig(cfg.draft));
    setPublished(mergeWidgetConfig(cfg.published));
    setDirty(cfg.dirty);
    setLocalDirty(false);
    setVersions(vers);
  }, [siteId]);

  useEffect(() => {
    void load().catch(() => setMsg("تعذر تحميل الإعدادات"));
  }, [load]);

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
      return mergeWidgetConfig({ ...prev, ...partial });
    });
    setLocalDirty(true);
  }

  function updateFeatures(next: FeatureConfigEntry[]) {
    update({ features: next });
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true);
    setMsg("");
    try {
      await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", draft);
      setMsg("تم حفظ المسودة");
      setLocalDirty(false);
      setDirty(true);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!draft) return;
    setBusy(true);
    try {
      if (localDirty) await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", draft);
      await apiSend(`/v1/sites/${siteId}/config/publish`, "POST", { note: "نشر من المحرر" });
      setMsg("تم النشر");
      setLocalDirty(false);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "فشل النشر");
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!published) return;
    setDraft(mergeWidgetConfig(published));
    setLocalDirty(true);
    setMsg("تم استرجاع النسخة المنشورة إلى المحرر (احفظ المسودة لتثبيت)");
  }

  async function killSwitch(enabled: boolean) {
    if (!confirm(enabled ? "تفعيل الودجت؟" : "إيقاف الودجت فوراً على الموقع؟")) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/kill-switch`, "POST", { enabled });
      setMsg(enabled ? "تم التفعيل" : "تم الإيقاف الطارئ");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "فشل");
    } finally {
      setBusy(false);
    }
  }

  async function restore(versionId: string) {
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/versions/${versionId}/restore`, "POST");
      setMsg("تمت الاستعادة إلى المسودة");
      await load();
      setLocalDirty(true);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "فشل الاستعادة");
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

  if (!draft || !site) {
    return <p className="text-slate-500">جارٍ التحميل…</p>;
  }

  const features = [...(draft.features ?? defaultFeatureEntries())].sort(
    (a, b) => a.order - b.order,
  );

  const embed = `<script src="https://cdn.example.com/v2/muneer.js" data-site-key="${site.siteKey}" data-api="${API_BASE}"></script>`;

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
          <Button variant="ghost" disabled={busy} onClick={() => void discard()}>
            تجاهل التغييرات
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => void saveDraft()}>
            حفظ المسودة
          </Button>
          <Button disabled={busy} onClick={() => void publish()}>
            نشر
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => void killSwitch(draft.enabled === false)}
          >
            {draft.enabled === false ? "إلغاء الإيقاف" : "إيقاف طارئ"}
          </Button>
        </div>
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
      {!contrast.passesAa && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{contrast.warning}</p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="space-y-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />

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
                      <div className="text-xs text-slate-500">{f.id}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="ghost" type="button" onClick={() => moveFeature(f.id, -1)}>
                        ↑
                      </Button>
                      <Button variant="ghost" type="button" onClick={() => moveFeature(f.id, 1)}>
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
                          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
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
                              {String(l)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-slate-400">
                المعتمد: {V1_FEATURE_IDS.join(", ")}
              </p>
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
                value={draft.widgetWidth || "380px"}
                onChange={(e) => update({ widgetWidth: e.target.value })}
              />
              <TextInput
                label="حجم الزر"
                type="number"
                value={draft.buttonSize ?? 56}
                onChange={(e) => update({ buttonSize: Number(e.target.value) })}
              />
              <TextInput
                label="نصف القطر"
                type="number"
                value={draft.radius ?? 16}
                onChange={(e) => update({ radius: Number(e.target.value) })}
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
                onChange={(e) =>
                  update({ offset: { x: Number(e.target.value), y: draft.offset?.y ?? 20 } })
                }
              />
              <TextInput
                label="إزاحة رأسية"
                type="number"
                value={draft.offset?.y ?? 20}
                onChange={(e) =>
                  update({ offset: { x: draft.offset?.x ?? 20, y: Number(e.target.value) } })
                }
              />
              <ColorInput
                label="اللون الأساسي"
                value={draft.colors?.primary || "#0B5FFF"}
                onChange={(primary) => update({ colors: { ...draft.colors, primary } })}
              />
              <ColorInput
                label="لون الخلفية"
                value={draft.colors?.background || "#FFFFFF"}
                onChange={(background) => update({ colors: { ...draft.colors, background } })}
              />
              <ColorInput
                label="لون النص"
                value={draft.colors?.text || "#111827"}
                onChange={(text) => update({ colors: { ...draft.colors, text } })}
              />
              <ColorInput
                label="لون التمييز"
                value={draft.colors?.accent || "#10B981"}
                onChange={(accent) => update({ colors: { ...draft.colors, accent } })}
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
                value={draft.openShortcut || "Alt+A"}
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
                    <div className="mt-1 text-xs text-slate-400">
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
