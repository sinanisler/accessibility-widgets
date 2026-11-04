import { readableOn, type ButtonShape, type WidgetPosition } from "@a11y/core";

export interface ChromeOptions {
  primary: string;
  accent: string;
  background: string;
  text: string;
  width: string;
  radius: number;
  buttonSize: number;
  shape: ButtonShape;
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : hex;
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) || 0) as [number, number, number];
}

/** `amount` of `a` over `b`, done here so older browsers without color-mix() get the same palette. */
export function mix(a: string, b: string, amount: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  return `#${x
    .map((c, i) => Math.round(c * amount + y[i]! * (1 - amount)).toString(16).padStart(2, "0"))
    .join("")}`;
}

const DARK = {
  bg: "#14171D",
  surface: "#1D212A",
  hover: "#262B36",
  fg: "#EEF0F4",
  muted: "#A6ADBB",
  line: "#2C313C",
  shadow: "0 24px 60px -12px rgba(0,0,0,.7), 0 0 0 1px #2C313C",
};

function tokens(o: ChromeOptions): { light: string; dark: string; shared: string } {
  const light = {
    bg: o.background,
    surface: mix(o.text, o.background, 0.05),
    hover: mix(o.text, o.background, 0.1),
    fg: o.text,
    muted: mix(o.text, o.background, 0.68),
    line: mix(o.text, o.background, 0.12),
    shadow: "0 24px 60px -12px rgba(18,24,40,.35), 0 2px 6px rgba(18,24,40,.08)",
  };
  const decl = (t: typeof light) =>
    `--bg:${t.bg};--surface:${t.surface};--hover:${t.hover};--fg:${t.fg};--muted:${t.muted};--line:${t.line};--shadow:${t.shadow};`;
  const onP = readableOn(o.primary);
  return {
    light: decl(light),
    dark: decl(DARK),
    shared: `--p:${o.primary};--on-p:${onP};--p-soft:${mix(o.primary, o.background, 0.08)};--p-soft-dark:${mix(o.primary, DARK.bg, 0.3)};--p-ring:${mix(o.primary, "#000000", 0.7)};--acc:${o.accent};--on-acc:${readableOn(o.accent)};--acc-soft:${mix(o.accent, o.background, 0.16)};--acc-soft-dark:${mix(o.accent, DARK.bg, 0.18)};--level-on-p:${mix(onP, o.primary, 0.85)};--pip-on-p:${mix(onP, o.primary, 0.35)};--fs:${o.buttonSize}px;--r:${o.radius}px;`,
  };
}

