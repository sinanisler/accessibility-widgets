import type { Context } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";

type Bucket = { count: number; resetAt: number };

const MAX_BUCKETS = 50_000;
const buckets = new Map<string, Bucket>();

function evictExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) evictExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientKey(ip: string | undefined, suffix: string): string {
  return `${ip || "unknown"}:${suffix}`;
}

/**
 * X-Forwarded-For is client-controlled, so it only counts behind a proxy we run (TRUST_PROXY=1),
 * and then only its last hop, which that proxy appended.
 */
export function clientIp(c: Context): string {
  if (process.env.TRUST_PROXY === "1") {
    const hops = c.req.header("x-forwarded-for")?.split(",");
    const last = hops?.[hops.length - 1]?.trim();
    if (last) return last;
  }
  try {
    return getConnInfo(c).remote.address ?? "unknown";
  } catch {
    return "unknown";
  }
}
