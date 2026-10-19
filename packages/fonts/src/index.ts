export const DYSLEXIA_FONT_FAMILY = "A11yDyslexiaArabic, Tajawal, Comic Sans MS, Tahoma, sans-serif";

export const DYSLEXIA_FONT_CSS_URL = new URL("../dyslexia.css", import.meta.url).href;

export function injectDyslexiaFont(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("a11y-dyslexia-font-link")) return;
  const link = document.createElement("link");
  link.id = "a11y-dyslexia-font-link";
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/@fontsource/tajawal@5.2.5/index.css";
  document.head.appendChild(link);
}
