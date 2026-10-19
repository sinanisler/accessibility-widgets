import type { WidgetPosition, WidgetTheme } from "@a11y/core";

export function panelStyles(opts: {
  primary: string;
  width: string;
  radius: number;
  buttonSize: number;
  theme: WidgetTheme;
  background: string;
  text: string;
}): string {
  const { primary, width, radius, buttonSize, theme, background, text } = opts;
  const isDark =
    theme === "dark" ||
    (theme === "auto" &&
      typeof matchMedia === "function" &&
      matchMedia("(prefers-color-scheme: dark)").matches);

  const bg = isDark ? "#111827" : background;
  const fg = isDark ? "#F9FAFB" : text;
  const muted = isDark ? "#9CA3AF" : "#6b7280";
  const border = isDark ? "#374151" : "#e5e7eb";
  const surface = isDark ? "#1F2937" : "#f9fafb";
  const activeBg = isDark ? "#1e3a5f" : "#eff6ff";

  return `
:host { all: initial; }
* { box-sizing: border-box; font-family: Tajawal, system-ui, -apple-system, sans-serif; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}
.fab {
  position: fixed;
  width: ${buttonSize}px; height: ${buttonSize}px; border-radius: 50%;
  background: ${primary}; color: #fff; border: none;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  cursor: pointer; z-index: 2147483647;
  display: grid; place-items: center;
  min-width: 44px; min-height: 44px;
}
.fab:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.fab-badge {
  position: absolute; top: -2px; inset-inline-end: -2px;
  min-width: 20px; height: 20px; padding: 0 5px;
  border-radius: 999px; background: #ef4444; color: #fff;
  font-size: 11px; font-weight: 700; display: grid; place-items: center;
  border: 2px solid #fff;
}
.fab-badge[data-empty="true"] { display: none; }
.panel {
  position: fixed; width: min(${width}, calc(100vw - 24px));
  max-height: min(80vh, 640px); overflow: auto;
  background: ${bg}; color: ${fg};
  border-radius: ${radius}px; box-shadow: 0 20px 50px rgba(0,0,0,.28);
  z-index: 2147483647; padding: 12px;
  border: 1px solid ${border};
  display: flex; flex-direction: column; gap: 8px;
}
.header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.title { font-weight:700; font-size:1.05rem; margin:0; outline: none; }
.header-actions { display:flex; gap:6px; align-items:center; }
.list { display:flex; flex-direction:column; gap:8px; flex:1; }
.feature {
  border:1px solid ${border}; border-radius:12px; padding:12px;
  background:${isDark ? "#1F2937" : "#fff"};
  display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center;
  min-height:56px;
}
.feature[data-active="true"] { border-color:${primary}; background:${activeBg}; }
.feature .label { font-size:14px; font-weight:600; display:block; }
.feature .meta { font-size:12px; color:${muted}; margin-top:2px; }
.feature-controls { display:flex; align-items:center; gap:6px; }
.switch {
  width:48px; height:28px; border-radius:999px; border:none;
  background:#d1d5db; cursor:pointer; position:relative; flex-shrink:0;
  min-width:44px; min-height:28px;
}
.switch[aria-checked="true"] { background:${primary}; }
.switch::after {
  content:""; position:absolute; top:3px; inset-inline-start:3px;
  width:22px; height:22px; border-radius:50%; background:#fff;
  transition: transform .15s ease;
}
.switch[aria-checked="true"]::after { transform: translateX(20px); }
[dir="rtl"] .switch[aria-checked="true"]::after { transform: translateX(-20px); }
.level-btn {
  width:36px; height:36px; min-width:36px; min-height:36px;
  border-radius:10px; border:1px solid ${border};
  background:${surface}; color:${fg}; cursor:pointer; font-weight:700; font-size:16px;
}
.level-btn:disabled { opacity:.4; cursor:not-allowed; }
.level-value { font-size:12px; min-width:48px; text-align:center; color:${muted}; }
.footer { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
.btn {
  border:none; border-radius:10px; padding:10px 12px;
  cursor:pointer; font-weight:600; font-size:13px;
  min-height:44px;
}
.btn-primary { background:${primary}; color:#fff; }
.btn-ghost { background:${surface}; color:${fg}; border:1px solid ${border}; }
.link {
  font-size:12px; color:${primary}; text-decoration:underline;
  padding:8px 0; display:inline-block;
}
.live { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
@media (max-width:640px) {
  .panel {
    inset: auto 0 0 0 !important;
    width: 100% !important;
    max-height: min(85vh, 720px);
    border-radius: ${radius}px ${radius}px 0 0;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
`;
}

export function positionStyles(
  position: WidgetPosition,
  offset: { x: number; y: number } = { x: 20, y: 20 },
  buttonSize = 56,
): { fab: string; panel: string } {
  const x = `${offset.x}px`;
  const y = `${offset.y}px`;
  const panelGap = `${offset.y + buttonSize + 12}px`;
  const map: Record<WidgetPosition, { fab: string; panel: string }> = {
    "bottom-right": {
      fab: `inset-inline-end:${x}; bottom:${y};`,
      panel: `inset-inline-end:${x}; bottom:${panelGap};`,
    },
    "bottom-left": {
      fab: `inset-inline-start:${x}; bottom:${y};`,
      panel: `inset-inline-start:${x}; bottom:${panelGap};`,
    },
    "top-right": {
      fab: `inset-inline-end:${x}; top:${y};`,
      panel: `inset-inline-end:${x}; top:${panelGap};`,
    },
    "top-left": {
      fab: `inset-inline-start:${x}; top:${y};`,
      panel: `inset-inline-start:${x}; top:${panelGap};`,
    },
  };
  return map[position];
}

export function buttonIconSvg(icon: string): string {
  switch (icon) {
    case "a11y":
      return `<svg class="a11y-keep" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="white"/><path d="M4 9h16M12 9v11M8 20l4-6 4 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "eye":
      return `<svg class="a11y-keep" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`;
    case "text":
      return `<svg class="a11y-keep" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M8 6v12M16 6v12M6 18h4M14 18h4" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
    case "person":
    default:
      return `<svg class="a11y-keep" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><circle cx="12" cy="8" r="2" fill="white"/><path d="M7 18c1.5-3 8.5-3 10 0" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
}
