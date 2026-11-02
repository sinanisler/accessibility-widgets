import { applyPreviewConfig, autoInit, initAccessibilityWidget } from "./init.js";

export { initAccessibilityWidget, initAccessibilityWidget as init, autoInit, applyPreviewConfig };
export type { WidgetConfig } from "@a11y/core";

if (typeof window !== "undefined") {
  window.AccessibilityWidget = { init: initAccessibilityWidget };
  autoInit();
}