export function panelStyles(o: ChromeOptions): string {
  const t = tokens(o);
  const tileRadius = Math.max(6, Math.min(o.radius - 4, 16));
  const fabRadius = o.shape === "square" ? `${Math.round(o.buttonSize * 0.28)}px` : "999px";

  return `
:host { all: initial; ${t.shared} ${t.light} }
:host([data-theme="dark"]) { ${t.dark} --p-soft:var(--p-soft-dark); --acc-soft:var(--acc-soft-dark); }
@media (prefers-color-scheme: dark) { :host([data-theme="auto"]) { ${t.dark} --p-soft:var(--p-soft-dark); --acc-soft:var(--acc-soft-dark); } }
* { box-sizing: border-box; font-family: "SF Arabic", "Segoe UI", "Noto Sans Arabic", Tahoma, system-ui, sans-serif; }
:host([hidden]), [hidden] { display: none !important; }
button { font: inherit; color: inherit; margin: 0; }
button:focus-visible, a:focus-visible, [tabindex]:focus-visible { outline: 3px solid var(--p); outline-offset: 2px; }
:host([data-theme="dark"]) :focus-visible { outline-color: #fff; }
.sr-only, .live { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

.fab {
  position: fixed; z-index: 2147483647;
  width: var(--fs); height: var(--fs); min-width: 44px; min-height: 44px; border-radius: ${fabRadius};
  background: var(--p); color: var(--on-p); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 10px 28px -6px var(--p-ring);
  transition: transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease;
}
.fab:hover { transform: translateY(-2px); }
.fab:focus-visible { outline: 3px solid #111827; outline-offset: 3px; box-shadow: 0 0 0 3px #fff; }
.fab[data-shape="pill"] { width: auto; padding-inline: calc(var(--fs) * .26) calc(var(--fs) * .34); font-weight: 700; font-size: 15px; }
.fab > svg, .fab > img { width: calc(var(--fs) * .52); height: calc(var(--fs) * .52); object-fit: contain; flex-shrink: 0; }
.fab[data-on="true"] { box-shadow: 0 10px 28px -6px var(--p-ring), 0 0 0 3px #fff, 0 0 0 6px var(--acc); }
.fab-badge {
  position: absolute; top: -3px; inset-inline-end: -3px;
  min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px;
  background: var(--acc); color: var(--on-acc); font-size: 12px; font-weight: 700;
  display: grid; place-items: center; box-shadow: 0 0 0 2px #fff;
}
.fab-badge[data-empty="true"] { display: none; }

.panel {
  position: fixed; z-index: 2147483647;
  width: min(${o.width}, calc(100vw - 24px)); max-height: min(calc(100vh - var(--fs) - 56px), 680px);
  background: var(--bg); color: var(--fg); border-radius: var(--r); box-shadow: var(--shadow);
  display: flex; flex-direction: column; overflow: hidden; font-size: 14px; line-height: 1.45;
  animation: a11y-in .2s cubic-bezier(.2,.8,.2,1);
}
@keyframes a11y-in { from { opacity: 0; transform: translateY(var(--dy, 8px)) scale(.96); } }

.handle { display: none; }
.header { display: flex; align-items: center; gap: 8px; padding: 16px 18px 10px; flex-shrink: 0; }
.title { flex: 1; margin: 0; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 10px; outline: none; }
.mark { width: 30px; height: 30px; border-radius: ${o.shape === "square" ? "9px" : "50%"}; background: var(--p); color: var(--on-p); display: grid; place-items: center; flex-shrink: 0; }
.mark svg, .mark img { width: 62%; height: 62%; object-fit: contain; }
.icon-btn { border: none; background: var(--surface); width: 40px; height: 40px; border-radius: 10px; cursor: pointer; display: grid; place-items: center; font-weight: 700; font-size: 13px; }
.icon-btn:hover { background: var(--hover); }
.icon-btn svg { width: 18px; height: 18px; }

.summary {
  margin: 0 18px 4px; padding-block: 6px; padding-inline: 12px 6px; border-radius: 12px; flex-shrink: 0;
  background: var(--acc-soft); display: flex; align-items: center; justify-content: space-between; gap: 8px;
  font-weight: 600; font-size: 13px;
}
.summary-text { display: flex; align-items: center; gap: 8px; }
.summary-text::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--acc); }
.text-btn { border: none; background: transparent; cursor: pointer; font-weight: 600; padding: 8px 10px; border-radius: 8px; min-height: 36px; }
.text-btn:hover { background: var(--surface); }

.body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 6px 18px 14px; display: flex; flex-direction: column; gap: 18px; }
.group-title { margin: 0 0 8px; font-size: 12px; font-weight: 600; color: var(--muted); }
.presets { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.preset {
  border: 1px solid var(--line); background: var(--bg); border-radius: ${tileRadius - 2}px; padding: 10px 6px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px; font-weight: 600; font-size: 13px; text-align: center; min-height: 44px;
}
.preset svg { width: 22px; height: 22px; color: var(--p); }
:host([data-theme="dark"]) .preset svg { color: var(--fg); }
.preset:hover { border-color: var(--p); }
.preset[aria-pressed="true"] { border-color: var(--p); box-shadow: inset 0 0 0 1px var(--p); background: var(--p-soft); }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.tile {
  position: relative; border: none; text-align: start; cursor: pointer; border-radius: ${tileRadius}px; padding: 12px 12px 11px;
  background: var(--surface); min-height: 92px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;
  transition: background .15s ease, transform .1s ease;
}
.tile:hover { background: var(--hover); }
.tile:active { transform: scale(.98); }
.tile .ic { width: 26px; height: 26px; }
.tile .name { display: block; font-weight: 600; font-size: 14px; line-height: 1.3; }
.tile .level { display: block; font-size: 12px; color: var(--muted); min-height: 1.3em; }
.pips { position: absolute; top: 14px; inset-inline-end: 12px; display: flex; gap: 4px; }
.pips i { width: 7px; height: 7px; border-radius: 50%; background: var(--line); }
.check { position: absolute; top: 10px; inset-inline-end: 10px; width: 20px; height: 20px; border-radius: 50%; display: none; place-items: center; background: var(--acc); color: var(--on-acc); }
.check svg { width: 13px; height: 13px; }
.tile[aria-pressed="true"] { background: var(--p); color: var(--on-p); }
.tile[aria-pressed="true"] .level { color: var(--level-on-p); }
.tile[aria-pressed="true"] .pips i { background: var(--pip-on-p); }
.tile[aria-pressed="true"] .pips i[data-on="true"] { background: var(--acc); }
.tile[aria-pressed="true"] .check { display: grid; }
.tile[aria-pressed="true"]:focus-visible { outline-color: var(--fg); }
:host([data-theme="dark"]) .tile[aria-pressed="true"] { box-shadow: inset 0 0 0 1px rgba(255,255,255,.25); }

.footer { border-top: 1px solid var(--line); padding: 8px 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; font-size: 13px; flex-shrink: 0; }
.footer .text-btn { color: var(--muted); font-weight: 500; }
.link { color: var(--fg); text-underline-offset: 3px; padding: 8px 10px; border-radius: 8px; }
.brand { margin-inline-start: auto; color: var(--muted); font-size: 12px; padding: 6px 8px; }
.brand b { color: var(--fg); }

.toast {
  position: fixed; z-index: 2147483647; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
  background: var(--fg); color: var(--bg); border-radius: 12px; padding-block: 8px; padding-inline: 14px 8px;
  display: flex; align-items: center; gap: 12px; font-size: 14px; max-width: calc(100vw - 32px);
  box-shadow: 0 12px 30px -8px rgba(0,0,0,.4); animation: a11y-in .2s ease;
}
.toast button { border: none; background: var(--muted); color: var(--bg); font-weight: 700; padding: 8px 12px; border-radius: 8px; cursor: pointer; }

@media (max-width: 640px) {
  .panel {
    inset: auto 0 0 0 !important; width: 100% !important; max-height: 88vh;
    border-radius: var(--r) var(--r) 0 0; padding-bottom: env(safe-area-inset-bottom, 0px);
    animation-name: a11y-up;
  }
  @keyframes a11y-up { from { transform: translateY(100%); } }
  .handle { display: block; touch-action: none; padding: 10px 0 2px; cursor: grab; }
  .handle::before { content: ""; display: block; width: 40px; height: 5px; border-radius: 3px; background: var(--line); margin: 0 auto; }
  .header { padding-top: 6px; }
  .toast { top: calc(12px + env(safe-area-inset-top, 0px)); bottom: auto; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}
`;
}

/** Physical sides on purpose: "bottom-right" means the same corner on RTL and LTR pages. */
export function positionStyles(
  position: WidgetPosition,
  offset: { x: number; y: number } = { x: 20, y: 20 },
  buttonSize = 56,
): { fab: string; panel: string } {
  const [vertical, horizontal] = position.split("-") as ["top" | "bottom", "left" | "right"];
  const x = `calc(${offset.x}px + env(safe-area-inset-${horizontal}, 0px))`;
  const y = `calc(${offset.y}px + env(safe-area-inset-${vertical}, 0px))`;
  const panelGap = `calc(${offset.y + buttonSize + 14}px + env(safe-area-inset-${vertical}, 0px))`;
  const dy = vertical === "top" ? "-8px" : "8px";
  return {
    fab: `${horizontal}:${x}; ${vertical}:${y};`,
    panel: `${horizontal}:${x}; ${vertical}:${panelGap}; transform-origin:${vertical} ${horizontal}; --dy:${dy};`,
  };
}
