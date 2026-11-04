import { z } from "zod";
import { AVAILABLE_FEATURE_IDS, FEATURE_CATALOG, isOptionalFeature } from "./features.js";
import type {
  ContrastCheckResult,
  FeatureConfigEntry,
  FeatureLevel,
  WidgetConfig,
  WidgetPosition,
} from "./types.js";

export const CURRENT_SCHEMA_VERSION = 2;

const positionSchema = z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]);

// Levels, colors, and sizes end up inside generated CSS, so every free-form value is restricted.
const featureLevelSchema = z.union([
  z.string().regex(/^[\w.-]{1,32}$/),
  z.number(),
  z.boolean(),
]);

const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

const webUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "Only http(s) URLs are allowed");

// Data URLs are limited to raster types: the dashboard re-encodes uploads as PNG, and SVG could carry markup.
const logoUrlSchema = z.union([
  webUrlSchema.refine((value) => /^https:\/\//i.test(value), "Logos must use https"),
  z
    .string()
    .max(96 * 1024)
    .regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/),
  z.literal(""),
]);

export const featureConfigEntrySchema = z.object({
  id: z.string().max(64),
  enabled: z.boolean(),
  order: z.number().int().nonnegative(),
  defaultLevel: featureLevelSchema.nullable().optional(),
  allowedLevels: z.array(featureLevelSchema).optional(),
});

export const widgetConfigSchema = z.object({
  schemaVersion: z.number().int().positive().optional(),
  siteKey: z.string().max(128).optional(),
  apiBaseUrl: webUrlSchema.optional(),
  language: z.string().regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$/).optional(),
  defaultLanguage: z.string().regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$/).optional(),
  autoDetectLanguage: z.boolean().optional(),
  position: positionSchema.optional(),
  widgetWidth: z.string().regex(/^\d{1,4}(?:\.\d+)?(?:px|rem|em|vw|%)$/).optional(),
  colors: z
    .object({
      primary: hexColorSchema.optional(),
      background: hexColorSchema.optional(),
      text: hexColorSchema.optional(),
      accent: hexColorSchema.optional(),
    })
    .optional(),
  enabledFeatures: z.array(z.string()).optional(),
  disabledFeatures: z.array(z.string()).optional(),
  features: z.array(featureConfigEntrySchema).optional(),
  offset: z
    .object({
      x: z.number().min(0).max(400),
      y: z.number().min(0).max(400),
    })
    .optional(),
  buttonSize: z.number().min(40).max(96).optional(),
  buttonIcon: z.enum(["person", "a11y", "eye", "text"]).optional(),
  buttonShape: z.enum(["circle", "square", "pill"]).optional(),
  logoUrl: logoUrlSchema.optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  mobile: z
    .object({
      position: positionSchema.optional(),
      hide: z.boolean().optional(),
    })
    .optional(),
  radius: z.number().min(0).max(32).optional(),
  labels: z.record(z.record(z.string().max(200))).optional(),
  statementUrl: webUrlSchema.or(z.literal("")).optional(),
  enabled: z.boolean().optional(),
  excludedPaths: z.array(z.string().max(256)).max(100).optional(),
  persistPreferences: z.boolean().optional(),
  enableAnalytics: z.boolean().optional(),
  enableCloudTts: z.boolean().optional(),
  openShortcut: z.string().regex(/^[\w+\s/-]{1,32}$/).optional(),
  quickPresets: z.boolean().optional(),
});

