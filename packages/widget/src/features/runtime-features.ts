import type { FeatureModule } from "./types.js";

let guideEl: HTMLDivElement | null = null;
let detachGuide: (() => void) | null = null;

function placeGuide(y: number): void {
  if (guideEl) guideEl.style.top = `${y}px`;
}

function attachGuide(): () => void {
  const onPointer = (e: PointerEvent) => placeGuide(e.clientY);
  const onTouch = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) placeGuide(touch.clientY);
  };
  const onFocus = (e: FocusEvent) => {
    const target = e.target;
    if (target instanceof Element) placeGuide(target.getBoundingClientRect().bottom);
  };
  document.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("touchmove", onTouch, { passive: true });
  document.addEventListener("focusin", onFocus);
  return () => {
    document.removeEventListener("pointermove", onPointer);
    document.removeEventListener("touchmove", onTouch);
    document.removeEventListener("focusin", onFocus);
  };
}

export const runtimeFeatures: FeatureModule[] = [
  {
    id: "reading-guide",
    category: "cognitive",
    labelKey: "readingGuide",
    levels: [true],
    apply(level) {
      if (!level) {
        detachGuide?.();
        detachGuide = null;
        guideEl?.remove();
        guideEl = null;
        return;
      }
      if (guideEl) return;
      guideEl = document.createElement("div");
      guideEl.id = "a11y-reading-guide";
      guideEl.setAttribute("aria-hidden", "true");
      Object.assign(guideEl.style, {
        position: "fixed",
        left: "0",
        right: "0",
        top: "40vh",
        height: "4px",
        background: "rgba(11,95,255,0.85)",
        boxShadow: "0 0 0 1px #fff",
        pointerEvents: "none",
        zIndex: "2147483645",
      });
      document.body.appendChild(guideEl);
      detachGuide = attachGuide();
    },
  },
];
