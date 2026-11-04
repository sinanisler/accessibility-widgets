"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
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
  ChevronDown,
  ChevronUp,
  Code2,
  GripVertical,
  History,
  LineChart,
  Monitor,
  Palette,
  Settings2,
  Smartphone,
  Sparkles,
  Type,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  PageHeader,
  SelectInput,
  Switch,
  TAB_PANEL_ID,
  Tabs,
  TextInput,
  tabId,
} from "@/components/ui";
import { apiGet, apiSend, API_BASE } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { CopyField } from "@/components/copy-field";
import { ConfirmDialog } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { LookPanel } from "./look-panel";

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
  { id: "features", label: "الخصائص", icon: Sparkles },
  { id: "look", label: "الشكل", icon: Palette },
  { id: "text", label: "النصوص", icon: Type },
  { id: "behavior", label: "السلوك", icon: Settings2 },
  { id: "install", label: "التثبيت", icon: Code2 },
  { id: "usage", label: "الاستخدام", icon: LineChart },
  { id: "history", label: "السجل", icon: History },
];

/** Config keys grouped under the editor section a person would recognise, for the publish summary. */
const SECTION_OF: Record<string, string> = {
  features: "الخصائص",
  quickPresets: "الإعدادات السريعة",
  colors: "الألوان",
  theme: "مظهر اللوحة",
  position: "المكان",
  offset: "المكان",
  mobile: "المكان على الجوال",
  buttonSize: "الزر والشعار",
  buttonIcon: "الزر والشعار",
  buttonShape: "الزر والشعار",
  logoUrl: "الزر والشعار",
  widgetWidth: "حجم اللوحة",
  radius: "حجم اللوحة",
  language: "اللغة",
  defaultLanguage: "اللغة",
  autoDetectLanguage: "اللغة",
  labels: "النصوص",
  statementUrl: "بيان الوصول",
  enabled: "تشغيل الأداة",
  excludedPaths: "الصفحات المستثناة",
  persistPreferences: "حفظ التفضيلات",
  enableAnalytics: "التحليلات",
  openShortcut: "اختصار الفتح",
};

function changedSections(draft: WidgetConfig, published: WidgetConfig | null): string[] {
  if (!published) return [];
  const keys = new Set([...Object.keys(draft), ...Object.keys(published)]);
  const out = new Set<string>();
  for (const key of keys) {
    const a = JSON.stringify(draft[key as keyof WidgetConfig] ?? null);
    const b = JSON.stringify(published[key as keyof WidgetConfig] ?? null);
    if (a !== b && SECTION_OF[key]) out.add(SECTION_OF[key]);
  }
  return [...out];
}

