"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { clsx } from "clsx";
import { Accessibility, Eye, ImageUp, PersonStanding, Type } from "lucide-react";
import { checkPrimaryContrast, readableOn, type WidgetConfig, type WidgetPosition } from "@a11y/core";
import { Button, ColorInput, SelectInput, Switch, TextInput } from "@/components/ui";

const PRIMARY_SWATCHES = [
  { value: "#2347C5", name: "أزرق" },
  { value: "#0F766E", name: "أخضر مزرق" },
  { value: "#15803D", name: "أخضر" },
  { value: "#9F1239", name: "عنابي" },
  { value: "#6D28D9", name: "بنفسجي" },
  { value: "#1F2937", name: "فحمي" },
];

const ACCENT_SWATCHES = [
  { value: "#F2A900", name: "كهرماني" },
  { value: "#FB7185", name: "وردي" },
  { value: "#22D3EE", name: "سماوي" },
  { value: "#A3E635", name: "ليموني" },
];

const CORNERS: { value: WidgetPosition; label: string; className: string }[] = [
  { value: "top-right", label: "أعلى اليمين", className: "top-7 right-2" },
  { value: "top-left", label: "أعلى اليسار", className: "top-7 left-2" },
  { value: "bottom-right", label: "أسفل اليمين", className: "bottom-2 right-2" },
  { value: "bottom-left", label: "أسفل اليسار", className: "bottom-2 left-2" },
];

const ICONS = [
  { value: "person", label: "شخص", Icon: PersonStanding },
  { value: "a11y", label: "رمز الوصول", Icon: Accessibility },
  { value: "eye", label: "عين", Icon: Eye },
  { value: "text", label: "حروف", Icon: Type },
] as const;

const SHAPES = [
  { value: "circle", label: "دائري" },
  { value: "square", label: "مربّع" },
  { value: "pill", label: "مع نص" },
] as const;

/** Numeric fields may be empty while typing; empty means "use the default". */
function numberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

const LOGO_MAX_BYTES = 1024 * 1024;
const LOGO_PX = 128;