export function defaultFeatureEntries(): FeatureConfigEntry[] {
  return AVAILABLE_FEATURE_IDS.map((id, order) => {
    const catalog = FEATURE_CATALOG.find((f) => f.id === id);
    return {
      id,
      enabled: !isOptionalFeature(id),
      order,
      defaultLevel: null,
      allowedLevels: catalog?.levels ? [...catalog.levels] : [true],
    };
  });
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  siteKey: undefined,
  apiBaseUrl: undefined,
  language: "ar",
  defaultLanguage: "ar",
  autoDetectLanguage: false,
  position: "bottom-right",
  widgetWidth: "380px",
  colors: {
    primary: "#2347C5",
    background: "#FFFFFF",
    text: "#141821",
    accent: "#F2A900",
  },
  enabledFeatures: undefined,
  disabledFeatures: undefined,
  features: defaultFeatureEntries(),
  offset: { x: 20, y: 20 },
  buttonSize: 56,
  buttonIcon: "person",
  buttonShape: "circle",
  logoUrl: "",
  theme: "light",
  mobile: { hide: false },
  radius: 16,
  labels: {},
  statementUrl: "",
  enabled: true,
  excludedPaths: [],
  persistPreferences: true,
  enableAnalytics: true,
  enableCloudTts: false,
  openShortcut: "Alt+A",
  quickPresets: true,
};

function parseHexColor(input: string): { r: number; g: number; b: number } | null {
  const raw = input.trim();
  const short = /^#([0-9a-fA-F]{3})$/.exec(raw);
  const long = /^#([0-9a-fA-F]{6})$/.exec(raw);
  if (short) {
    const [r, g, b] = short[1]!.split("").map((c) => parseInt(c + c, 16));
    return { r: r!, g: g!, b: b! };
  }
  if (long) {
    return {
      r: parseInt(long[1]!.slice(0, 2), 16),
      g: parseInt(long[1]!.slice(2, 4), 16),
      b: parseInt(long[1]!.slice(4, 6), 16),
    };
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colors. Returns null if either color is not parseable. */
export function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!fg || !bg) return null;
  const L1 = relativeLuminance(fg.r, fg.g, fg.b);
  const L2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const LIGHT_ON = "#FFFFFF";
const DARK_ON = "#111318";

/** White or near-black, whichever reads better on `background`. */
export function readableOn(background: string): string {
  const light = contrastRatio(LIGHT_ON, background) ?? 0;
  const dark = contrastRatio(DARK_ON, background) ?? 0;
  return light >= dark ? LIGHT_ON : DARK_ON;
}

export function checkPrimaryContrast(colors?: Partial<WidgetConfig["colors"]>): ContrastCheckResult {
  const primary = colors?.primary ?? DEFAULT_WIDGET_CONFIG.colors!.primary!;
  const textColor = readableOn(primary);
  const ratio = contrastRatio(textColor, primary) ?? 0;
  const buttonRatio = contrastRatio(primary, "#FFFFFF") ?? 0;
  const passesAa = ratio >= 4.5 && buttonRatio >= 3;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    ratio: round(ratio),
    buttonRatio: round(buttonRatio),
    textColor,
    passesAa,
    warning: passesAa
      ? undefined
      : ratio < 4.5
        ? `Text on the primary color is ${ratio.toFixed(2)}:1 (needs ≥ 4.5:1)`
        : `The button is ${buttonRatio.toFixed(2)}:1 against a white page (needs ≥ 3:1)`,
  };
}

function stripTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") || "/" : path;
}

/** Match pathname against glob-like patterns (`*` = any segment chars, `**` = any path). */
export function pathMatches(pathname: string, patterns: string[] | undefined): boolean {
  if (!patterns?.length) return false;
  const path = stripTrailingSlash(pathname.startsWith("/") ? pathname : `/${pathname}`);
  return patterns.some((pattern) => {
    const p = stripTrailingSlash(pattern.startsWith("/") ? pattern : `/${pattern}`);
    const escaped = p
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\/\*\*$/, "§/")
      .replace(/\*\*/g, "§§")
      .replace(/\*/g, "[^/]*")
      .replace(/§§/g, ".*")
      .replace(/§\/$/, "(?:/.*)?");
    return new RegExp(`^${escaped}$`).test(path);
  });
}

