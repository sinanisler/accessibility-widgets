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
];

describe("createPanel", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
  });

  it("opens with focus trap targets and switch controls", () => {
    const store = new AccessibilityStore(mergeWidgetConfig({ language: "ar" }));
    const panel = createPanel(store, features, () => undefined);
    document.body.appendChild(panel.host);

    panel.open();
    const root = panel.host.shadowRoot!;
    const dialog = root.querySelector(".panel") as HTMLElement;
    expect(dialog.hidden).toBe(false);
    expect(root.querySelectorAll('[role="switch"]').length).toBe(2);
    expect(root.querySelector("#a11y-title")).toBeTruthy();

    const switchBtn = root.querySelector('[role="switch"]') as HTMLButtonElement;
    switchBtn.click();
    expect(store.get("bigger-text")).toBeTruthy();

    panel.close();
    expect(dialog.hidden).toBe(true);
    panel.destroy();
  });

  it("respects feature order from config", () => {
    const store = new AccessibilityStore(
      mergeWidgetConfig({
        features: [
          { id: "high-contrast", enabled: true, order: 0 },
          { id: "bigger-text", enabled: true, order: 1 },
        ],
      }),
    );
    const ordered = [features[1]!, features[0]!];
    const panel = createPanel(store, ordered, () => undefined);
    document.body.appendChild(panel.host);
    panel.open();
    const labels = Array.from(panel.host.shadowRoot!.querySelectorAll(".label")).map(
      (el) => el.textContent,
    );
    expect(labels[0]).toContain("تباين");
    panel.destroy();
  });
});
