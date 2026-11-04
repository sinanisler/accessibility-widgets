import {
  FEATURE_GROUPS,
  QUICK_PRESETS,
  activeCountLabel,
  getAllowedLevels,
  isRtl,
  levelLabelKey,
  tLabel,
  type FeatureLevel,
  type QuickPreset,
  type WidgetConfig,
} from "@a11y/core";
import type { AccessibilityStore } from "../state/store.js";
import type { FeatureModule } from "../features/types.js";
import { buttonIcon, icon } from "./icons.js";
import { panelStyles, positionStyles } from "./styles.js";

export interface PanelApi {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  destroy: () => void;
  updateConfig: (config: WidgetConfig) => void;
  setFeatures: (features: FeatureModule[]) => void;
  host: HTMLElement;
}

const TOAST_MS = 6000;
const DRAG_CLOSE_PX = 110;

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
    ),
  ).filter((el) => el.tabIndex >= 0 && !el.hasAttribute("disabled") && el.offsetParent !== null);
}

function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split("+").map((p) => p.trim());
  const key = parts[parts.length - 1]!;
  const needAlt = parts.includes("alt");
  const needCtrl = parts.includes("ctrl") || parts.includes("control");
  const needShift = parts.includes("shift");
  const needMeta = parts.includes("meta") || parts.includes("cmd");
  if (needAlt !== e.altKey) return false;
  if (needCtrl !== e.ctrlKey) return false;
  if (needShift !== e.shiftKey) return false;
  if (needMeta !== e.metaKey) return false;
  return e.key.toLowerCase() === key || e.code.toLowerCase() === `key${key}`;
}

const isOn = (v: FeatureLevel | null | undefined) => v !== undefined && v !== null && v !== false;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function button(className: string, attrs: Record<string, string> = {}): HTMLButtonElement {
  return el("button", className, { type: "button", ...attrs });
}

