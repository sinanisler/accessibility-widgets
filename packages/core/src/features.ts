import type { FeatureDefinition } from "./types.js";

/** Canonical catalog of 40+ accessibility features */
export const FEATURE_CATALOG: FeatureDefinition[] = [
  // Visual
  { id: "high-contrast", category: "visual", levels: ["medium", "high", "ultra"] },
  { id: "dark-contrast", category: "visual", levels: [true] },
  { id: "light-contrast", category: "visual", levels: [true] },
  { id: "invert-colors", category: "visual", levels: [true] },
  { id: "bigger-text", category: "visual", levels: ["medium", "large", "xlarge"] },
  { id: "text-spacing", category: "visual", levels: ["light", "medium", "heavy"] },
  { id: "line-height", category: "visual", levels: ["2", "3", "4"] },
  { id: "text-align", category: "visual", levels: ["left", "center", "right"] },
  { id: "hide-images", category: "visual", levels: [true] },
  { id: "bigger-cursor", category: "visual", levels: ["black", "white"] },
  { id: "saturation", category: "visual", levels: ["low", "high", "none"] },
  { id: "color-filter", category: "visual", levels: ["protanopia", "deuteranopia", "tritanopia", "grayscale"] },
  { id: "custom-colors", category: "visual", levels: ["text", "background", "headings"] },
  { id: "highlight-links", category: "visual", levels: [true] },
  { id: "highlight-headings", category: "visual", levels: [true] },
  { id: "page-zoom", category: "visual", levels: ["110", "125", "150", "200"] },
  { id: "magnifier", category: "visual", levels: ["2x", "3x", "4x"] },
  { id: "dyslexia-font", category: "visual", levels: [true] },
  { id: "font-family", category: "visual", levels: ["arial", "times", "verdana", "tajawal"] },
  { id: "pause-animations", category: "visual", levels: [true] },

  // Cognitive
  { id: "reading-mask", category: "cognitive", levels: ["narrow", "medium", "wide"] },
  { id: "reading-guide", category: "cognitive", levels: [true] },
  { id: "focus-mode", category: "cognitive", levels: [true] },
  { id: "mute-media", category: "cognitive", levels: [true] },
  { id: "simplify-layout", category: "cognitive", levels: [true] },
  { id: "tooltip-dictionary", category: "cognitive", levels: [true] },

  // Navigation
  { id: "page-map", category: "navigation", levels: [true] },
  { id: "strong-focus", category: "navigation", levels: [true] },
  { id: "keyboard-nav", category: "navigation", levels: [true] },
  { id: "landmark-nav", category: "navigation", levels: [true] },
  { id: "skip-links", category: "navigation", levels: [true] },
  { id: "large-click-targets", category: "navigation", levels: [true] },

  // Reader
  { id: "screen-reader", category: "reader", levels: [true] },
  { id: "click-to-speak", category: "reader", levels: [true] },
  { id: "word-highlight", category: "reader", levels: [true] },
  { id: "reading-mode", category: "reader", levels: [true] },
  { id: "tts-speed", category: "reader", levels: ["0.75", "1", "1.25", "1.5"] },
  { id: "voice-control", category: "reader", levels: [true] },

  // Profiles (applied as bundles)
  { id: "profile-low-vision", category: "profiles", levels: [true] },
  { id: "profile-epilepsy", category: "profiles", levels: [true] },
  { id: "profile-adhd", category: "profiles", levels: [true] },
  { id: "profile-dyslexia", category: "profiles", levels: [true] },
  { id: "profile-seniors", category: "profiles", levels: [true] },
  { id: "profile-blind", category: "profiles", levels: [true] },
  { id: "profile-motor", category: "profiles", levels: [true] },
];

export const FEATURE_IDS = FEATURE_CATALOG.map((f) => f.id);

/** Features shipped in v1.0 (see docs/v1-release-scope.md). Everything else stays in code but is hidden and inert. */
export const V1_FEATURE_IDS = [
  "bigger-text",
  "high-contrast",
  "text-spacing",
  "line-height",
  "highlight-links",
  "highlight-headings",
  "strong-focus",
  "pause-animations",
  "reading-guide",
  "bigger-cursor",
] as const;

export function isReleasedFeature(id: string): boolean {
  return (V1_FEATURE_IDS as readonly string[]).includes(id);
}
