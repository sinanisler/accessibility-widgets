import {
  getAllowedLevels,
  isRtl,
  tLabel,
  type FeatureLevel,
  type WidgetConfig,
} from "@a11y/core";
import type { AccessibilityStore } from "../state/store.js";
import type { FeatureModule } from "../features/types.js";
import { buttonIconSvg, panelStyles, positionStyles } from "./styles.js";

export interface PanelApi {
  open: () => void;
  close: () => void;
  toggle: () => void;
  destroy: () => void;
  updateConfig: (config: WidgetConfig) => void;
  setFeatures: (features: FeatureModule[]) => void;
  host: HTMLElement;
}

function formatLevel(level: FeatureLevel): string {
  if (level === true) return "";
  return String(level);
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
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

export function createPanel(
  store: AccessibilityStore,
  features: FeatureModule[],
  onApply: () => void,
  options?: {
    onLanguageChange?: (lang: string) => void;
    onHideSession?: () => void;
    announce?: (msg: string) => void;
  },
): PanelApi {
  let featureList = [...features];
  const announce = options?.announce ?? (() => undefined);

  const host = document.createElement("div");
  host.id = "a11y-platform-root";
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  shadow.appendChild(style);

  const fab = document.createElement("button");
  fab.className = "fab";
  fab.type = "button";
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-haspopup", "dialog");

  const badge = document.createElement("span");
  badge.className = "fab-badge";
  badge.setAttribute("aria-hidden", "true");
  fab.appendChild(badge);

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");

  const live = document.createElement("div");
  live.className = "live";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");

  const header = document.createElement("div");
  header.className = "header";

  const title = document.createElement("h2");
  title.className = "title";
  title.id = "a11y-title";
  title.tabIndex = -1;

  const headerActions = document.createElement("div");
  headerActions.className = "header-actions";

  const langBtn = document.createElement("button");
  langBtn.className = "btn btn-ghost";
  langBtn.type = "button";
  langBtn.dataset.action = "lang";

  const closeBtn = document.createElement("button");
  closeBtn.className = "btn btn-ghost";
  closeBtn.type = "button";
  closeBtn.dataset.action = "close";

  headerActions.append(langBtn, closeBtn);
  header.append(title, headerActions);

  const list = document.createElement("div");
  list.className = "list";
  list.setAttribute("role", "list");

  const footer = document.createElement("div");
  footer.className = "footer";

  const resetBtn = document.createElement("button");
  resetBtn.className = "btn btn-ghost";
  resetBtn.type = "button";
  resetBtn.dataset.action = "reset";

  const hideBtn = document.createElement("button");
  hideBtn.className = "btn btn-ghost";
  hideBtn.type = "button";
  hideBtn.dataset.action = "hide";

  const statementLink = document.createElement("a");
  statementLink.className = "link";
  statementLink.target = "_blank";
  statementLink.rel = "noopener noreferrer";

  footer.append(resetBtn, hideBtn, statementLink);

  panel.append(header, list, footer, live);
  shadow.append(style, fab, panel);

  const featureNodes = new Map<
    string,
    {
      row: HTMLElement;
      switchBtn: HTMLButtonElement;
      decBtn: HTMLButtonElement;
      incBtn: HTMLButtonElement;
      levelValue: HTMLElement;
      label: HTMLElement;
      meta: HTMLElement;
      controls: HTMLElement;
    }
  >();

  function lang(): string {
    return store.config.language || store.config.defaultLanguage || "ar";
  }

  function label(key: string): string {
    return tLabel(lang(), key, store.config.labels);
  }

  function activeCount(): number {
    const state = store.getState();
    return featureList.filter((f) => {
      const v = state[f.id];
      return v !== undefined && v !== null && v !== false;
    }).length;
  }

  function applyChrome(): void {
    const cfg = store.config;
    const primary = cfg.colors?.primary || "#0B5FFF";
    const width = cfg.widgetWidth || "380px";
    const radius = cfg.radius ?? 16;
    const buttonSize = cfg.buttonSize ?? 56;
    const theme = cfg.theme || "light";
    const background = cfg.colors?.background || "#FFFFFF";
    const text = cfg.colors?.text || "#111827";
    const offset = cfg.offset || { x: 20, y: 20 };

    const isMobile =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 640px)").matches;
    const position =
      (isMobile && cfg.mobile?.position) || cfg.position || "bottom-right";

    if (isMobile && cfg.mobile?.hide) {
      host.hidden = true;
    } else {
      host.hidden = false;
    }

    style.textContent = panelStyles({
      primary,
      width,
      radius,
      buttonSize,
      theme,
      background,
      text,
    });

    const pos = positionStyles(position, offset, buttonSize);
    fab.style.cssText = pos.fab;
    panel.style.cssText = pos.panel;
    panel.dir = isRtl(lang()) ? "rtl" : "ltr";

    // Rebuild icon (keep badge)
    const existingBadge = fab.querySelector(".fab-badge");
    fab.innerHTML = buttonIconSvg(cfg.buttonIcon || "person");
    if (existingBadge) fab.appendChild(existingBadge);
    else fab.appendChild(badge);

    fab.setAttribute("aria-label", label("openMenu"));
    panel.setAttribute("aria-label", label("menuTitle"));
    panel.setAttribute("aria-labelledby", "a11y-title");
    title.textContent = label("menuTitle");
    closeBtn.textContent = label("closeMenu");
    resetBtn.textContent = label("reset");
    hideBtn.textContent = label("hideWidget");
    langBtn.textContent = lang() === "ar" ? "EN" : "عربي";
    langBtn.setAttribute("aria-label", label("switchLanguage"));

    const statementUrl = cfg.statementUrl?.trim();
    if (statementUrl) {
      statementLink.hidden = false;
      statementLink.href = statementUrl;
      statementLink.textContent = label("accessibilityStatement");
    } else {
      statementLink.hidden = true;
      statementLink.removeAttribute("href");
      statementLink.textContent = "";
    }

    const count = activeCount();
    badge.textContent = String(count);
    badge.dataset.empty = count === 0 ? "true" : "false";
    fab.setAttribute(
      "aria-label",
      count > 0 ? `${label("openMenu")} (${count} ${label("featuresActive")})` : label("openMenu"),
    );
  }

  function ensureFeatureRows(): void {
    list.innerHTML = "";
    featureNodes.clear();

    for (const f of featureList) {
      const row = document.createElement("div");
      row.className = "feature";
      row.setAttribute("role", "listitem");
      row.dataset.id = f.id;

      const textWrap = document.createElement("div");
      const labelEl = document.createElement("span");
      labelEl.className = "label";
      const meta = document.createElement("span");
      meta.className = "meta";
      textWrap.append(labelEl, meta);

      const controls = document.createElement("div");
      controls.className = "feature-controls";

      const switchBtn = document.createElement("button");
      switchBtn.className = "switch";
      switchBtn.type = "button";
      switchBtn.setAttribute("role", "switch");

      const decBtn = document.createElement("button");
      decBtn.className = "level-btn";
      decBtn.type = "button";
      decBtn.textContent = "−";
      decBtn.setAttribute("aria-label", label("decrease"));

      const levelValue = document.createElement("span");
      levelValue.className = "level-value";

      const incBtn = document.createElement("button");
      incBtn.className = "level-btn";
      incBtn.type = "button";
      incBtn.textContent = "+";
      incBtn.setAttribute("aria-label", label("increase"));

      controls.append(decBtn, levelValue, incBtn, switchBtn);
      row.append(textWrap, controls);
      list.appendChild(row);

      featureNodes.set(f.id, { row, switchBtn, decBtn, incBtn, levelValue, label: labelEl, meta, controls });

      switchBtn.addEventListener("click", () => {
        const levels = getAllowedLevels(store.config, f.id);
        const current = store.get(f.id);
        const active = current !== null && current !== undefined && current !== false;
        if (active) {
          store.set(f.id, null);
          announce(`${label(f.labelKey)}: ${label("featureOff")}`);
        } else {
          store.set(f.id, levels[0] ?? true);
          announce(`${label(f.labelKey)}: ${label("featureOn")}`);
        }
        onApply();
        updateFeatureStates();
      });

      decBtn.addEventListener("click", () => {
        const levels = getAllowedLevels(store.config, f.id);
        const current = store.get(f.id);
        if (current === null || current === undefined || current === false) return;
        const idx = levels.findIndex((l) => l === current);
        if (idx <= 0) {
          store.set(f.id, null);
          announce(`${label(f.labelKey)}: ${label("featureOff")}`);
        } else {
          store.set(f.id, levels[idx - 1]!);
          announce(`${label(f.labelKey)}: ${formatLevel(levels[idx - 1]!)}`);
        }
        onApply();
        updateFeatureStates();
      });

      incBtn.addEventListener("click", () => {
        const levels = getAllowedLevels(store.config, f.id);
        const current = store.get(f.id);
        if (current === null || current === undefined || current === false) {
          store.set(f.id, levels[0] ?? true);
          announce(`${label(f.labelKey)}: ${label("featureOn")}`);
        } else {
          const idx = levels.findIndex((l) => l === current);
          if (idx >= 0 && idx < levels.length - 1) {
            store.set(f.id, levels[idx + 1]!);
            announce(`${label(f.labelKey)}: ${formatLevel(levels[idx + 1]!)}`);
          }
        }
        onApply();
        updateFeatureStates();
      });
    }
  }

  function updateFeatureStates(): void {
    const state = store.getState();
    for (const f of featureList) {
      const nodes = featureNodes.get(f.id);
      if (!nodes) continue;
      const levels = getAllowedLevels(store.config, f.id);
      const val = state[f.id];
      const active = val !== undefined && val !== null && val !== false;
      const multi = levels.length > 1 || (levels.length === 1 && levels[0] !== true);

      nodes.row.dataset.active = String(active);
      nodes.label.textContent = label(f.labelKey);
      nodes.switchBtn.setAttribute("aria-checked", String(active));
      nodes.switchBtn.setAttribute("aria-label", label(f.labelKey));

      if (active) {
        const levelText = formatLevel(val as FeatureLevel);
        nodes.meta.textContent = levelText
          ? `${label("active")}: ${levelText}`
          : label("active");
        nodes.levelValue.textContent = levelText || "✓";
      } else {
        nodes.meta.textContent = label("inactive");
        nodes.levelValue.textContent = "—";
      }

      nodes.decBtn.hidden = !multi;
      nodes.incBtn.hidden = !multi;
      nodes.levelValue.hidden = !multi;
      if (multi) {
        const idx = active ? levels.findIndex((l) => l === val) : -1;
        nodes.decBtn.disabled = !active;
        nodes.incBtn.disabled = active && idx >= levels.length - 1;
      }
    }

    const count = activeCount();
    badge.textContent = String(count);
    badge.dataset.empty = count === 0 ? "true" : "false";
  }

  function sync(): void {
    applyChrome();
    ensureFeatureRows();
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
      api.toggle();
      return;
    }

    if (panel.hidden || e.key !== "Tab") return;
    const focusables = getFocusable(panel);
    if (!focusables.length) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = shadow.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
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
      panel.hidden = true;
      fab.setAttribute("aria-expanded", "false");
      fab.focus();
    },
    toggle() {
      if (panel.hidden) api.open();
      else api.close();
    },
    destroy() {
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
    store.reset();
    onApply();
    updateFeatureStates();
    announce(label("resetDone"));
  };
  hideBtn.onclick = () => {
    options?.onHideSession?.();
    api.close();
    host.hidden = true;
  };
  langBtn.onclick = () => {
    const next = lang() === "ar" ? "en" : "ar";
    store.config = { ...store.config, language: next };
    options?.onLanguageChange?.(next);
    sync();
    if (!panel.hidden) title.focus();
  };
  fab.onclick = () => api.toggle();

  document.addEventListener("keydown", onKeyDown);

  sync();
  return api;
}
