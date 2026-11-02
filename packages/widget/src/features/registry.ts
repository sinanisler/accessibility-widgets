import type { FeatureLevel, FeatureState } from "@a11y/core";
import type { FeatureContext, FeatureModule } from "./types.js";
import { cssFeatures } from "./css-features.js";
import { runtimeFeatures } from "./runtime-features.js";

export class FeatureRegistry {
  private features = new Map<string, FeatureModule>();
  private styleEl: HTMLStyleElement;
  private ctx: FeatureContext;

  constructor(announce: (msg: string) => void) {
    this.styleEl = document.createElement("style");
    this.styleEl.id = "a11y-platform-styles";
    document.head.appendChild(this.styleEl);
    this.ctx = { rootStyle: this.styleEl, announce };

    for (const f of [...cssFeatures, ...runtimeFeatures]) {
      this.features.set(f.id, f);
    }
  }

  register(feature: FeatureModule): void {
    this.features.set(feature.id, feature);
  }

  retain(predicate: (id: string) => boolean): void {
    for (const id of Array.from(this.features.keys())) {
      if (!predicate(id)) this.features.delete(id);
    }
  }

  list(): FeatureModule[] {
    return Array.from(this.features.values());
  }

  get(id: string): FeatureModule | undefined {
    return this.features.get(id);
  }

  applyState(state: FeatureState): void {
    // Clear previous feature classes
    const html = document.documentElement;
    Array.from(html.classList)
      .filter((c) => c.startsWith("a11y-"))
      .forEach((c) => html.classList.remove(c));

    const cssChunks: string[] = [];

    for (const feature of this.features.values()) {
      const level = (state[feature.id] ?? null) as FeatureLevel | null;
      const active = level !== null && level !== false && level !== undefined;

      if (active) {
        html.classList.add(`a11y-${feature.id}`);
        if (feature.css) cssChunks.push(feature.css(level as FeatureLevel));
      }

      try {
        feature.apply(active ? level : null, this.ctx);
      } catch {
        /* feature isolation */
      }
    }

    this.styleEl.textContent = cssChunks.join("\n");
  }
}
