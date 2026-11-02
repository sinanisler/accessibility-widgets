import type { WidgetConfig } from "@a11y/core";
import {
  isReleasedFeature,
  mergeWidgetConfig,
  pathMatches,
  resolveFeatureList,
} from "@a11y/core";
import { AccessibilityStore } from "./state/store.js";
import { FeatureRegistry } from "./features/registry.js";
import { createPanel, type PanelApi } from "./ui/panel.js";
import { track } from "./analytics.js";

declare global {
  interface Window {
    ACCESSIBILITY_WIDGET_CONFIG?: Partial<WidgetConfig>;
    AccessibilityWidget?: { init: typeof initAccessibilityWidget };
    __MUNEER_PREVIEW__?: boolean;
  }
}

const CONFIG_CACHE_KEY = "a11y-platform-config-cache-v1";
const SESSION_HIDE_KEY = "a11y-platform-session-hide";
const PREVIEW_MESSAGE = "muneer:preview-config";
const FETCH_TIMEOUT_MS = 1200;

let activePanel: PanelApi | null = null;
let activeStore: AccessibilityStore | null = null;
let pathWatcherAttached = false;
let previewListenerAttached = false;

function announce(message: string): void {
  let live = document.getElementById("a11y-live-region");
  if (!live) {
    live = document.createElement("div");
    live.id = "a11y-live-region";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    Object.assign(live.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
    });
    document.body.appendChild(live);
  }
  live.textContent = "";
  requestAnimationFrame(() => {
    live!.textContent = message;
  });
}