/** Re-encodes any upload as a small PNG so the stored config stays light and never carries SVG markup. */
function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const w = img.naturalWidth || LOGO_PX;
        const h = img.naturalHeight || LOGO_PX;
        const scale = Math.min(1, LOGO_PX / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-ink-200 pb-6 last:border-0 last:pb-0">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Swatches({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; name: string }[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((s) => (
        <button
          key={s.value}
          type="button"
          aria-label={s.name}
          aria-pressed={value?.toUpperCase() === s.value}
          onClick={() => onChange(s.value)}
          className="h-8 w-8 rounded-full ring-1 ring-inset ring-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand aria-pressed:ring-2 aria-pressed:ring-ink-900 aria-pressed:ring-offset-2 aria-pressed:ring-offset-surface"
          style={{ background: s.value }}
        />
      ))}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1 text-sm">
      <span className="block text-ink-600">{label}</span>
      <div role="group" aria-label={label} className="flex rounded-xl border border-ink-300 bg-ink-50 p-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={value === item.value}
            onClick={() => onChange(item.value)}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm text-ink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand aria-pressed:bg-ink-900 aria-pressed:font-semibold aria-pressed:text-ink-50"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CornerPicker({ value, onChange }: { value: WidgetPosition; onChange: (v: WidgetPosition) => void }) {
  return (
    <div className="space-y-1 text-sm">
      <span id="corner-label" className="block text-ink-600">زاوية الشاشة</span>
      <div
        role="group"
        aria-labelledby="corner-label"
        className="relative aspect-[16/10] w-full max-w-[15rem] rounded-xl border-2 border-ink-200 bg-ink-50"
        dir="ltr"
      >
        <div className="absolute inset-x-2.5 top-2.5 h-2.5 rounded bg-ink-200" aria-hidden="true" />
        {CORNERS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-label={c.label}
            aria-pressed={value === c.value}
            onClick={() => onChange(c.value)}
            className={clsx(
              "absolute grid h-9 w-9 place-items-center rounded-full border-2 border-dashed border-ink-300 bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              "aria-pressed:border-solid aria-pressed:border-brand aria-pressed:bg-brand",
              c.className,
            )}
          >
            <span className={clsx("h-3 w-3 rounded-full", value === c.value ? "bg-brand-fg" : "bg-ink-300")} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function LookPanel({
  draft,
  update,
  fieldErrors,
}: {
  draft: WidgetConfig;
  update: (partial: Partial<WidgetConfig>) => void;
  fieldErrors: Record<string, string>;
}) {
  const [logoError, setLogoError] = useState("");
  const primary = draft.colors?.primary ?? "#2347C5";
  const contrast = checkPrimaryContrast(draft.colors);
  const position = draft.position || "bottom-right";
  const edge = position.startsWith("top") ? "العلوية" : "السفلية";
  const iconColor = /^#[0-9a-fA-F]{6}$/.test(primary) ? readableOn(primary) : "#FFFFFF";

  async function onLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setLogoError("");
    if (!file) return;
    if (!/^image\/(png|svg\+xml|jpeg|webp)$/.test(file.type)) {
      setLogoError("الملف ليس صورة مدعومة. استخدم PNG أو SVG أو JPG أو WebP.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError("حجم الملف أكبر من 1 ميجابايت. صغّر الصورة ثم ارفعها مرة أخرى.");
      return;
    }
    try {
      update({ logoUrl: await readLogo(file) });
    } catch {
      setLogoError("تعذّرت قراءة الصورة. جرّب ملفاً آخر.");
    }
  }

  return (
    <div className="space-y-6">
      <Section title="الألوان">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <ColorInput
              label="اللون الأساسي"
              value={draft.colors?.primary ?? ""}
              error={fieldErrors["colors.primary"]}
              onChange={(value) => update({ colors: { ...draft.colors, primary: value } })}
            />
            <Swatches
              label="ألوان جاهزة"
              items={PRIMARY_SWATCHES}
              value={draft.colors?.primary}
              onChange={(value) => update({ colors: { ...draft.colors, primary: value } })}
            />
            <ul className="space-y-0.5 text-xs" aria-live="polite">
              <li className={contrast.ratio >= 4.5 ? "text-success" : "text-danger"}>
                النص على اللون: {contrast.ratio}:1 {contrast.ratio >= 4.5 ? "— مطابق AA" : "— المطلوب 4.5:1"}
              </li>
              <li className={contrast.buttonRatio >= 3 ? "text-success" : "text-danger"}>
                الزر على صفحة فاتحة: {contrast.buttonRatio}:1{" "}
                {contrast.buttonRatio >= 3 ? "— واضح" : "— المطلوب 3:1 حتى يظهر الزر"}
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <ColorInput
              label="لون الحالة المفعّلة"
              value={draft.colors?.accent ?? ""}
              error={fieldErrors["colors.accent"]}
              onChange={(value) => update({ colors: { ...draft.colors, accent: value } })}
            />
            <Swatches
              label="ألوان جاهزة للحالة المفعّلة"
              items={ACCENT_SWATCHES}
              value={draft.colors?.accent}
              onChange={(value) => update({ colors: { ...draft.colors, accent: value } })}
            />
            <p className="text-xs text-ink-500">يظهر في عدّاد الزر والحلقة حوله ونقاط المستوى.</p>
          </div>
          <ColorInput
            label="خلفية اللوحة"
            value={draft.colors?.background ?? ""}
            error={fieldErrors["colors.background"]}
            onChange={(value) => update({ colors: { ...draft.colors, background: value } })}
          />
          <ColorInput
            label="نص اللوحة"
            value={draft.colors?.text ?? ""}
            error={fieldErrors["colors.text"]}
            onChange={(value) => update({ colors: { ...draft.colors, text: value } })}
          />
        </div>
        <Segmented
          label="مظهر اللوحة"
          items={[
            { value: "light", label: "فاتح" },
            { value: "dark", label: "داكن" },
            { value: "auto", label: "حسب جهاز الزائر" },
          ]}
          value={draft.theme || "light"}
          onChange={(theme) => update({ theme })}
        />
      </Section>

      <Section title="المكان">
        <div className="grid gap-4 sm:grid-cols-2">
          <CornerPicker value={position} onChange={(value) => update({ position: value })} />
          <div className="space-y-3">
            <TextInput
              label="البعد عن الحافة الجانبية (px)"
              type="number"
              min={0}
              max={400}
              value={draft.offset?.x ?? 20}
              error={fieldErrors["offset.x"]}
              onChange={(e) => update({ offset: { x: Number(e.target.value), y: draft.offset?.y ?? 20 } })}
            />
            <TextInput
              label={`البعد عن الحافة ${edge} (px)`}
              type="number"
              min={0}
              max={400}
              value={draft.offset?.y ?? 20}
              error={fieldErrors["offset.y"]}
              onChange={(e) => update({ offset: { x: draft.offset?.x ?? 20, y: Number(e.target.value) } })}
            />
          </div>
          <SelectInput
            label="الزاوية على الجوال"
            value={draft.mobile?.position || position}
            onChange={(e) =>
              update({ mobile: { ...draft.mobile, position: e.target.value as WidgetPosition } })
            }
          >
            {CORNERS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectInput>
          <div className="flex items-center justify-between gap-2 self-end rounded-xl border border-ink-200 p-3">
            <span className="text-sm">إخفاء على الجوال</span>
            <Switch
              label="إخفاء على الجوال"
              checked={!!draft.mobile?.hide}
              onChange={(hide) => update({ mobile: { ...draft.mobile, hide } })}
            />
          </div>
        </div>
      </Section>

      <Section title="الشعار والزر">
        <div className="space-y-1 text-sm">
          <span id="icon-label" className="block text-ink-600">أيقونة الزر</span>
          <div role="group" aria-labelledby="icon-label" className="flex flex-wrap gap-2">
            {ICONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={!draft.logoUrl && (draft.buttonIcon || "person") === value}
                onClick={() => update({ buttonIcon: value, logoUrl: "" })}
                className="grid h-12 w-12 place-items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-pressed:ring-2 aria-pressed:ring-ink-900 aria-pressed:ring-offset-2 aria-pressed:ring-offset-surface"
                style={{ background: primary, color: iconColor }}
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
              </button>
            ))}
            {draft.logoUrl && (
              <span
                aria-label="شعارك (مختار)"
                role="img"
                className="grid h-12 w-12 place-items-center rounded-xl ring-2 ring-ink-900 ring-offset-2 ring-offset-surface"
                style={{ background: primary }}
              >
                <img src={draft.logoUrl} alt="" className="h-7 w-7 object-contain" />
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="logo-file"
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="peer sr-only"
              onChange={(e) => void onLogo(e)}
            />
            <label
              htmlFor="logo-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink-400 px-4 py-2 text-sm font-semibold hover:bg-ink-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
            >
              <ImageUp aria-hidden="true" className="h-4 w-4" />
              {draft.logoUrl ? "استبدال الشعار" : "ارفع شعارك"}
            </label>
            {draft.logoUrl && (
              <Button variant="ghost" type="button" onClick={() => update({ logoUrl: "" })}>
                حذف الشعار
              </Button>
            )}
          </div>
          <p className="text-xs text-ink-500">
            PNG أو SVG بخلفية شفافة، حتى 1 ميجابايت. يُصغَّر إلى 128 بكسل ويظهر على اللون الأساسي، فالأفضل شعار بلون واحد.
          </p>
          {(logoError || fieldErrors.logoUrl) && (
            <p role="alert" className="text-xs text-danger">
              {logoError || "الشعار غير صالح. ارفع صورة جديدة."}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Segmented
            label="شكل الزر"
            items={SHAPES}
            value={draft.buttonShape || "circle"}
            onChange={(buttonShape) => update({ buttonShape })}
          />
          <TextInput
            label="حجم الزر (px)"
            type="number"
            min={44}
            max={96}
            value={draft.buttonSize ?? ""}
            error={fieldErrors.buttonSize}
            onChange={(e) =>
              update({ buttonSize: numberOrUndefined(e.target.value) })
            }
          />
        </div>
      </Section>

      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-ink-700">إعدادات متقدمة للوحة</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextInput
            label="عرض اللوحة"
            value={draft.widgetWidth ?? ""}
            error={fieldErrors.widgetWidth}
            onChange={(e) => update({ widgetWidth: e.target.value })}
          />
          <TextInput
            label="استدارة الزوايا (px)"
            type="number"
            value={draft.radius ?? ""}
            error={fieldErrors.radius}
            onChange={(e) =>
              update({ radius: numberOrUndefined(e.target.value) })
            }
          />
        </div>
      </details>
    </div>
  );
}
