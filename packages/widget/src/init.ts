import type { FeatureState, WidgetConfig } from "@a11y/core";
import {
  isReleasedFeature,
  isSupportedLanguage,
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

const CONFIG_CACHE_KEY = "a11y-platform-config-cache-v2";
const CONFIG_CACHE_TTL_MS = 24 * 60 * 60_000;
const SESSION_HIDE_KEY = "a11y-platform-session-hide";
const LANGUAGE_KEY = "a11y-platform-language";
const PREVIEW_MESSAGE = "muneer:preview-config";
const FETCH_TIMEOUT_MS = 3000;

// Only available while the script first runs, so it is captured at load time.
const loaderScript =
  typeof document !== "undefined" ? (document.currentScript as HTMLScriptElement | null) : null;

type RemoteResult =
  | { status: "ok"; config: Partial<WidgetConfig> }
  | { status: "denied" }
  | { status: "unavailable" };

type MountOptions = { preserve?: boolean };

let activePanel: PanelApi | null = null;
let activeStore: AccessibilityStore | null = null;
let activeRegistry: FeatureRegistry | null = null;
let lastConfig: WidgetConfig | null = null;
let pathWatcherAttached = false;
let previewListenerAttached = false;

function readStorage(kind: "localStorage" | "sessionStorage", key: string): string | null {
  try {
    return window[kind].getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(
  kind: "localStorage" | "sessionStorage",
  key: string,
  value: string | null,
): void {
  try {
    if (value === null) window[kind].removeItem(key);
    else window[kind].setItem(key, value);
  } catch {
    /* blocked or full storage must never affect the host page */
  }
}

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
  const raw = readStorage("localStorage", CONFIG_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { siteKey: string; config: Partial<WidgetConfig>; at: number };
    if (parsed.siteKey !== siteKey) return null;
    if (Date.now() - parsed.at > CONFIG_CACHE_TTL_MS) return null;
    return parsed.config;
  } catch {
    return null;
  }
}

function writeCachedConfig(siteKey: string, config: Partial<WidgetConfig>): void {
  writeStorage("localStorage", CONFIG_CACHE_KEY, JSON.stringify({ siteKey, config, at: Date.now() }));
}

async function fetchRemoteConfig(siteKey: string, apiBaseUrl: string): Promise<RemoteResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/v1/config/${encodeURIComponent(siteKey)}`,
      { mode: "cors", signal: controller.signal },
    );
    if (res.status === 403 || res.status === 404) return { status: "denied" };
    if (!res.ok) return { status: "unavailable" };
    return { status: "ok", config: (await res.json()) as Partial<WidgetConfig> };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

/** `<script data-site-key data-api data-lang>`, the snippet the dashboard hands out. */
function scriptConfig(): Partial<WidgetConfig> {
  const script =
    loaderScript ?? document.querySelector<HTMLScriptElement>("script[data-site-key]");
  if (!script) return {};
  const { siteKey, api, lang } = script.dataset;
  return {
    ...(siteKey ? { siteKey } : {}),
    ...(api ? { apiBaseUrl: api } : {}),
    ...(lang ? { language: lang } : {}),
  };
}

function shouldMount(config: WidgetConfig): boolean {
  if (config.enabled === false) return false;
  if (pathMatches(window.location.pathname, config.excludedPaths)) return false;
  return true;
}

function detectLanguage(config: WidgetConfig): string {
  const saved = config.persistPreferences !== false ? readStorage("localStorage", LANGUAGE_KEY) : null;
  const candidates = [
    saved,
    config.autoDetectLanguage ? document.documentElement.lang?.slice(0, 2).toLowerCase() : null,
    config.autoDetectLanguage ? navigator.language?.slice(0, 2).toLowerCase() : null,
    config.language,
    config.defaultLanguage,
  ];
  return candidates.find((lang) => lang && isSupportedLanguage(lang)) ?? "en";
}

function filterRegistry(store: AccessibilityStore, registry: FeatureRegistry): void {
  const allowed = new Set(resolveFeatureList(store.config).map((f) => f.id));
  registry.retain((id) => isReleasedFeature(id) && allowed.has(id));
}

function orderedFeatures(store: AccessibilityStore, registry: FeatureRegistry) {
  const order = new Map(resolveFeatureList(store.config).map((f) => [f.id, f.order]));
  return registry
    .list()
    .filter((f) => order.has(f.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

function teardown(): void {
  activeRegistry?.applyState({});
  activeRegistry = null;
  activePanel?.destroy();
  activePanel = null;
  activeStore = null;
  document.getElementById("a11y-platform-root")?.remove();
  document.getElementById("a11y-platform-styles")?.remove();
}

function mountWidget(config: WidgetConfig, options: MountOptions = {}): void {
  const previous: { state: FeatureState; open: boolean } | null =
    options.preserve && activeStore
      ? { state: activeStore.getState(), open: activePanel?.isOpen() ?? false }
      : null;

  teardown();
  lastConfig = config;

  if (!shouldMount(config)) return;

  const store = new AccessibilityStore({
    ...config,
    language: detectLanguage(config),
  });
  if (previous) store.setMany(previous.state);
  activeStore = store;

  const registry = new FeatureRegistry(announce);
  activeRegistry = registry;
  filterRegistry(store, registry);

  const applyAll = () => {
    registry.applyState(store.getState());
  };

  const panel = createPanel(
    store,
    orderedFeatures(store, registry),
    (featureId) => {
      applyAll();
      track(store.config, featureId ? "feature_toggle" : "reset", featureId);
    },
    {
      announce,
      startHidden: readStorage("sessionStorage", SESSION_HIDE_KEY) === "1",
      onLanguageChange: (next) => {
        store.config = { ...store.config, language: next };
        panel.updateConfig(store.config);
        if (store.config.persistPreferences !== false) {
          writeStorage("localStorage", LANGUAGE_KEY, next);
        }
      },
      onHideSession: () => writeStorage("sessionStorage", SESSION_HIDE_KEY, "1"),
      onRevealSession: () => writeStorage("sessionStorage", SESSION_HIDE_KEY, null),
    },
  );

  activePanel = panel;
  document.body.appendChild(panel.host);
  applyAll();
  if (previous?.open) panel.open();
  if (!previous) track(store.config, "widget_init");

  if (store.config.language && !document.documentElement.lang) {
    document.documentElement.lang = store.config.language;
  }
}

function attachPathWatcher(): void {
  if (pathWatcherAttached) return;
  pathWatcherAttached = true;

  const reevaluate = () => {
    if (!lastConfig) return;
    if (!shouldMount(lastConfig)) {
      teardown();
    } else if (!document.getElementById("a11y-platform-root")) {
      mountWidget(lastConfig);
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
    mountWidget(merged, { preserve: true });
  });
}

export async function initAccessibilityWidget(userConfig?: Partial<WidgetConfig>): Promise<void> {
  attachPathWatcher();
  attachPreviewListener();

  if (document.getElementById("a11y-platform-root") && !window.__MUNEER_PREVIEW__) return;

  const boot = mergeWidgetConfig({
    ...scriptConfig(),
    ...(window.ACCESSIBILITY_WIDGET_CONFIG ?? {}),
    ...(userConfig ?? {}),
  });
  if (!boot.siteKey || !boot.apiBaseUrl) {
    mountWidget(boot);
    return;
  }

  // Render straight from cache, then let the network result correct or remove it. With no cache and
  // no answer the widget stays off: a config it cannot verify could be a killed or unlicensed site.
  const cached = readCachedConfig(boot.siteKey);
  if (cached) mountWidget(mergeWidgetConfig({ ...boot, ...cached }));

  const remote = await fetchRemoteConfig(boot.siteKey, boot.apiBaseUrl);
  if (remote.status === "denied") {
    writeStorage("localStorage", CONFIG_CACHE_KEY, null);
    lastConfig = null;
    teardown();
  } else if (remote.status === "ok") {
    writeCachedConfig(boot.siteKey, remote.config);
    if (JSON.stringify(remote.config) !== JSON.stringify(cached)) {
      mountWidget(mergeWidgetConfig({ ...boot, ...remote.config }), { preserve: true });
    }
  }
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