function readCachedConfig(siteKey?: string): Partial<WidgetConfig> | null {
  if (!siteKey) return null;
  try {
    const raw = sessionStorage.getItem(CONFIG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { siteKey: string; config: Partial<WidgetConfig>; at: number };
    if (parsed.siteKey !== siteKey) return null;
    if (Date.now() - parsed.at > 5 * 60_000) return null;
    return parsed.config;
  } catch {
    return null;
  }
}

function writeCachedConfig(siteKey: string | undefined, config: Partial<WidgetConfig>): void {
  if (!siteKey) return;
  try {
    sessionStorage.setItem(
      CONFIG_CACHE_KEY,
      JSON.stringify({ siteKey, config, at: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

async function fetchRemoteConfig(config: WidgetConfig): Promise<Partial<WidgetConfig>> {
  if (!config.siteKey || !config.apiBaseUrl) return {};
  const cached = readCachedConfig(config.siteKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${config.apiBaseUrl.replace(/\/$/, "")}/v1/config/${encodeURIComponent(config.siteKey)}`,
      { mode: "cors", signal: controller.signal },
    );
    if (!res.ok) return cached ?? {};
    const remote = (await res.json()) as Partial<WidgetConfig>;
    writeCachedConfig(config.siteKey, remote);
    return remote;
  } catch {
    return cached ?? {};
  } finally {
    clearTimeout(timer);
  }
}

function shouldMount(config: WidgetConfig): boolean {
  if (config.enabled === false) return false;
  if (sessionStorage.getItem(SESSION_HIDE_KEY) === "1") return false;
  if (pathMatches(window.location.pathname, config.excludedPaths)) return false;
  return true;
}

function detectLanguage(config: WidgetConfig): string {
  if (config.autoDetectLanguage) {
    const htmlLang = document.documentElement.lang?.slice(0, 2).toLowerCase();
    if (htmlLang) return htmlLang;
    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (nav) return nav;
  }
  return config.language || config.defaultLanguage || "ar";
}

function createFreshRegistry(): FeatureRegistry {
  return new FeatureRegistry(announce);
}

function filterRegistry(store: AccessibilityStore, registry: FeatureRegistry): void {
  const ordered = resolveFeatureList(store.config);
  const allowed = new Set(ordered.map((f) => f.id));
  registry.retain((id) => isReleasedFeature(id) && allowed.has(id));

  // Sort list by admin order by re-registering? FeatureRegistry.list is Map order.
  // We'll sort when passing to panel.
}

function orderedFeatures(store: AccessibilityStore, registry: FeatureRegistry) {
  const order = new Map(resolveFeatureList(store.config).map((f) => [f.id, f.order]));
  return registry
    .list()
    .filter((f) => order.has(f.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

function teardown(): void {
  activePanel?.destroy();
  activePanel = null;
  activeStore = null;
  const existing = document.getElementById("a11y-platform-root");
  existing?.remove();
  document.getElementById("a11y-platform-styles")?.remove();
}

function mountWidget(config: WidgetConfig): void {
  teardown();

  if (!shouldMount(config)) return;

  const store = new AccessibilityStore({
    ...config,
    language: detectLanguage(config),
  });
  activeStore = store;

  const registry = createFreshRegistry();
  filterRegistry(store, registry);

  const applyAll = () => {
    registry.applyState(store.getState());
    track(store.config, "apply", undefined);
  };

  const panel = createPanel(store, orderedFeatures(store, registry), () => {
    applyAll();
    track(store.config, "feature_toggle");
  }, {
    announce,
    onLanguageChange: (next) => {
      store.config = { ...store.config, language: next };
      panel.updateConfig(store.config);
    },
    onHideSession: () => {
      try {
        sessionStorage.setItem(SESSION_HIDE_KEY, "1");
      } catch {
        /* ignore */
      }
    },
  });

  activePanel = panel;
  document.body.appendChild(panel.host);
  applyAll();
  track(store.config, "widget_init");

  if (store.config.language && !document.documentElement.lang) {
    document.documentElement.lang = store.config.language;
  }
}

function attachPathWatcher(): void {
  if (pathWatcherAttached) return;
  pathWatcherAttached = true;

  const reevaluate = () => {
    if (!activeStore) return;
    const config = activeStore.config;
    if (!shouldMount(config)) {
      teardown();
    } else if (!document.getElementById("a11y-platform-root")) {
      mountWidget(config);
    }
  };

  const wrapHistory = (method: "pushState" | "replaceState") => {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args as never);
      window.dispatchEvent(new Event("a11y:location"));
      return result;
    };
  };
  wrapHistory("pushState");
  wrapHistory("replaceState");
  window.addEventListener("popstate", reevaluate);
  window.addEventListener("a11y:location", reevaluate);
}

function attachPreviewListener(): void {
  // Only host pages that opt into preview mode may accept configs via postMessage;
  // otherwise any framing/opening page could rewrite a customer's widget.
  if (previewListenerAttached || !window.__MUNEER_PREVIEW__) return;
  previewListenerAttached = true;
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    const data = event.data as { type?: string; config?: Partial<WidgetConfig> } | null;
    if (!data || data.type !== PREVIEW_MESSAGE || !data.config) return;
    const merged = mergeWidgetConfig({
      ...(window.ACCESSIBILITY_WIDGET_CONFIG ?? {}),
      ...data.config,
      persistPreferences: false,
      enableAnalytics: false,
    });
    mountWidget(merged);
  });
}

export async function initAccessibilityWidget(userConfig?: Partial<WidgetConfig>): Promise<void> {
  attachPathWatcher();
  attachPreviewListener();

  if (document.getElementById("a11y-platform-root") && !window.__MUNEER_PREVIEW__) return;

  const boot = mergeWidgetConfig({
    ...(window.ACCESSIBILITY_WIDGET_CONFIG ?? {}),
    ...(userConfig ?? {}),
  });
  const remote = await fetchRemoteConfig(boot);
  const config = mergeWidgetConfig({ ...boot, ...remote });

  mountWidget(config);
}

/** Hot-apply a draft config (used by dashboard preview iframe). */
export function applyPreviewConfig(partial: Partial<WidgetConfig>): void {
  window.__MUNEER_PREVIEW__ = true;
  mountWidget(
    mergeWidgetConfig({
      ...partial,
      persistPreferences: false,
      enableAnalytics: false,
    }),
  );
}

export function autoInit(): void {
  const run = () => {
    void initAccessibilityWidget();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
