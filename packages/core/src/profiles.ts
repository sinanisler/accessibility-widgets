import type { AccessibilityProfile } from "./types.js";

export const PROFILES: AccessibilityProfile[] = [
  {
    id: "low-vision",
    labelKey: "profileLowVision",
    features: {
      "bigger-text": "xlarge",
      "high-contrast": "high",
      "bigger-cursor": "black",
      "page-zoom": "150",
      "highlight-links": true,
    },
  },
  {
    id: "epilepsy",
    labelKey: "profileEpilepsy",
    features: {
      "pause-animations": true,
      saturation: "low",
      "mute-media": true,
    },
  },
  {
    id: "adhd",
    labelKey: "profileAdhd",
    features: {
      "reading-mask": "medium",
      "focus-mode": true,
      "pause-animations": true,
      "simplify-layout": true,
    },
  },
  {
    id: "dyslexia",
    labelKey: "profileDyslexia",
    features: {
      "dyslexia-font": true,
      "text-spacing": "heavy",
      "line-height": "3",
      "reading-guide": true,
    },
  },
  {
    id: "seniors",
    labelKey: "profileSeniors",
    features: {
      "bigger-text": "large",
      "bigger-cursor": "black",
      "large-click-targets": true,
      "highlight-links": true,
      "strong-focus": true,
    },
  },
  {
    id: "blind",
    labelKey: "profileBlind",
    features: {
      "screen-reader": true,
      "click-to-speak": true,
      "keyboard-nav": true,
      "landmark-nav": true,
      "skip-links": true,
    },
  },
  {
    id: "motor",
    labelKey: "profileMotor",
    features: {
      "large-click-targets": true,
      "keyboard-nav": true,
      "voice-control": true,
      "strong-focus": true,
    },
  },
];
