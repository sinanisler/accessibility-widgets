import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { hostMatchesDomain } from "./domains.js";

const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(network, prefix, "ipv6");
}

export function isPublicAddress(address: string): boolean {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)?.[1];
  const ip = mapped ?? address;
  const family = isIP(ip);
  if (!family) return false;
  return !blocked.check(ip, family === 4 ? "ipv4" : "ipv6");
}

/** Resolves the host, so names that point at private addresses are refused too. */
export async function isPublicHost(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (isIP(host)) return isPublicAddress(host);
  try {
    const addresses = await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every((a) => isPublicAddress(a.address));
  } catch {
    return false;
  }
}

/** Returns why a URL may not be scanned for this site, or null when it may. */
export async function scanTargetError(rawUrl: string, siteDomain: string): Promise<string | null> {
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return "Invalid URL";
  }
  if (!["http:", "https:"].includes(target.protocol)) return "Invalid URL";
  if (process.env.NODE_ENV !== "production") return null;
  if (!hostMatchesDomain(target.hostname, siteDomain)) return "URL is outside the site domain";
  if (!(await isPublicHost(target.hostname))) return "Internal hosts are not allowed";
  return null;
}
