import type { UsageEvent, WidgetConfig } from "@a11y/core";

const queue: UsageEvent[] = [];
const MAX_BATCH = 50;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let activeConfig: WidgetConfig | null = null;
let pageHideAttached = false;

export function track(config: WidgetConfig, event: string, featureId?: string): void {
  if (!config.enableAnalytics || !config.siteKey || !config.apiBaseUrl) return;
  activeConfig = config;
  if (!pageHideAttached) {
    pageHideAttached = true;
    window.addEventListener("pagehide", () => void flush());
  }
  queue.push({
    siteKey: config.siteKey,
    event,
    featureId,
    timestamp: new Date().toISOString(),
    path: typeof location !== "undefined" ? location.pathname : undefined,
  });
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flush();
    }, 2000);
  }
}

async function flush(): Promise<void> {
  if (!queue.length || !activeConfig?.apiBaseUrl) return;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    await fetch(`${activeConfig.apiBaseUrl.replace(/\/$/, "")}/v1/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
      mode: "cors",
    });
  } catch {
    /* swallow analytics errors */
  }
}