export function createPanel(
  store: AccessibilityStore,
  features: FeatureModule[],
  onApply: (featureId?: string) => void,
  options?: {
    onLanguageChange?: (lang: string) => void;
    onHideSession?: () => void;
    onRevealSession?: () => void;
    /** Re-apply state without counting it as a user action (undo after reset). */
    onRestore?: () => void;
    startHidden?: boolean;
    announce?: (msg: string) => void;
  },
): PanelApi {
  let featureList = [...features];
  let sessionHidden = Boolean(options?.startHidden);
  let toastTimer = 0;
  const announce = options?.announce ?? (() => undefined);

  const host = document.createElement("div");
  host.id = "a11y-platform-root";
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");

  const fab = button("fab", { "aria-expanded": "false", "aria-haspopup": "dialog" });
  const badge = el("span", "fab-badge", { "aria-hidden": "true" });

  const panel = el("div", "panel", { role: "dialog", "aria-modal": "true", "aria-labelledby": "a11y-title" });
  panel.hidden = true;

  const handle = el("div", "handle", { "aria-hidden": "true" });
  const header = el("div", "header");
  const title = el("h2", "title", { id: "a11y-title", tabindex: "-1" });
  const mark = el("span", "mark", { "aria-hidden": "true" });
  const titleText = el("span");
  title.append(mark, titleText);
  const langBtn = button("icon-btn", { "data-action": "lang" });
  const closeBtn = button("icon-btn", { "data-action": "close" });
  closeBtn.innerHTML = icon("close");
  header.append(title, langBtn, closeBtn);

  const summary = el("div", "summary");
  const summaryText = el("span", "summary-text");
  const resetBtn = button("text-btn", { "data-action": "reset" });
  summary.append(summaryText, resetBtn);

  const body = el("div", "body");

  const footer = el("div", "footer");
  const hideBtn = button("text-btn", { "data-action": "hide" });
  const statementLink = el("a", "link", { target: "_blank", rel: "noopener noreferrer" });
  const brand = el("span", "brand");
  footer.append(hideBtn, statementLink, brand);

  panel.append(handle, header, summary, body, footer);
  shadow.append(style, fab, panel);

  const tiles = new Map<string, { tile: HTMLButtonElement; level: HTMLElement; pips: HTMLElement[] }>();
  const presetButtons = new Map<string, HTMLButtonElement>();

  const lang = () => store.config.language || store.config.defaultLanguage || "ar";
  const label = (key: string) => tLabel(lang(), key, store.config.labels);
  const featureName = (f: FeatureModule) => label(f.labelKey);
  const levelName = (id: string, level: FeatureLevel) =>
    level === true ? label("active") : label(levelLabelKey(id, level));

  function activeCount(): number {
    const state = store.getState();
    return featureList.filter((f) => isOn(state[f.id])).length;
  }

  function logoNode(): Node {
    const url = store.config.logoUrl?.trim();
    if (url) {
      const img = document.createElement("img");
      img.alt = "";
      img.src = url;
      return img;
    }
    const wrap = document.createElement("template");
    wrap.innerHTML = buttonIcon(store.config.buttonIcon);
    return wrap.content.firstChild!;
  }

  function isMobile(): boolean {
    return typeof window.matchMedia === "function" && window.matchMedia("(max-width: 640px)").matches;
  }

  function applyChrome(): void {
    const cfg = store.config;
    const buttonSize = cfg.buttonSize ?? 56;
    const shape = cfg.buttonShape ?? "circle";
    const position = (isMobile() && cfg.mobile?.position) || cfg.position || "bottom-right";

    host.hidden = sessionHidden || Boolean(isMobile() && cfg.mobile?.hide);
    host.dataset.theme = cfg.theme || "light";

    style.textContent = panelStyles({
      primary: cfg.colors?.primary || "#2347C5",
      accent: cfg.colors?.accent || "#F2A900",
      background: cfg.colors?.background || "#FFFFFF",
      text: cfg.colors?.text || "#141821",
      width: cfg.widgetWidth || "400px",
      radius: cfg.radius ?? 16,
      buttonSize,
      shape,
    });

    const pos = positionStyles(position, cfg.offset || { x: 20, y: 20 }, buttonSize);
    fab.style.cssText = pos.fab;
    panel.style.cssText = pos.panel;
    panel.dir = isRtl(lang()) ? "rtl" : "ltr";
    panel.lang = lang();
    fab.dataset.shape = shape;

    fab.replaceChildren(logoNode());
    if (shape === "pill") {
      const text = el("span", "", { "aria-hidden": "true" });
      text.textContent = label("menuTitle");
      fab.append(text);
    }
    fab.append(badge);
    mark.replaceChildren(logoNode());

    titleText.textContent = label("menuTitle");
    closeBtn.setAttribute("aria-label", label("closeMenu"));
    resetBtn.textContent = label("resetShort");
    resetBtn.setAttribute("aria-label", label("reset"));
    hideBtn.textContent = label("hideWidget");
    const other = lang() === "ar" ? "en" : "ar";
    langBtn.textContent = other === "en" ? "EN" : "ع";
    langBtn.lang = other;
    langBtn.setAttribute("aria-label", other === "en" ? "English" : "العربية");
    const brandName = el("b");
    brandName.textContent = label("brandName");
    brand.replaceChildren(`${label("poweredBy")} `, brandName);

    const statementUrl = cfg.statementUrl?.trim();
    statementLink.hidden = !statementUrl;
    if (statementUrl) {
      statementLink.href = statementUrl;
      statementLink.textContent = label("accessibilityStatement");
    } else {
      statementLink.removeAttribute("href");
      statementLink.textContent = "";
    }
  }

  /** Presets only offer what this site allows, at the nearest allowed level. */
  function presetLevels(preset: QuickPreset): Record<string, FeatureLevel> {
    const out: Record<string, FeatureLevel> = {};
    for (const [id, wanted] of Object.entries(preset.features)) {
      if (!featureList.some((f) => f.id === id)) continue;
      const levels = getAllowedLevels(store.config, id);
      out[id] = levels.includes(wanted) ? wanted : levels[0] ?? true;
    }
    return out;
  }

  function presetActive(preset: QuickPreset): boolean {
    const levels = Object.entries(presetLevels(preset));
    return levels.length > 0 && levels.every(([id, level]) => store.get(id) === level);
  }

  function buildBody(): void {
    body.replaceChildren();
    tiles.clear();
    presetButtons.clear();

    const presets = store.config.quickPresets === false
      ? []
      : QUICK_PRESETS.filter((p) => Object.keys(presetLevels(p)).length >= 2);
    if (presets.length) {
      const section = el("section", "", { "aria-labelledby": "a11y-g-presets" });
      const heading = el("h3", "group-title", { id: "a11y-g-presets" });
      heading.textContent = label("quickSettings");
      const row = el("div", "presets");
      for (const p of presets) {
        const b = button("preset", { "data-preset": p.id, "aria-pressed": "false" });
        b.innerHTML = icon(p.id);
        b.append(el("span"));
        b.lastChild!.textContent = label(p.labelKey);
        b.addEventListener("click", () => togglePreset(p));
        presetButtons.set(p.id, b);
        row.append(b);
      }
      section.append(heading, row);
      body.append(section);
    }

    const grouped = new Set<string>();
    const groups: { id: string; labelKey: string; items: FeatureModule[] }[] = FEATURE_GROUPS.map((g) => {
      const ids = g.features as readonly string[];
      const items = featureList.filter((f) => ids.includes(f.id));
      items.forEach((f) => grouped.add(f.id));
      return { id: g.id, labelKey: g.labelKey, items };
    });
    const rest = featureList.filter((f) => !grouped.has(f.id));
    if (rest.length) groups.push({ id: "other", labelKey: rest[0]!.category, items: rest });

    for (const g of groups) {
      if (!g.items.length) continue;
      const section = el("section", "", { "aria-labelledby": `a11y-g-${g.id}` });
      const heading = el("h3", "group-title", { id: `a11y-g-${g.id}` });
      heading.textContent = label(g.labelKey);
      const grid = el("div", "grid");
      for (const f of g.items) grid.append(buildTile(f));
      section.append(heading, grid);
      body.append(section);
    }

    const first = tiles.values().next().value;
    if (first) first.tile.tabIndex = 0;
  }

  function buildTile(f: FeatureModule): HTMLButtonElement {
    const levels = getAllowedLevels(store.config, f.id);
    const multi = levels.length > 1;
    const tile = button("tile", {
      "data-id": f.id,
      "aria-pressed": "false",
      "aria-describedby": `a11y-lv-${f.id}`,
      tabindex: "-1",
    });
    tile.innerHTML = icon(f.id, "ic");
    const pips: HTMLElement[] = [];
    if (multi) {
      const wrap = el("span", "pips", { "aria-hidden": "true" });
      for (let i = 0; i < levels.length; i += 1) pips.push(wrap.appendChild(el("i")));
      tile.append(wrap);
    } else {
      const check = el("span", "check", { "aria-hidden": "true" });
      check.innerHTML = icon("check");
      tile.append(check);
    }
    const text = el("span");
    const name = el("span", "name");
    name.textContent = featureName(f);
    const level = el("span", "level", { id: `a11y-lv-${f.id}` });
    text.append(name, level);
    tile.append(text);
    tile.addEventListener("click", () => {
      setRoving(tile);
      cycle(f);
    });
    tiles.set(f.id, { tile, level, pips });
    return tile;
  }

  function updateFeatureStates(): void {
    const state = store.getState();
    for (const f of featureList) {
      const nodes = tiles.get(f.id);
      if (!nodes) continue;
      const levels = getAllowedLevels(store.config, f.id);
      const value = state[f.id];
      const active = isOn(value);
      const index = active ? levels.findIndex((l) => l === value) : -1;
      nodes.tile.setAttribute("aria-pressed", String(active));
      nodes.level.textContent = active ? levelName(f.id, value as FeatureLevel) : "";
      nodes.pips.forEach((pip, i) => (pip.dataset.on = String(active && i <= index)));
    }
    for (const p of QUICK_PRESETS) {
      presetButtons.get(p.id)?.setAttribute("aria-pressed", String(presetActive(p)));
    }

    const count = activeCount();
    summary.hidden = count === 0;
    summaryText.textContent = count ? activeCountLabel(lang(), count) : "";
    badge.textContent = String(count);
    badge.dataset.empty = String(count === 0);
    fab.dataset.on = String(count > 0);
    fab.setAttribute(
      "aria-label",
      count > 0 ? `${label("openMenu")} (${activeCountLabel(lang(), count)})` : label("openMenu"),
    );
  }

  /** One control per feature: each press moves to the next level, then back to off. */
  function cycle(f: FeatureModule): void {
    const levels = getAllowedLevels(store.config, f.id);
    const current = store.get(f.id);
    const index = isOn(current) ? levels.findIndex((l) => l === current) : -1;
    const next = index + 1 < levels.length ? levels[index + 1]! : null;
    store.set(f.id, next);
    onApply(f.id);
    updateFeatureStates();
    if (next === null) {
      announce(`${featureName(f)}: ${label("featureOff")}`);
    } else if (levels.length > 1) {
      const position = label("levelOf")
        .replace("{n}", String(index + 2))
        .replace("{total}", String(levels.length));
      announce(`${featureName(f)}: ${levelName(f.id, next)}، ${position}`);
    } else {
      announce(`${featureName(f)}: ${label("featureOn")}`);
    }
  }

  function togglePreset(preset: QuickPreset): void {
    const levels = presetLevels(preset);
    const turnOff = presetActive(preset);
    store.setMany(
      Object.fromEntries(Object.entries(levels).map(([id, level]) => [id, turnOff ? null : level])),
    );
    onApply(`preset-${preset.id}`);
    updateFeatureStates();
    announce(`${label(preset.labelKey)}: ${label(turnOff ? "featureOff" : "featureOn")}`);
  }

  function setRoving(target: HTMLButtonElement): void {
    for (const { tile } of tiles.values()) tile.tabIndex = tile === target ? 0 : -1;
  }

  function showToast(message: string, action?: { label: string; run: () => void }): void {
    clearTimeout(toastTimer);
    shadow.querySelector(".toast")?.remove();
    const toast = el("div", "toast", { role: "status" });
    toast.dir = panel.dir;
    toast.lang = lang();
    toast.append(el("span"));
    toast.firstChild!.textContent = message;
    if (action) {
      const b = button("");
      b.textContent = action.label;
      b.addEventListener("click", () => {
        toast.remove();
        action.run();
      });
      toast.append(b);
    }
    shadow.append(toast);
    toastTimer = window.setTimeout(() => toast.remove(), TOAST_MS);
  }

  function bindDrag(): void {
    let startY: number | null = null;
    let dy = 0;
    handle.addEventListener("pointerdown", (e) => {
      startY = e.clientY;
      dy = 0;
      handle.setPointerCapture?.(e.pointerId);
      panel.style.transition = "none";
    });
    handle.addEventListener("pointermove", (e) => {
      if (startY === null) return;
      dy = Math.max(0, e.clientY - startY);
      panel.style.transform = `translateY(${dy}px)`;
    });
    const end = () => {
      if (startY === null) return;
      startY = null;
      panel.style.transition = "transform .2s";
      panel.style.transform = "";
      if (dy > DRAG_CLOSE_PX) api.close();
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  function sync(): void {
    applyChrome();
    buildBody();
    updateFeatureStates();
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !panel.hidden) {
      e.preventDefault();
      api.close();
      return;
    }

    const shortcut = store.config.openShortcut || "Alt+A";
    if (matchesShortcut(e, shortcut)) {
      e.preventDefault();
      if (sessionHidden) {
        sessionHidden = false;
        options?.onRevealSession?.();
        applyChrome();
        api.open();
      } else if (!host.hidden) {
        api.toggle();
      }
      return;
    }

    if (panel.hidden) return;
    const active = shadow.activeElement as HTMLElement | null;

    if (active?.classList.contains("tile")) {
      const all = Array.from(tiles.values()).map((n) => n.tile);
      const i = all.indexOf(active as HTMLButtonElement);
      const rtl = panel.dir === "rtl";
      const steps: Record<string, number> = {
        ArrowRight: rtl ? -1 : 1,
        ArrowLeft: rtl ? 1 : -1,
        ArrowDown: 2,
        ArrowUp: -2,
      };
      let j: number | null = null;
      if (e.key in steps) j = Math.min(all.length - 1, Math.max(0, i + steps[e.key]!));
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = all.length - 1;
      if (j !== null) {
        e.preventDefault();
        setRoving(all[j]!);
        all[j]!.focus();
        return;
      }
    }

    if (e.key !== "Tab") return;
    const focusables = getFocusable(panel);
    if (!focusables.length) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const outside = !active || !focusables.includes(active);
    if (outside) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const api: PanelApi = {
    host,
    open() {
      panel.hidden = false;
      fab.setAttribute("aria-expanded", "true");
      updateFeatureStates();
      title.focus();
    },
    close() {
      if (panel.hidden) return;
      fab.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      fab.focus();
    },
    toggle() {
      if (panel.hidden) api.open();
      else api.close();
    },
    isOpen() {
      return !panel.hidden;
    },
    destroy() {
      clearTimeout(toastTimer);
      document.removeEventListener("keydown", onKeyDown);
      host.remove();
    },
    updateConfig(config) {
      store.config = config;
      sync();
    },
    setFeatures(next) {
      featureList = [...next];
      sync();
    },
  };

  closeBtn.onclick = () => api.close();
  resetBtn.onclick = () => {
    const before = store.getState();
    store.reset();
    onApply();
    updateFeatureStates();
    announce(label("resetDone"));
    showToast(label("resetDone"), {
      label: label("undo"),
      run: () => {
        store.setMany(before);
        (options?.onRestore ?? onApply)();
        updateFeatureStates();
      },
    });
    (tiles.values().next().value?.tile ?? title).focus();
  };
  hideBtn.onclick = () => {
    options?.onHideSession?.();
    api.close();
    sessionHidden = true;
    host.hidden = true;
    announce(label("hiddenHint").replace("{shortcut}", store.config.openShortcut || "Alt+A"));
  };
  langBtn.onclick = () => {
    const next = lang() === "ar" ? "en" : "ar";
    store.config = { ...store.config, language: next };
    options?.onLanguageChange?.(next);
    sync();
    if (!panel.hidden) langBtn.focus();
  };
  fab.onclick = () => api.toggle();
  bindDrag();

  document.addEventListener("keydown", onKeyDown);

  sync();
  return api;
}
