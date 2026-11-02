import { describe, expect, it } from "vitest";
import {
  checkPrimaryContrast,
  contrastRatio,
  CURRENT_SCHEMA_VERSION,
  defaultFeatureEntries,
  mergeWidgetConfig,
  migrateWidgetConfig,
  pathMatches,
  resolveFeatureList,
} from "./config.js";
import { FEATURE_CATALOG, V1_FEATURE_IDS } from "./features.js";

describe("mergeWidgetConfig", () => {
  it("defaults to Arabic RTL-first language", () => {
    const cfg = mergeWidgetConfig();
    expect(cfg.language).toBe("ar");
    expect(cfg.position).toBe("bottom-right");
    expect(cfg.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(cfg.enabled).toBe(true);
  });

  it("merges custom colors", () => {
    const cfg = mergeWidgetConfig({ colors: { primary: "#123456" } });
    expect(cfg.colors?.primary).toBe("#123456");
    expect(cfg.colors?.background).toBe("#FFFFFF");
  });

  it("includes default v1 feature entries", () => {
    const cfg = mergeWidgetConfig();
    expect(cfg.features?.length).toBe(V1_FEATURE_IDS.length);
    expect(cfg.features?.every((f) => f.enabled)).toBe(true);
  });

  it("applies offset and shortcut defaults", () => {
    const cfg = mergeWidgetConfig();
    expect(cfg.offset).toEqual({ x: 20, y: 20 });
    expect(cfg.openShortcut).toBe("Alt+A");
  });
});

describe("migrateWidgetConfig", () => {
  it("migrates enabledFeatures/disabledFeatures to features entries", () => {
    const migrated = migrateWidgetConfig({
      language: "en",
      enabledFeatures: ["bigger-text", "high-contrast"],
      disabledFeatures: ["reading-guide"],
    });
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.defaultLanguage).toBe("en");
    const bigger = migrated.features?.find((f) => f.id === "bigger-text");
    const guide = migrated.features?.find((f) => f.id === "reading-guide");
    const spacing = migrated.features?.find((f) => f.id === "text-spacing");
    expect(bigger?.enabled).toBe(true);
    expect(guide?.enabled).toBe(false);
    expect(spacing?.enabled).toBe(false);
  });

  it("keeps unknown feature ids out of the list", () => {
    const migrated = migrateWidgetConfig({
      schemaVersion: 2,
      features: [
        { id: "bigger-text", enabled: true, order: 0 },
        { id: "screen-reader", enabled: true, order: 1 },
      ],
    });
    expect(migrated.features?.some((f) => f.id === "screen-reader")).toBe(false);
    expect(migrated.features?.find((f) => f.id === "bigger-text")?.enabled).toBe(true);
  });
});

describe("pathMatches", () => {
  it("matches exact and wildcard paths", () => {
    expect(pathMatches("/admin", ["/admin"])).toBe(true);
    expect(pathMatches("/admin/users", ["/admin/*"])).toBe(true);
    expect(pathMatches("/checkout/pay", ["/checkout/**"])).toBe(true);
    expect(pathMatches("/home", ["/admin"])).toBe(false);
    expect(pathMatches("/x", [])).toBe(false);
  });
});

describe("contrastRatio", () => {
  it("detects poor primary contrast", () => {
    expect(contrastRatio("#FFFFFF", "#FFFF00")).toBeLessThan(4.5);
    const check = checkPrimaryContrast({ primary: "#FFFF00" });
    expect(check.passesAa).toBe(false);
    expect(check.warning).toBeTruthy();
  });

  it("passes for brand blue on white text", () => {
    const check = checkPrimaryContrast({ primary: "#0B5FFF" });
    expect(check.passesAa).toBe(true);
  });
});

describe("resolveFeatureList", () => {
  it("returns only enabled features sorted by order", () => {
    const features = defaultFeatureEntries().map((f, i) => ({
      ...f,
      enabled: i < 3,
      order: 10 - i,
    }));
    const list = resolveFeatureList(mergeWidgetConfig({ features }));
    expect(list.length).toBe(3);
    expect(list[0]!.order).toBeLessThanOrEqual(list[1]!.order);
  });
});

describe("FEATURE_CATALOG", () => {
  it("contains 40+ features", () => {
    expect(FEATURE_CATALOG.length).toBeGreaterThanOrEqual(40);
  });
});
