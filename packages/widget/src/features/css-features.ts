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

/** Everything inside the page except media and the widget's own overlays. */
const pageContent = (cls: string) =>
  `html.${cls} body, html.${cls} body *:not([id^="a11y-"]):not(img):not(video):not(canvas):not(iframe):not(svg):not(svg *)`;

const CONTRAST_THEMES = {
  medium: { bg: "#fff", fg: "#000", link: "#00008b" },
  high: { bg: "#000", fg: "#fff", link: "#9fd3ff" },
  ultra: { bg: "#000", fg: "#ff0", link: "#9fd3ff" },
} as const;

const TEXT_ZOOM = { medium: 1.2, large: 1.4, xlarge: 1.6 } as const;

const TEXT_SPACING = {
  light: { letter: "0.12em", word: "0.16em" },
  medium: { letter: "0.16em", word: "0.32em" },
  heavy: { letter: "0.2em", word: "0.5em" },
} as const;

const LINE_HEIGHTS = { "2": 1.8, "3": 2, "4": 2.4 } as const;

export const cssFeatures: FeatureModule[] = [
  // A color pair, not `filter: contrast()`, which pushes light grey text further toward white.
  cssFeature("high-contrast", "visual", "highContrast", ["medium", "high", "ultra"], (level) => {
    const t = CONTRAST_THEMES[level as keyof typeof CONTRAST_THEMES] ?? CONTRAST_THEMES.medium;
    return `${pageContent("a11y-high-contrast")} { background-color:${t.bg} !important; background-image:none !important; color:${t.fg} !important; border-color:${t.fg} !important; text-shadow:none !important; box-shadow:none !important; }
html.a11y-high-contrast { background-color:${t.bg} !important; }
html.a11y-high-contrast a, html.a11y-high-contrast a * { color:${t.link} !important; text-decoration:underline !important; }`;
  }),
  // Zoom scales every size up, so already large text never shrinks and rem-less sites still respond.
  cssFeature("bigger-text", "visual", "biggerText", ["medium", "large", "xlarge"], (level) => {
    const zoom = TEXT_ZOOM[level as keyof typeof TEXT_ZOOM] ?? TEXT_ZOOM.medium;
    return `html.a11y-bigger-text body > *:not([id^="a11y-"]):not(script):not(style) { zoom:${zoom}; }`;
  }),
  cssFeature("text-spacing", "visual", "textSpacing", ["light", "medium", "heavy"], (level) => {
    const s = TEXT_SPACING[level as keyof typeof TEXT_SPACING] ?? TEXT_SPACING.light;
    return `${pageContent("a11y-text-spacing")} { letter-spacing:${s.letter} !important; word-spacing:${s.word} !important; }`;
  }),
  // Unitless so each element's line height follows its own font size.
  cssFeature("line-height", "visual", "lineHeight", ["2", "3", "4"], (level) => {
    const value = LINE_HEIGHTS[String(level) as keyof typeof LINE_HEIGHTS] ?? LINE_HEIGHTS["2"];
    return `${pageContent("a11y-line-height")} { line-height:${value} !important; }`;
  }),
  cssFeature("bigger-cursor", "visual", "biggerCursor", ["black", "white"], (level) => {
    const fill = level === "white" ? "%23fff" : "%23000";
    const stroke = level === "white" ? "%23000" : "%23fff";
    const url = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'%3E%3Cpath fill='${fill}' stroke='${stroke}' stroke-width='2' d='M4 4 L4 40 L12 32 L18 46 L24 44 L18 28 L28 28 Z'/%3E%3C/svg%3E") 4 4, auto`;
    return `html.a11y-bigger-cursor, html.a11y-bigger-cursor * { cursor: ${url} !important; }`;
  }),
  cssFeature("highlight-links", "visual", "highlightLinks", [true], () =>
    `html.a11y-highlight-links a { background:#ff0 !important; color:#000 !important; text-decoration:underline !important; outline:2px solid #000 !important; }`,
  ),
  cssFeature("highlight-headings", "visual", "highlightHeadings", [true], () =>
    `html.a11y-highlight-headings h1, html.a11y-highlight-headings h2, html.a11y-highlight-headings h3, html.a11y-highlight-headings h4, html.a11y-highlight-headings h5, html.a11y-highlight-headings h6 { background:#e0f2fe !important; color:#000 !important; outline:2px dashed #0369a1 !important; outline-offset:2px !important; }`,
  ),
  // Near-zero durations jump to the end state, so fade-ins stay visible and animationend still fires.
  cssFeature("pause-animations", "visual", "pauseAnimations", [true], () =>
    `html.a11y-pause-animations *, html.a11y-pause-animations *::before, html.a11y-pause-animations *::after { animation-duration:0.001s !important; animation-delay:0s !important; animation-iteration-count:1 !important; transition-duration:0.001s !important; transition-delay:0s !important; scroll-behavior:auto !important; }`,
  ),
  cssFeature("strong-focus", "navigation", "strongFocus", [true], () =>
    `html.a11y-strong-focus *:focus { outline:3px solid #fff !important; outline-offset:0 !important; box-shadow:0 0 0 6px #0B3FCC !important; }`,
  ),
];
