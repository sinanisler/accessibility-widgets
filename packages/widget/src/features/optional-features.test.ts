import { afterEach, describe, expect, it } from "vitest";
import { FeatureRegistry } from "./registry.js";

const styles = () => document.getElementById("a11y-platform-styles")!.textContent ?? "";

describe("optional features", () => {
  let registry: FeatureRegistry;

  afterEach(() => {
    registry?.applyState({});
    document.getElementById("a11y-platform-styles")?.remove();
  });

  it("adds one reading mask, resizes it per level, and removes it when off", () => {
    registry = new FeatureRegistry(() => {});
    registry.applyState({ "reading-mask": "narrow" });
    registry.applyState({ "reading-mask": "wide" });
    const masks = document.querySelectorAll("#a11y-reading-mask");
    expect(masks.length).toBe(1);
    expect((masks[0] as HTMLElement).style.height).toBe("180px");
    expect((masks[0] as HTMLElement).style.pointerEvents).toBe("none");

    registry.applyState({});
    expect(document.getElementById("a11y-reading-mask")).toBeNull();
  });

  it("follows the pointer only while the mask is on", () => {
    registry = new FeatureRegistry(() => {});
    registry.applyState({ "reading-mask": "medium" });
    const mask = document.getElementById("a11y-reading-mask")!;
    document.dispatchEvent(Object.assign(new Event("pointermove"), { clientY: 300 }));
    expect(mask.style.top).toBe("240px");

    registry.applyState({});
    registry.applyState({ "reading-mask": "medium" });
    const next = document.getElementById("a11y-reading-mask")!;
    const before = next.style.top;
    registry.applyState({});
    document.dispatchEvent(Object.assign(new Event("pointermove"), { clientY: 500 }));
    expect(next.style.top).toBe(before);
  });

  it("combines saturation and color correction into one filter", () => {
    registry = new FeatureRegistry(() => {});
    registry.applyState({ saturation: "none", "color-filter": "deuteranopia" });
    expect(styles()).toContain("filter: var(--a11y-saturate,) var(--a11y-cvd,)");
    expect(styles()).toContain("--a11y-saturate:grayscale(1)");
    expect(styles()).toContain("--a11y-cvd:url(#a11y-cvd)");
    const matrix = document.querySelector("#a11y-svg-filters feColorMatrix")!;
    expect(matrix.getAttribute("values")).toMatch(/^1 0 0 0 0 -0\.438/);

    registry.applyState({});
    expect(document.getElementById("a11y-svg-filters")).toBeNull();
  });

  it("keeps icon fonts and code in their own font", () => {
    registry = new FeatureRegistry(() => {});
    registry.applyState({ "font-family": "readable" });
    const css = styles();
    expect(css).toContain("Verdana");
    expect(css).toContain(':not([class*="icon" i])');
    expect(css).toContain(":not(code)");
  });

  it("aligns text to each element's own start", () => {
    registry = new FeatureRegistry(() => {});
    registry.applyState({ "text-align": true });
    expect(styles()).toContain("text-align:start");
    expect(document.documentElement.classList.contains("a11y-text-align")).toBe(true);
  });
});
