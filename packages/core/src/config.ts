import { z } from "zod";
import { V1_FEATURE_IDS, FEATURE_CATALOG } from "./features.js";
import type {
  ContrastCheckResult,
  FeatureConfigEntry,
  FeatureLevel,
  WidgetConfig,
  WidgetPosition,
} from "./types.js";

export const CURRENT_SCHEMA_VERSION = 2;

const positionSchema = z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]);

const featureLevelSchema = z.union([z.string(), z.number(), z.boolean()]);

export const featureConfigEntrySchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  order: z.number().int().nonnegative(),
  defaultLevel: featureLevelSchema.nullable().optional(),
  allowedLevels: z.array(featureLevelSchema).optional(),
});

export const widgetConfigSchema = z.object({
  schemaVersion: z.number().int().positive().optional(),
  siteKey: z.string().optional(),
  apiBaseUrl: z.string().url().optional(),
  language: z.string().optional(),
  defaultLanguage: z.string().optional(),
  autoDetectLanguage: z.boolean().optional(),
  position: positionSchema.optional(),
  widgetWidth: z.string().optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional(),
  enabledFeatures: z.array(z.string()).optional(),
  disabledFeatures: z.array(z.string()).optional(),
  features: z.array(featureConfigEntrySchema).optional(),
  offset: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  buttonSize: z.number().min(40).max(96).optional(),
  buttonIcon: z.enum(["person", "a11y", "eye", "text"]).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  mobile: z
    .object({
      position: positionSchema.optional(),
      hide: z.boolean().optional(),
    })
    .optional(),
  radius: z.number().min(0).max(32).optional(),
  labels: z.record(z.record(z.string())).optional(),
  statementUrl: z.string().url().or(z.literal("")).optional(),
  enabled: z.boolean().optional(),
  excludedPaths: z.array(z.string()).optional(),
  persistPreferences: z.boolean().optional(),
  enableAnalytics: z.boolean().optional(),
  enableCloudTts: z.boolean().optional(),
  openShortcut: z.string().optional(),
});

export function defaultFeatureEntries(): FeatureConfigEntry[] {
  return V1_FEATURE_IDS.map((id, order) => {
    const catalog = FEATURE_CATALOG.find((f) => f.id === id);
    return {
      id,
      enabled: true,
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
    primary: "#0B5FFF",
    background: "#FFFFFF",
    text: "#111827",
    accent: "#10B981",
  },
  enabledFeatures: undefined,
  disabledFeatures: undefined,
  features: defaultFeatureEntries(),
  offset: { x: 20, y: 20 },
  buttonSize: 56,
  buttonIcon: "person",
  theme: "light",
  mobile: { position: "bottom-right", hide: false },
  radius: 16,
  labels: {},
  statementUrl: "",
  enabled: true,
  excludedPaths: [],
  persistPreferences: true,
  enableAnalytics: true,
  enableCloudTts: false,
  openShortcut: "Alt+A",
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

export function checkPrimaryContrast(colors?: Partial<WidgetConfig["colors"]>): ContrastCheckResult {
  const primary = colors?.primary ?? DEFAULT_WIDGET_CONFIG.colors!.primary!;
  const onPrimary = "#FFFFFF";
  const ratio = contrastRatio(onPrimary, primary) ?? 0;
  const passesAa = ratio >= 4.5;
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAa,
    warning: passesAa
      ? undefined
      : `Primary color contrast with white text is ${ratio.toFixed(2)}:1 (needs ≥ 4.5:1)`,
  };
}

/** Match pathname against glob-like patterns (`*` = any segment chars, `**` = any path). */
export function pathMatches(pathname: string, patterns: string[] | undefined): boolean {
  if (!patterns?.length) return false;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return patterns.some((pattern) => {
    const p = pattern.startsWith("/") ? pattern : `/${pattern}`;
    const escaped = p
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "§§")
      .replace(/\*/g, "[^/]*")
      .replace(/§§/g, ".*");
    return new RegExp(`^${escaped}$`).test(path);
  });
}

export function migrateWidgetConfig(raw: unknown): Partial<WidgetConfig> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const version = typeof input.schemaVersion === "number" ? input.schemaVersion : 1;

  let next: Partial<WidgetConfig> = { ...input } as Partial<WidgetConfig>;

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

  // Always clamp features to known V1 IDs and fill missing ones
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
    .filter((f) => (V1_FEATURE_IDS as readonly string[]).includes(f.id) && f.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getAllowedLevels(config: WidgetConfig, featureId: string): FeatureLevel[] {
  const entry = config.features?.find((f) => f.id === featureId);
  if (entry?.allowedLevels?.length) return entry.allowedLevels;
  const catalog = FEATURE_CATALOG.find((f) => f.id === featureId);
  return catalog?.levels ? [...catalog.levels] : [true];
}

export function mergeWidgetConfig(user?: Partial<WidgetConfig>): WidgetConfig {
  const migrated = migrateWidgetConfig(user ?? {});
  const parsed = widgetConfigSchema.safeParse(migrated);
  const safe = parsed.success ? parsed.data : {};

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