export function migrateWidgetConfig(raw: unknown): Partial<WidgetConfig> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const version = typeof input.schemaVersion === "number" ? input.schemaVersion : 1;

  const next: Partial<WidgetConfig> = { ...input } as Partial<WidgetConfig>;

  if (version < 2) {
    const enabled = Array.isArray(input.enabledFeatures)
      ? (input.enabledFeatures as string[])
      : undefined;
    const disabled = Array.isArray(input.disabledFeatures)
      ? (input.disabledFeatures as string[])
      : undefined;

    if (!Array.isArray(input.features)) {
      next.features = defaultFeatureEntries().map((entry) => {
        let isEnabled = entry.enabled;
        if (enabled?.length) isEnabled = enabled.includes(entry.id);
        if (disabled?.includes(entry.id)) isEnabled = false;
        return { ...entry, enabled: isEnabled };
      });
    }

    if (!next.defaultLanguage && typeof input.language === "string") {
      next.defaultLanguage = input.language;
    }
    next.schemaVersion = CURRENT_SCHEMA_VERSION;
  }

  // Always clamp features to shipped IDs and fill missing ones; optional features arrive switched off
  if (next.features) {
    const byId = new Map(next.features.map((f) => [f.id, f]));
    next.features = defaultFeatureEntries().map((def) => {
      const existing = byId.get(def.id);
      if (!existing) return def;
      return {
        ...def,
        ...existing,
        id: def.id,
        allowedLevels: existing.allowedLevels?.length ? existing.allowedLevels : def.allowedLevels,
      };
    });
  }

  return next;
}

export function resolveFeatureList(config: WidgetConfig): FeatureConfigEntry[] {
  const features = config.features?.length ? config.features : defaultFeatureEntries();
  return [...features]
    .filter((f) => (AVAILABLE_FEATURE_IDS as readonly string[]).includes(f.id) && f.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getAllowedLevels(config: WidgetConfig, featureId: string): FeatureLevel[] {
  const entry = config.features?.find((f) => f.id === featureId);
  if (entry?.allowedLevels?.length) return entry.allowedLevels;
  const catalog = FEATURE_CATALOG.find((f) => f.id === featureId);
  return catalog?.levels ? [...catalog.levels] : [true];
}

function removeInvalidField(target: Record<string, unknown>, path: (string | number)[]): void {
  let node: unknown = target;
  for (let depth = 0; depth < path.length; depth += 1) {
    if (Array.isArray(node)) {
      // Array entries cannot be removed in place, so the whole field falls back to its default.
      delete target[String(path[0])];
      return;
    }
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    const key = String(path[depth]);
    if (depth === path.length - 1) delete record[key];
    else node = record[key];
  }
}

/** Parse a config, dropping only the fields that fail so one bad value cannot reset the rest. */
function parseLeniently(input: Partial<WidgetConfig>): z.infer<typeof widgetConfigSchema> {
  let candidate = JSON.parse(JSON.stringify(input)) as Record<string, unknown>;
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const parsed = widgetConfigSchema.safeParse(candidate);
    if (parsed.success) return parsed.data;
    for (const issue of parsed.error.issues) {
      if (!issue.path.length) return {};
      removeInvalidField(candidate, issue.path);
    }
    candidate = JSON.parse(JSON.stringify(candidate)) as Record<string, unknown>;
  }
  return {};
}

export function mergeWidgetConfig(user?: Partial<WidgetConfig>): WidgetConfig {
  const safe = parseLeniently(migrateWidgetConfig(user ?? {}));

  const language = safe.language ?? safe.defaultLanguage ?? DEFAULT_WIDGET_CONFIG.language;

  return {
    ...DEFAULT_WIDGET_CONFIG,
    ...safe,
    language,
    defaultLanguage: safe.defaultLanguage ?? language,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    colors: {
      ...DEFAULT_WIDGET_CONFIG.colors,
      ...(safe.colors ?? {}),
    },
    offset: {
      ...DEFAULT_WIDGET_CONFIG.offset!,
      ...(safe.offset ?? {}),
    },
    mobile: {
      ...DEFAULT_WIDGET_CONFIG.mobile,
      ...(safe.mobile ?? {}),
    },
    features: safe.features?.length
      ? migrateWidgetConfig({ ...safe, schemaVersion: CURRENT_SCHEMA_VERSION }).features
      : defaultFeatureEntries(),
    labels: safe.labels ?? {},
    excludedPaths: safe.excludedPaths ?? [],
  };
}

export function isValidPosition(value: string): value is WidgetPosition {
  return positionSchema.safeParse(value).success;
}
