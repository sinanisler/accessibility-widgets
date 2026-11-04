export type SiteSummary = {
  id: string;
  name: string;
  domain: string;
  siteKey: string;
  config?: { json: string; draftJson?: string | null } | null;
  _count?: { events: number; scans: number };
};

export type ScanSummary = {
  id: string;
  url: string;
  score: number;
  createdAt: string;
  site: { id: string; name: string };
};

export type SiteStatus = {
  /** The widget has reported at least one event, which only happens once the script is on the site. */
  installed: boolean;
  paused: boolean;
  unpublished: boolean;
};

export function siteStatus(site: SiteSummary): SiteStatus {
  let paused = false;
  try {
    paused = JSON.parse(site.config?.json || "{}").enabled === false;
  } catch {
    /* treat unreadable configs as live */
  }
  return {
    installed: (site._count?.events ?? 0) > 0,
    paused,
    unpublished: Boolean(site.config?.draftJson && site.config.draftJson !== site.config.json),
  };
}

export function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 90) return "success";
  if (score >= 70) return "warning";
  return "danger";
}

export const numberFormat = new Intl.NumberFormat("ar-SA-u-nu-latn");
