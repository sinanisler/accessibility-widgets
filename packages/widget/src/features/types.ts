import type { FeatureCategory, FeatureLevel } from "@a11y/core";

export interface FeatureContext {
  rootStyle: HTMLStyleElement;
  announce: (message: string) => void;
}

export interface FeatureModule {
  id: string;
  category: FeatureCategory;
  labelKey: string;
  levels?: FeatureLevel[];
  apply: (level: FeatureLevel | null, ctx: FeatureContext) => void;
  css?: (level: FeatureLevel) => string;
}