type PendingAction = "publish" | "discard" | "pause" | "resume" | null;


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

  // Deep links such as ?tab=install from the overview checklist.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("tab");
    if (wanted && TABS.some((t) => t.id === wanted)) setTab(wanted);
  }, []);
  const toast = useToast();
  const [pending, setPending] = useState<PendingAction>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
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
      toast("صحّح الحقول المحددة باللون الأحمر قبل الحفظ.", "error");
      return;
    }
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", draft);
      toast("تم حفظ المسودة");
      setLocalDirty(false);
      setDirty(true);
      await load();
    } catch (err) {
      toast(errorMessage(err, "فشل الحفظ"), "error");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!draft) return;
    if (invalid) {
      toast("صحّح الحقول المحددة باللون الأحمر قبل النشر.", "error");
      return;
    }
    setBusy(true);
    try {
      if (localDirty) await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", draft);
      await apiSend(`/v1/sites/${siteId}/config/publish`, "POST", { note: "نشر من المحرر" });
      toast("نُشرت الإعدادات على الموقع");
      setLocalDirty(false);
      await load();
    } catch (err) {
      toast(errorMessage(err, "فشل النشر"), "error");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  async function discard() {
    if (!published) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/draft`, "PUT", published);
      await load();
      toast("تمت العودة إلى النسخة المنشورة");
    } catch (err) {
      toast(errorMessage(err, "تعذر تجاهل التغييرات"), "error");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  async function killSwitch(enabled: boolean) {
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/kill-switch`, "POST", { enabled });
      toast(enabled ? "عادت الأداة للعمل على الموقع" : "أُوقفت الأداة على الموقع");
      // Only `enabled` changed, so unsaved edits in the form stay as they are.
      setDraft((prev) => (prev ? { ...prev, enabled } : prev));
      setPublished((prev) => (prev ? { ...prev, enabled } : prev));
    } catch (err) {
      toast(errorMessage(err, "تعذر تنفيذ الإيقاف"), "error");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  async function restore(versionId: string) {
    if (localDirty && !window.confirm("ستُستبدل التعديلات غير المحفوظة. هل تريد المتابعة؟")) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config/versions/${versionId}/restore`, "POST");
      toast("تمت الاستعادة إلى المسودة");
      await load();
      setLocalDirty(true);
    } catch (err) {
      toast(errorMessage(err, "فشل الاستعادة"), "error");
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

  /** Drag-and-drop target: place `fromId` where `toId` is and renumber, so orders stay 0..n. */
  function dropFeature(fromId: string, toId: string) {
    if (!draft?.features || fromId === toId) return;
    const sorted = [...draft.features].sort((a, b) => a.order - b.order);
    const from = sorted.findIndex((f) => f.id === fromId);
    const to = sorted.findIndex((f) => f.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = sorted.splice(from, 1);
    sorted.splice(to, 0, moved!);
    updateFeatures(sorted.map((f, order) => ({ ...f, order })));
    toast(`نُقلت «${featureLabel(fromId)}» إلى الموضع ${to + 1}`);
  }

  if (loadFailed) {
    return (
      <Card className="max-w-md space-y-3">
        <h1 className="text-xl font-bold">تعذر فتح هذا الموقع</h1>
        <p className="text-sm text-ink-600">قد يكون الموقع غير موجود أو غير متاح لحسابك.</p>
        <Link href="/sites" className="text-sm font-semibold text-brand">
          العودة إلى المواقع
        </Link>
      </Card>
    );
  }

  if (!draft || !site) {
    return <p className="text-ink-500">جارٍ التحميل…</p>;
  }

  const features = [...(draft.features ?? defaultFeatureEntries())].sort(
    (a, b) => a.order - b.order,
  );

  const embed = `<script src="${WIDGET_CDN}" data-site-key="${site.siteKey}" data-api="${API_BASE}" defer></script>`;

  const unpublished = dirty || localDirty;
  const changes = changedSections(draft, published);
  const paused = draft.enabled === false;

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: "/sites", label: "المواقع" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {site.name}
            {paused ? (
              <Badge tone="danger">متوقفة</Badge>
            ) : unpublished ? (
              <Badge tone="warning">{localDirty ? "تعديلات غير محفوظة" : "مسودة غير منشورة"}</Badge>
            ) : (
              <Badge tone="success">منشورة</Badge>
            )}
            {readOnly && <Badge>عرض فقط</Badge>}
          </span>
        }
        description={<span dir="ltr">{site.domain}</span>}
      />

      {!contrast.passesAa && (
        <p role="alert" className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {contrast.ratio < 4.5
            ? `تباين النص على اللون الأساسي ${contrast.ratio}:1، والمطلوب 4.5:1 على الأقل.`
            : `تباين زر الأداة مع صفحة فاتحة ${contrast.buttonRatio}:1، والمطلوب 3:1 على الأقل حتى يظهر الزر.`}
          {" "}لن يُقبل الحفظ حتى تختار لوناً آخر من تبويب «الشكل».
        </p>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <Card className="space-y-5 pb-24">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div role="tabpanel" id={TAB_PANEL_ID} aria-labelledby={tabId(tab)} tabIndex={0}>

          {tab === "features" && (
            <div className="space-y-3">
              <p className="text-sm text-ink-500">
                تظهر الخصائص في الأداة مجمّعة حسب الاستخدام (القراءة، الرؤية، التنقل)، وترتيبك هنا يحدد ترتيبها داخل كل مجموعة. اسحب الصف لتغيير ترتيبه، أو استخدم زرّي الأعلى والأسفل.
              </p>
              {features.map((f) => {
                const catalog = FEATURE_CATALOG.find((c) => c.id === f.id);
                const levels = f.allowedLevels ?? catalog?.levels ?? [true];
                return (
                  <div
                    key={f.id}
                    draggable={!readOnly}
                    onDragStart={(e) => {
                      setDragId(f.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      setOverId(f.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId) dropFeature(dragId, f.id);
                      setDragId(null);
                      setOverId(null);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                    className={clsx(
                      "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition",
                      f.enabled ? "border-ink-200 bg-surface" : "border-dashed border-ink-200 bg-ink-50",
                      dragId === f.id && "opacity-50",
                      overId === f.id && dragId !== f.id && "border-brand bg-brand-soft",
                    )}
                  >
                    {!readOnly && (
                      <GripVertical
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 cursor-grab text-ink-400 active:cursor-grabbing"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className={f.enabled ? "font-semibold" : "font-semibold text-ink-400"}>{featureLabel(f.id)}</div>
                      <div className="text-xs text-ink-500">
                        {f.enabled ? (levels.length > 1 ? `${levels.length} مستويات` : "تشغيل وإيقاف") : "مخفية من الأداة"}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        icon={ChevronUp}
                        aria-label={`نقل ${featureLabel(f.id)} لأعلى`}
                        onClick={() => moveFeature(f.id, -1)}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        icon={ChevronDown}
                        aria-label={`نقل ${featureLabel(f.id)} لأسفل`}
                        onClick={() => moveFeature(f.id, 1)}
                      />
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
                          className="rounded-lg border border-ink-400 px-2 py-1 text-sm"
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
            <LookPanel draft={draft} update={update} fieldErrors={fieldErrors} />
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
              <div className="flex items-center justify-between gap-2 rounded-xl border border-ink-200 p-3">
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
              <div className="flex items-center justify-between gap-2 rounded-xl border border-ink-200 p-3">
                <span className="text-sm">الودجت مفعّل</span>
                <Switch
                  label="الودجت مفعّل"
                  checked={draft.enabled !== false}
                  onChange={(enabled) => update({ enabled })}
                />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-ink-200 p-3">
                <span className="text-sm">حفظ التفضيلات محلياً</span>
                <Switch
                  label="حفظ التفضيلات"
                  checked={draft.persistPreferences !== false}
                  onChange={(persistPreferences) => update({ persistPreferences })}
                />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-ink-200 p-3">
                <span className="text-sm">التحليلات</span>
                <Switch
                  label="التحليلات"
                  checked={draft.enableAnalytics !== false}
                  onChange={(enableAnalytics) => update({ enableAnalytics })}
                />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-ink-200 p-3">
                <span className="text-sm">الإعدادات السريعة في الأداة</span>
                <Switch
                  label="الإعدادات السريعة في الأداة"
                  checked={draft.quickPresets !== false}
                  onChange={(quickPresets) => update({ quickPresets })}
                />
              </div>
              <TextInput
                label="اختصار الفتح"
                value={draft.openShortcut ?? ""}
                error={fieldErrors.openShortcut}
                onChange={(e) => update({ openShortcut: e.target.value })}
              />
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-ink-600">
                  صفحات مستثناة (مسار في كل سطر، يدعم * و **)
                </span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-ink-300 px-3 py-2 text-sm"
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
                <p className="text-sm text-ink-500">لا توجد بيانات استخدام بعد.</p>
              )}
              {!!analytics?.total && (
                <>
                  <ul className="divide-y divide-ink-100 text-sm">
                    {Object.entries(analytics.byEvent).map(([event, count]) => (
                      <li key={event} className="flex justify-between py-2">
                        <span>{EVENT_LABELS[event] ?? event}</span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                  <h2 className="text-sm font-semibold">أكثر الخصائص استخداماً</h2>
                  <ul className="divide-y divide-ink-100 text-sm">
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
              <p className="text-xs text-ink-500">آخر 500 حدث، دون أي بيانات شخصية.</p>
            </div>
          )}

          {tab === "install" && (
            <div className="space-y-6">
              <CopyField label="الصق هذا السطر قبل وسم ‎</body>‎ في كل صفحات الموقع" value={embed} multiline />
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: "HTML", body: "الصق السطر في القالب المشترك قبل إغلاق body." },
                  { title: "WordPress", body: "من «المظهر ← محرر القوالب» أو إضافة لإدراج الأكواد في التذييل." },
                  { title: "Next.js / React", body: "أضفه في التخطيط الرئيسي عبر مكوّن Script باستراتيجية afterInteractive." },
                ].map((p) => (
                  <div key={p.title} className="rounded-xl border border-ink-200 p-3">
                    <div className="text-sm font-semibold" dir="ltr">{p.title}</div>
                    <p className="mt-1 text-xs text-ink-500">{p.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-ink-50 p-3 text-sm">
                {(analytics?.byEvent?.widget_init ?? 0) > 0 ? (
                  <Badge tone="success">الأداة تعمل على الموقع</Badge>
                ) : (
                  <Badge tone="warning">لم تصل أي زيارة بعد</Badge>
                )}
                <span className="text-ink-500">
                  تتحقق الحالة من أول تحميل للأداة على {site.domain}. افتح الموقع بعد التثبيت ثم أعد تحميل هذه الصفحة.
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="مفتاح الموقع" value={site.siteKey} />
                <CopyField label="عنوان الـ API" value={API_BASE} />
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {versions.length === 0 && (
                <p className="text-sm text-ink-500">لا توجد نسخ منشورة بعد.</p>
              )}
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-200 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {new Date(v.createdAt).toLocaleString("ar")}
                    </div>
                    <div className="text-xs text-ink-500">
                      {v.createdBy?.name || v.createdBy?.email || "—"}
                      {v.note ? ` · ${v.note}` : ""}
                    </div>
                    {published && JSON.stringify(v.config) === JSON.stringify(published) && (
                      <div className="mt-1">
                        <Badge tone="success">النسخة المنشورة حالياً</Badge>
                      </div>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" disabled={busy || readOnly} onClick={() => void restore(v.id)}>
                    استعادة للمسودة
                  </Button>
                </div>
              ))}
            </div>
          )}
          </div>
        </Card>

        <Card className="space-y-3 xl:sticky xl:top-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">معاينة حية</h2>
            <div className="flex items-center gap-2">
              <div role="group" aria-label="جهاز المعاينة" className="flex rounded-xl bg-ink-100 p-1">
                {([
                  { id: "desktop", label: "سطح المكتب", Icon: Monitor },
                  { id: "mobile", label: "الجوال", Icon: Smartphone },
                ] as const).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-pressed={previewDevice === id}
                    onClick={() => setPreviewDevice(id)}
                    className="grid h-8 w-9 place-items-center rounded-lg text-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand aria-pressed:bg-surface aria-pressed:text-ink-900 aria-pressed:shadow-card"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                lang={previewLang === "ar" ? "en" : "ar"}
                aria-label={previewLang === "ar" ? "معاينة بالإنجليزية" : "معاينة بالعربية"}
                onClick={() => setPreviewLang((l) => (l === "ar" ? "en" : "ar"))}
              >
                {previewLang === "ar" ? "EN" : "ع"}
              </Button>
            </div>
          </div>
          <div
            className="mx-auto overflow-hidden rounded-xl border border-ink-200 bg-ink-100"
            style={{
              width: previewDevice === "mobile" ? 375 : "100%",
              height: "min(640px, calc(100vh - 220px))",
            }}
          >
            <iframe
              ref={iframeRef}
              title="معاينة الودجت"
              src={PREVIEW_URL}
              className="h-full w-full bg-surface"
              onLoad={() => draft && pushPreview(draft)}
            />
          </div>
          <p className="text-xs text-ink-500">
            تتطلب المعاينة تشغيل خادم الودجت على {PREVIEW_ORIGIN}
          </p>
        </Card>
      </div>

      {!readOnly && (
        <div className="sticky bottom-4 z-20">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-surface/95 px-4 py-3 shadow-pop backdrop-blur">
            <div className="text-sm text-ink-600" aria-live="polite">
              {localDirty
                ? "لديك تعديلات غير محفوظة"
                : unpublished
                  ? `المسودة تختلف عن المنشور في: ${changes.join("، ") || "إعدادات أخرى"}`
                  : "كل التعديلات منشورة"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={paused ? "secondary" : "ghost"}
                size="sm"
                disabled={busy}
                onClick={() => setPending(paused ? "resume" : "pause")}
                className={paused ? "" : "text-danger"}
              >
                {paused ? "إعادة تشغيل الأداة" : "إيقاف طارئ"}
              </Button>
              <Button variant="ghost" size="sm" disabled={busy || !unpublished} onClick={() => setPending("discard")}>
                تجاهل التغييرات
              </Button>
              <Button variant="secondary" size="sm" disabled={busy || !localDirty} onClick={() => void saveDraft()}>
                حفظ المسودة
              </Button>
              <Button
                size="sm"
                disabled={busy || !unpublished}
                onClick={() => (invalid ? void publish() : setPending("publish"))}
              >
                نشر
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pending === "publish"}
        title="نشر الإعدادات على الموقع؟"
        confirmLabel="نشر الآن"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void publish()}
      >
        <p>يرى زوار {site.domain} التغييرات خلال دقائق. تستطيع استعادة أي نسخة سابقة من تبويب «السجل».</p>
        {changes.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 font-medium text-ink-800">ما الذي تغيّر:</div>
            <ul className="flex flex-wrap gap-1.5">
              {changes.map((c) => (
                <li key={c}>
                  <Badge tone="brand">{c}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ConfirmDialog>
      <ConfirmDialog
        open={pending === "discard"}
        title="تجاهل كل التعديلات؟"
        confirmLabel="تجاهل التعديلات"
        tone="danger"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void discard()}
      >
        تعود المسودة إلى النسخة المنشورة حالياً، ولا يمكن التراجع عن ذلك.
      </ConfirmDialog>
      <ConfirmDialog
        open={pending === "pause" || pending === "resume"}
        title={pending === "resume" ? "إعادة تشغيل الأداة؟" : "إيقاف الأداة فوراً؟"}
        confirmLabel={pending === "resume" ? "إعادة التشغيل" : "إيقاف الأداة"}
        tone={pending === "resume" ? "primary" : "danger"}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void killSwitch(pending === "resume")}
      >
        {pending === "resume"
          ? `تعود الأداة للظهور على ${site.domain}.`
          : `تختفي الأداة من ${site.domain} خلال دقائق دون انتظار النشر. استخدمه إذا سبّبت الأداة مشكلة في الموقع.`}
      </ConfirmDialog>
    </div>
  );
}
