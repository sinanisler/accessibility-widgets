import { describe, expect, it } from "vitest";
import {
  checkPrimaryContrast,
  contrastRatio,
  CURRENT_SCHEMA_VERSION,
  defaultFeatureEntries,
  mergeWidgetConfig,
  migrateWidgetConfig,
  pathMatches,
  readableOn,
  resolveFeatureList,
} from "./config.js";
import { activeCountLabel } from "./i18n.js";
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

describe("pathMatches edge cases", () => {
  it("treats a trailing /** as the directory itself too", () => {
    expect(pathMatches("/checkout", ["/checkout/**"])).toBe(true);
    expect(pathMatches("/checkoutx", ["/checkout/**"])).toBe(false);
  });

  it("ignores trailing slashes and treats ? literally", () => {
    expect(pathMatches("/admin/", ["/admin"])).toBe(true);
    expect(pathMatches("/", ["/"])).toBe(true);
    expect(pathMatches("/ab", ["/a?b"])).toBe(false);
  });
});

describe("mergeWidgetConfig with invalid input", () => {
  it("drops only the invalid field", () => {
    const cfg = mergeWidgetConfig({
      position: "top-left",
      colors: { primary: "#123456" },
      statementUrl: "h",
      buttonSize: 3,
    });
    expect(cfg.position).toBe("top-left");
    expect(cfg.colors?.primary).toBe("#123456");
    expect(cfg.statementUrl).toBe("");
    expect(cfg.buttonSize).toBe(56);
  });

  it("rejects values that could inject CSS or script", () => {
    const cfg = mergeWidgetConfig({
      colors: { background: "red}.fab{display:none}/*" },
      widgetWidth: "1px;}.panel{display:none}/*",
      statementUrl: "javascript:alert(1)",
    });
    expect(cfg.colors?.background).toBe("#FFFFFF");
    expect(cfg.widgetWidth).toBe("380px");
    expect(cfg.statementUrl).toBe("");
  });

  it("falls back to the default features when an entry is invalid", () => {
    const cfg = mergeWidgetConfig({
      position: "top-left",
      features: [{ id: "bigger-text", enabled: true, order: 0, defaultLevel: "<img>" }],
    });
    expect(cfg.position).toBe("top-left");
    expect(cfg.features?.length).toBe(V1_FEATURE_IDS.length);
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

  it("draws dark text on light primaries", () => {
    expect(readableOn("#2347C5")).toBe("#FFFFFF");
    expect(readableOn("#A3E635")).toBe("#111318");
  });
});

describe("logoUrl", () => {
  it("keeps https and raster data URLs", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    expect(mergeWidgetConfig({ logoUrl: png }).logoUrl).toBe(png);
    expect(mergeWidgetConfig({ logoUrl: "https://cdn.example.com/l.png" }).logoUrl).toBe(
      "https://cdn.example.com/l.png",
    );
  });

  it("drops SVG data URLs and plain http", () => {
    expect(mergeWidgetConfig({ logoUrl: "data:image/svg+xml;base64,PHN2Zz4=" }).logoUrl).toBe("");
    expect(mergeWidgetConfig({ logoUrl: "http://example.com/l.png" }).logoUrl).toBe("");
  });
});

describe("activeCountLabel", () => {
  it("uses Arabic dual and plural forms", () => {
    expect(activeCountLabel("ar", 1)).toBe("خاصية واحدة مفعّلة");
    expect(activeCountLabel("ar", 2)).toBe("خاصيتان مفعّلتان");
    expect(activeCountLabel("ar", 3)).toBe("3 خصائص مفعّلة");
    expect(activeCountLabel("ar", 11)).toBe("11 خاصية مفعّلة");
    expect(activeCountLabel("en", 1)).toBe("1 feature on");
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
