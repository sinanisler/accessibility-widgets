import { clsx } from "clsx";
import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  ComponentType,
  InputHTMLAttributes,
  KeyboardEvent,
  PropsWithChildren,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx("rounded-2xl border border-ink-200 bg-surface p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

function buttonClass(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-10 px-4 text-sm",
    variant === "primary" && "bg-brand text-brand-fg hover:bg-brand-hover",
    variant === "secondary" && "border border-ink-300 bg-surface text-ink-800 hover:bg-ink-50",
    variant === "ghost" && "bg-ink-100 text-ink-800 hover:bg-ink-200",
    variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
}) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; icon?: IconType }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
      {children}
    </Link>
  );
}

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

export function Badge({ tone = "neutral", children }: PropsWithChildren<{ tone?: Tone }>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "neutral" && "bg-ink-100 text-ink-700",
        tone === "brand" && "bg-brand-soft text-brand-ink",
        tone === "success" && "bg-success-soft text-success",
        tone === "warning" && "bg-warning-soft text-warning",
        tone === "danger" && "bg-danger-soft text-danger",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          tone === "neutral" && "bg-ink-400",
          tone === "brand" && "bg-brand",
          tone === "success" && "bg-emerald-600",
          tone === "warning" && "bg-amber-brand",
          tone === "danger" && "bg-red-600",
        )}
      />
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1">
        {back && (
          <Link href={back.href} className="text-sm font-medium text-brand hover:underline">
            → {back.label}
          </Link>
        )}
        <h1 className="break-words text-2xl font-bold text-ink-900">{title}</h1>
        {description && <p className="text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: PropsWithChildren<{ icon: IconType; title: string; action?: ReactNode }>) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-surface px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      {children && <div className="max-w-md text-sm text-ink-500">{children}</div>}
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: IconType;
}) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm text-ink-500">{label}</div>
        <div className="mt-1 text-3xl font-bold tabular-nums text-ink-900">{value}</div>
        {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
      </div>
      {Icon && (
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      )}
    </Card>
  );
}

const FIELD_CLASS =
  "w-full rounded-xl border border-ink-300 bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-danger">{message}</span>;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand" : "bg-ink-400",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all",
          checked ? "start-[1.375rem]" : "start-0.5",
        )}
      />
    </button>
  );
}

/** A labelled row holding a switch, the pattern every on/off setting uses. */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink-900">{label}</div>
        {description && <div className="text-xs text-ink-500">{description}</div>}
      </div>
      <Switch label={label} checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function TextInput({
  label,
  className,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={clsx("block text-sm", className)}>
      <span className="mb-1 block font-medium text-ink-600">{label}</span>
      <input
        className={clsx(FIELD_CLASS, error && "border-danger")}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      <FieldError message={error} />
    </label>
  );
}

export function SelectInput({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={clsx("block text-sm", className)}>
      <span className="mb-1 block font-medium text-ink-600">{label}</span>
      <select className={FIELD_CLASS} {...props}>
        {children}
      </select>
    </label>
  );
}

export function ColorInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink-600">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`منتقي ${label}`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer rounded-lg border border-ink-300 bg-surface p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          aria-invalid={error ? true : undefined}
          className={clsx(FIELD_CLASS, "font-mono", error && "border-danger")}
        />
      </div>
      <FieldError message={error} />
    </label>
  );
}

export const tabId = (id: string) => `tab-${id}`;
export const TAB_PANEL_ID = "tab-panel";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: IconType }[];
  active: string;
  onChange: (id: string) => void;
}) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    // The list runs right to left, so the left arrow moves forward.
    const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length]!;
    onChange(next.id);
    document.getElementById(tabId(next.id))?.focus();
  }

  return (
    <div
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-ink-200 px-1"
      role="tablist"
      aria-label="أقسام الإعدادات"
      onKeyDown={onKeyDown}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          id={tabId(id)}
          type="button"
          role="tab"
          aria-selected={active === id}
          aria-controls={TAB_PANEL_ID}
          tabIndex={active === id ? 0 : -1}
          className={clsx(
            "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
            active === id
              ? "border-brand text-brand"
              : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800",
          )}
          onClick={() => onChange(id)}
        >
          {Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}
