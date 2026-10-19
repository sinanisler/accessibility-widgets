import type { FeatureLevel } from "@a11y/core";
import type { FeatureModule } from "./types.js";

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

export const cssFeatures: FeatureModule[] = [
  cssFeature("high-contrast", "visual", "highContrast", ["medium", "high", "ultra"], (level) => {
    const map = { medium: 1.3, high: 1.5, ultra: 2 } as const;
    const f = map[level as keyof typeof map] ?? 1.3;
    return `html.a11y-high-contrast { filter: contrast(${f}) !important; }`;
  }),
  cssFeature("dark-contrast", "visual", "darkContrast", [true], () =>
    `html.a11y-dark-contrast { filter: invert(1) hue-rotate(180deg) !important; }
     html.a11y-dark-contrast img, html.a11y-dark-contrast video, html.a11y-dark-contrast picture { filter: invert(1) hue-rotate(180deg) !important; }`,
  ),
  cssFeature("light-contrast", "visual", "lightContrast", [true], () =>
    `html.a11y-light-contrast body { background:#fff !important; color:#000 !important; }
     html.a11y-light-contrast * { background-color: transparent !important; color:#000 !important; border-color:#000 !important; }`,
  ),
  cssFeature("invert-colors", "visual", "invertColors", [true], () =>
    `html.a11y-invert-colors { filter: invert(1) !important; }`,
  ),
  cssFeature("bigger-text", "visual", "biggerText", ["medium", "large", "xlarge"], (level) => {
    const map = { medium: "20px", large: "24px", xlarge: "28px" } as const;
    const size = map[level as keyof typeof map] ?? "20px";
    return `html.a11y-bigger-text body, html.a11y-bigger-text p, html.a11y-bigger-text li, html.a11y-bigger-text a, html.a11y-bigger-text span, html.a11y-bigger-text button, html.a11y-bigger-text input, html.a11y-bigger-text textarea, html.a11y-bigger-text label { font-size: ${size} !important; }`;
  }),
  cssFeature("text-spacing", "visual", "textSpacing", ["light", "medium", "heavy"], (level) => {
    const map = {
      light: { letter: "0.1em", word: "0.5em" },
      medium: { letter: "0.15em", word: "1em" },
      heavy: { letter: "0.25em", word: "2em" },
    } as const;
    const s = map[level as keyof typeof map] ?? map.light;
    return `html.a11y-text-spacing body, html.a11y-text-spacing p, html.a11y-text-spacing li { letter-spacing:${s.letter} !important; word-spacing:${s.word} !important; }`;
  }),
  cssFeature("line-height", "visual", "lineHeight", ["2", "3", "4"], (level) =>
    `html.a11y-line-height body, html.a11y-line-height p, html.a11y-line-height li { line-height: ${level}em !important; }`,
  ),
  cssFeature("text-align", "visual", "textAlign", ["left", "center", "right"], (level) =>
    `html.a11y-text-align body, html.a11y-text-align p, html.a11y-text-align li, html.a11y-text-align h1, html.a11y-text-align h2, html.a11y-text-align h3 { text-align: ${level} !important; }`,
  ),
  cssFeature("hide-images", "visual", "hideImages", [true], () =>
    `html.a11y-hide-images img, html.a11y-hide-images picture, html.a11y-hide-images svg:not(.a11y-keep), html.a11y-hide-images video { display:none !important; }`,
  ),
  cssFeature("bigger-cursor", "visual", "biggerCursor", ["black", "white"], (level) => {
    const fill = level === "white" ? "%23fff" : "%23000";
    const stroke = level === "white" ? "%23000" : "%23fff";
    const url = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'%3E%3Cpath fill='${fill}' stroke='${stroke}' stroke-width='2' d='M4 4 L4 40 L12 32 L18 46 L24 44 L18 28 L28 28 Z'/%3E%3C/svg%3E") 4 4, auto`;
    return `html.a11y-bigger-cursor, html.a11y-bigger-cursor * { cursor: ${url} !important; }`;
  }),
  cssFeature("saturation", "visual", "saturation", ["low", "high", "none"], (level) => {
    const map = { low: 0.5, high: 10, none: 0 } as const;
    const v = map[level as keyof typeof map] ?? 1;
    return `html.a11y-saturation { filter: saturate(${v}) !important; }`;
  }),
  cssFeature("color-filter", "visual", "colorFilter", ["protanopia", "deuteranopia", "tritanopia", "grayscale"], (level) => {
    if (level === "grayscale") return `html.a11y-color-filter { filter: grayscale(1) !important; }`;
    const matrices: Record<string, string> = {
      protanopia: "0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0",
      deuteranopia: "0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0",
      tritanopia: "0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0",
    };
    const values = matrices[String(level)] ?? matrices.protanopia;
    return `html.a11y-color-filter { filter: url(#a11y-filter-${level}) !important; }
      #a11y-svg-filters { position:absolute;width:0;height:0;overflow:hidden; }
      /* feColorMatrix values for ${level}: ${values} */`;
  }),
  cssFeature("highlight-links", "visual", "highlightLinks", [true], () =>
    `html.a11y-highlight-links a { background:#ff0 !important; color:#000 !important; text-decoration:underline !important; outline:2px solid #000 !important; }`,
  ),
  cssFeature("highlight-headings", "visual", "highlightHeadings", [true], () =>
    `html.a11y-highlight-headings h1, html.a11y-highlight-headings h2, html.a11y-highlight-headings h3, html.a11y-highlight-headings h4, html.a11y-highlight-headings h5, html.a11y-highlight-headings h6 { background:#e0f2fe !important; outline:2px dashed #0369a1 !important; padding:0.15em !important; }`,
  ),
  cssFeature("page-zoom", "visual", "pageZoom", ["110", "125", "150", "200"], (level) =>
    `html.a11y-page-zoom { zoom: ${Number(level) / 100} !important; }`,
  ),
  cssFeature("dyslexia-font", "visual", "dyslexiaFont", [true], () =>
    `@font-face{font-family:'A11yDyslexia';src:local('Comic Sans MS'),local('Comic Sans'),local('Tahoma'),url('https://cdn.jsdelivr.net/gh/googlefonts/tajawal@main/fonts/ttf/Tajawal-Regular.ttf') format('truetype');font-display:swap;}
     html.a11y-dyslexia-font body, html.a11y-dyslexia-font p, html.a11y-dyslexia-font li, html.a11y-dyslexia-font a, html.a11y-dyslexia-font span, html.a11y-dyslexia-font button, html.a11y-dyslexia-font input, html.a11y-dyslexia-font textarea, html.a11y-dyslexia-font h1, html.a11y-dyslexia-font h2, html.a11y-dyslexia-font h3 { font-family:'A11yDyslexia', Tajawal, Comic Sans MS, sans-serif !important; letter-spacing:0.12em !important; word-spacing:0.16em !important; }`,
  ),
  cssFeature("font-family", "visual", "fontFamily", ["arial", "times", "verdana", "tajawal"], (level) => {
    const map: Record<string, string> = {
      arial: "Arial, sans-serif",
      times: "'Times New Roman', serif",
      verdana: "Verdana, sans-serif",
      tajawal: "Tajawal, Arial, sans-serif",
    };
    return `html.a11y-font-family body, html.a11y-font-family * { font-family: ${map[String(level)] ?? "Arial, sans-serif"} !important; }`;
  }),
  cssFeature("pause-animations", "visual", "pauseAnimations", [true], () =>
    `html.a11y-pause-animations *, html.a11y-pause-animations *::before, html.a11y-pause-animations *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; }`,
  ),
  cssFeature("strong-focus", "navigation", "strongFocus", [true], () =>
    `html.a11y-strong-focus *:focus { outline: 3px solid #0B5FFF !important; outline-offset: 3px !important; }`,
  ),
  cssFeature("large-click-targets", "navigation", "largeClickTargets", [true], () =>
    `html.a11y-large-click-targets a, html.a11y-large-click-targets button, html.a11y-large-click-targets input, html.a11y-large-click-targets select, html.a11y-large-click-targets textarea { min-height:44px !important; min-width:44px !important; padding:0.5rem 0.75rem !important; }`,
  ),
  cssFeature("simplify-layout", "cognitive", "simplifyLayout", [true], () =>
    `html.a11y-simplify-layout aside, html.a11y-simplify-layout [role="complementary"], html.a11y-simplify-layout .sidebar, html.a11y-simplify-layout .ad, html.a11y-simplify-layout iframe { display:none !important; }
     html.a11y-simplify-layout main, html.a11y-simplify-layout article { max-width:48rem !important; margin-inline:auto !important; }`,
  ),
  cssFeature("focus-mode", "cognitive", "focusMode", [true], () =>
    `html.a11y-focus-mode body > *:not(#a11y-platform-root):not(script):not(style) { opacity:0.35 !important; }
     html.a11y-focus-mode main, html.a11y-focus-mode article, html.a11y-focus-mode [role="main"] { opacity:1 !important; outline:3px solid #0B5FFF !important; }`,
  ),
];
