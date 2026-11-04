import { describe, expect, it, beforeEach } from "vitest";
import { mergeWidgetConfig } from "@a11y/core";
import { AccessibilityStore } from "../state/store.js";
import { createPanel } from "./panel.js";
import type { FeatureModule } from "../features/types.js";

const features: FeatureModule[] = [
  {
    id: "bigger-text",
    category: "visual",
    labelKey: "biggerText",
    levels: ["medium", "large", "xlarge"],
    apply: () => undefined,
  },
  {
    id: "high-contrast",
    category: "visual",
    labelKey: "highContrast",
    levels: ["medium", "high"],
    apply: () => undefined,
  },
  {
    id: "highlight-links",
    category: "visual",
    labelKey: "highlightLinks",
    levels: [true],
    apply: () => undefined,
  },
];

function mount(config = {}) {
  const store = new AccessibilityStore(mergeWidgetConfig({ language: "ar", ...config }));
  const panel = createPanel(store, features, () => undefined);
  document.body.appendChild(panel.host);
  const root = panel.host.shadowRoot!;
  const tile = (id: string) => root.querySelector<HTMLButtonElement>(`.tile[data-id="${id}"]`)!;
  return { store, panel, root, tile };
}

describe("createPanel", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
  });

  it("opens and closes the dialog with one tile per feature", () => {
    const { panel, root } = mount();
    panel.open();
    const dialog = root.querySelector(".panel") as HTMLElement;
    expect(dialog.hidden).toBe(false);
    expect(root.querySelectorAll(".tile").length).toBe(3);
    expect(root.querySelector("#a11y-title")).toBeTruthy();
    panel.close();
    expect(dialog.hidden).toBe(true);
    panel.destroy();
  });

  it("cycles a tile through its levels and back to off", () => {
    const { store, panel, tile } = mount();
    panel.open();
    const t = tile("bigger-text");
    t.click();
    expect(store.get("bigger-text")).toBe("medium");
    expect(t.getAttribute("aria-pressed")).toBe("true");
    t.click();
    t.click();
    expect(store.get("bigger-text")).toBe("xlarge");
    t.click();
    expect(store.get("bigger-text")).toBeNull();
    expect(t.getAttribute("aria-pressed")).toBe("false");
    panel.destroy();
  });

  it("shows the active count with Arabic plural forms", () => {
    const { panel, root, tile } = mount();
    panel.open();
    const summary = root.querySelector(".summary") as HTMLElement;
    expect(summary.hidden).toBe(true);
    tile("bigger-text").click();
    expect(summary.textContent).toContain("خاصية واحدة مفعّلة");
    tile("highlight-links").click();
    expect(summary.textContent).toContain("خاصيتان مفعّلتان");
    panel.destroy();
  });

  it("undoes a reset", () => {
    const { store, panel, root, tile } = mount();
    panel.open();
    tile("high-contrast").click();
    (root.querySelector('[data-action="reset"]') as HTMLButtonElement).click();
    expect(store.get("high-contrast")).toBeNull();
    const undo = root.querySelector(".toast button") as HTMLButtonElement;
    undo.click();
    expect(store.get("high-contrast")).toBe("medium");
    panel.destroy();
  });

  it("applies and removes a quick preset with only the features the site allows", () => {
    const { store, panel, root } = mount();
    panel.open();
    const preset = root.querySelector('[data-preset="clearer-view"]') as HTMLButtonElement;
    preset.click();
    expect(store.get("high-contrast")).toBe("medium");
    expect(store.get("bigger-text")).toBe("large");
    expect(store.get("highlight-links")).toBe(true);
    expect(store.get("bigger-cursor")).toBeNull();
    expect(preset.getAttribute("aria-pressed")).toBe("true");
    preset.click();
    expect(store.get("high-contrast")).toBeNull();
    panel.destroy();
  });

  it("hides quick presets when the admin turns them off", () => {
    const { panel, root } = mount({ quickPresets: false });
    panel.open();
    expect(root.querySelector(".preset")).toBeNull();
    panel.destroy();
  });

  it("moves focus between tiles with the arrow keys", () => {
    const { panel, root, tile } = mount();
    panel.open();
    tile("bigger-text").focus();
    // RTL: the left arrow moves forward.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(root.activeElement).toBe(tile("high-contrast"));
    expect(tile("high-contrast").tabIndex).toBe(0);
    expect(tile("bigger-text").tabIndex).toBe(-1);
    panel.destroy();
  });

  it("uses the admin logo instead of the icon", () => {
    const logo = "data:image/png;base64,iVBORw0KGgo=";
    const { panel, root } = mount({ logoUrl: logo, buttonShape: "pill" });
    const img = root.querySelector(".fab img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe(logo);
    expect(root.querySelector(".fab")!.textContent).toContain("قائمة إمكانية الوصول");
    panel.destroy();
  });

  it("respects feature order from config inside a group", () => {
    const store = new AccessibilityStore(
      mergeWidgetConfig({
        features: [
          { id: "high-contrast", enabled: true, order: 0 },
          { id: "bigger-text", enabled: true, order: 1 },
        ],
      }),
    );
    const panel = createPanel(store, [features[1]!, features[2]!], () => undefined);
    document.body.appendChild(panel.host);
    const names = Array.from(panel.host.shadowRoot!.querySelectorAll(".tile .name")).map(
      (el) => el.textContent,
    );
    expect(names[0]).toContain("تباين");
    panel.destroy();
  });
});
