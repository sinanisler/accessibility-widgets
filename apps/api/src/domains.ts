const DOMAIN_PATTERN = /^(?:localhost|[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)$/;

/** Reduce user input such as `https://Example.com/path` to `example.com`; null when it is not a domain. */
export function normalizeDomain(input: string): string | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  let host: string;
  try {
    host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
  } catch {
    return null;
  }
  host = host.replace(/\.$/, "");
  if (!DOMAIN_PATTERN.test(host)) return null;
  if (host === "localhost" && process.env.NODE_ENV === "production") return null;
  return host;
}

export function hostMatchesDomain(host: string, domain: string): boolean {
  const normalized = normalizeDomain(domain) ?? domain.toLowerCase();
  const candidate = host.toLowerCase().replace(/\.$/, "");
  return candidate === normalized || candidate.endsWith(`.${normalized}`);
}

/** `licenseDomains` is `*` or a comma-separated list; the site's own domain is always included. */
export function originAllowed(origin: string, siteDomain: string, licenseDomains: string): boolean {
  if (licenseDomains.trim() === "*") return true;
  if (!origin) return true;
  let host: string;
  try {
    host = new URL(origin).hostname;
  } catch {
    return false;
  }
  const local = process.env.NODE_ENV !== "production" && siteDomain === "localhost";
  if (local && host === "127.0.0.1") return true;
  return [siteDomain, ...licenseDomains.split(",")]
    .map((d) => d.trim())
    .filter(Boolean)
    .some((d) => hostMatchesDomain(host, d));
}
