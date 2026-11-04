import type { FeatureLevel } from "@a11y/core";
import type { FeatureModule } from "./types.js";

/** Elements that draw icons or code, where swapping the font breaks glyphs or alignment. */
const KEEP_FONT =
  ':not([id^="a11y-"]):not(i):not(svg):not(svg *):not(code):not(pre):not(kbd):not(samp)' +
  ':not([class*="icon" i]):not([class*="fa-"]):not([class*="material-"]):not([class*="glyph" i])';

// System fonts only, so no request leaves the customer's site. Arabic fallbacks follow the Latin ones.
const FONT_STACKS = {
  readable: 'Verdana, Tahoma, "Noto Sans Arabic", "Geeza Pro", sans-serif',
  sans: 'system-ui, -apple-system, "Segoe UI", Tahoma, "Noto Sans", "Noto Sans Arabic", sans-serif',
  serif: 'Georgia, "Times New Roman", "Noto Naskh Arabic", "Traditional Arabic", serif',
} as const;

const SATURATION = { low: "saturate(0.5)", high: "saturate(2)", none: "grayscale(1)" } as const;

// Daltonization (I + E·(I − S)): shifts the colors a viewer cannot tell apart into ones they can.
// Simulation matrices would only show what the viewer already sees.
const CVD_MATRICES = {
  protanopia: "1 0 0 0 0 -0.255 1.255 0 0 0 0.303 -0.545 1.242 0 0 0 0 0 1 0",
  deuteranopia: "1 0 0 0 0 -0.438 1.438 0 0 0 0.262 -0.563 1.3 0 0 0 0 0 1 0",
  tritanopia: "1 0 0 0 0 0.035 1.532 -0.567 0 0 0.035 -0.51 1.475 0 0 0 0 0 1 0",
} as const;

const MASK_HEIGHTS = { narrow: 80, medium: 120, wide: 180 } as const;

// Saturation and color correction both need `filter`, so each sets a variable and one rule combines them.
// The filter sits on <html> because on body children it would turn the site's fixed headers into scrolling ones.
const FILTER_RULE = `html.a11y-saturation, html.a11y-color-filter { filter: var(--a11y-saturate,) var(--a11y-cvd,) !important; }`;

function cssFeature(
  id: string,
  category: FeatureModule["category"],
  labelKey: string,
  levels: FeatureLevel[] | undefined,
  css: (level: FeatureLevel) => string,
): FeatureModule {
  return {
    id,
    category,
    labelKey,
    levels,
    css,
    apply() {
      /* applied via registry style injection */
    },
  };
}

let maskEl: HTMLDivElement | null = null;
let maskHeight: number = MASK_HEIGHTS.medium;
let detachMask: (() => void) | null = null;

function placeMask(y: number): void {
  if (maskEl) maskEl.style.top = `${Math.max(0, y - maskHeight / 2)}px`;
}

function attachMask(): () => void {
  const onPointer = (e: PointerEvent) => placeMask(e.clientY);
  const onTouch = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) placeMask(touch.clientY);
  };
  const onFocus = (e: FocusEvent) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const box = target.getBoundingClientRect();
    placeMask(box.top + box.height / 2);
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

let filterSvg: SVGSVGElement | null = null;

function ensureFilterSvg(level: keyof typeof CVD_MATRICES): void {
  if (!filterSvg) {
    const ns = "http://www.w3.org/2000/svg";
    filterSvg = document.createElementNS(ns, "svg");
    filterSvg.id = "a11y-svg-filters";
    filterSvg.setAttribute("aria-hidden", "true");
    filterSvg.setAttribute("focusable", "false");
    filterSvg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    const filter = filterSvg.appendChild(document.createElementNS(ns, "filter"));
    filter.id = "a11y-cvd";
    filter.setAttribute("color-interpolation-filters", "sRGB");
    const matrix = filter.appendChild(document.createElementNS(ns, "feColorMatrix"));
    matrix.setAttribute("type", "matrix");
    document.body.appendChild(filterSvg);
  }
  filterSvg.querySelector("feColorMatrix")!.setAttribute("values", CVD_MATRICES[level]);
}

export const optionalFeatures: FeatureModule[] = [
  cssFeature("font-family", "visual", "fontFamily", ["readable", "sans", "serif"], (level) => {
    const stack = FONT_STACKS[level as keyof typeof FONT_STACKS] ?? FONT_STACKS.readable;
    return `html.a11y-font-family body, html.a11y-font-family body *${KEEP_FONT} { font-family:${stack} !important; }`;
  }),
  // Justified and centered body text leaves uneven gaps; `start` follows each element's own direction,
  // so Arabic aligns right and English left on the same page. Headings and controls keep the site's layout.
  cssFeature("text-align", "visual", "textAlign", [true], () =>
    `html.a11y-text-align :is(p, li, dd, dt, blockquote, figcaption, td, th):not([id^="a11y-"]) { text-align:start !important; }`,
  ),
  {
    id: "reading-mask",
    category: "cognitive",
    labelKey: "readingMask",
    levels: ["narrow", "medium", "wide"],
    apply(level) {
      if (!level) {
        detachMask?.();
        detachMask = null;
        maskEl?.remove();
        maskEl = null;
        return;
      }
      maskHeight = MASK_HEIGHTS[level as keyof typeof MASK_HEIGHTS] ?? MASK_HEIGHTS.medium;
      if (!maskEl) {
        maskEl = document.createElement("div");
        maskEl.id = "a11y-reading-mask";
        maskEl.setAttribute("aria-hidden", "true");
        Object.assign(maskEl.style, {
          position: "fixed",
          left: "0",
          right: "0",
          top: `calc(40vh - ${maskHeight / 2}px)`,
          pointerEvents: "none",
          // Below the widget (2147483647), so the panel stays readable while the mask is on.
          zIndex: "2147483645",
          boxShadow: "0 0 0 100vmax rgba(0,0,0,0.6)",
          borderTop: "2px solid #0B5FFF",
          borderBottom: "2px solid #0B5FFF",
        });
        document.body.appendChild(maskEl);
        detachMask = attachMask();
      }
      maskEl.style.height = `${maskHeight}px`;
    },
  },
  cssFeature("saturation", "visual", "saturation", ["low", "high", "none"], (level) => {
    const value = SATURATION[level as keyof typeof SATURATION] ?? SATURATION.low;
    return `${FILTER_RULE}\nhtml.a11y-saturation { --a11y-saturate:${value}; }`;
  }),
  {
    id: "color-filter",
    category: "visual",
    labelKey: "colorFilter",
    levels: ["protanopia", "deuteranopia", "tritanopia"],
    apply(level) {
      if (!level) {
        filterSvg?.remove();
        filterSvg = null;
        return;
      }
      ensureFilterSvg(String(level) in CVD_MATRICES ? (String(level) as keyof typeof CVD_MATRICES) : "protanopia");
    },
    css: () => `${FILTER_RULE}\nhtml.a11y-color-filter { --a11y-cvd:url(#a11y-cvd); }`,
  },
];
