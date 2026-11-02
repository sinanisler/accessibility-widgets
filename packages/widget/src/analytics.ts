import type { UsageEvent, WidgetConfig } from "@a11y/core";

const queue: UsageEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function track(config: WidgetConfig, event: string, featureId?: string): void {
  if (!config.enableAnalytics || !config.siteKey || !config.apiBaseUrl) return;
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
      void flush(config);
    }, 2000);
  }
}

async function flush(config: WidgetConfig): Promise<void> {
  if (!queue.length || !config.apiBaseUrl) return;
  const batch = queue.splice(0, queue.length);
  try {
    await fetch(`${config.apiBaseUrl.replace(/\/$/, "")}/v1/events`, {
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
