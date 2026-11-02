import { createHash, randomBytes } from "node:crypto";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { z } from "zod";
import {
  checkPrimaryContrast,
  mergeWidgetConfig,
  widgetConfigSchema,
} from "@a11y/core";
import { prisma } from "./db.js";
import {
  assertSiteAccess,
  canWrite,
  clearSessionCookie,
  createSessionToken,
  readRequestToken,
  readSessionUser,
  requireAuth,
  setSessionCookie,
  verifyPassword,
  verifyPasswordOrWaste,
  type AppVariables,
} from "./auth.js";
import { normalizeDomain, originAllowed } from "./domains.js";
import { clientIp, clientKey, rateLimit } from "./rate-limit.js";
import { scanTargetError } from "./scan-target.js";

const app = new Hono<{ Variables: AppVariables }>();

const dashboardOrigins = (
  process.env.DASHBOARD_ORIGIN || "http://127.0.0.1:3000,http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  "/v1/config/*",
  cors({ origin: "*", allowMethods: ["GET", "OPTIONS"] }),
);
app.use(
  "/v1/events",
  cors({ origin: "*", allowMethods: ["POST", "OPTIONS"] }),
);
app.use(
  "*",
  cors({
    origin: (origin) => (dashboardOrigins.includes(origin) ? origin : null),
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use("*", secureHeaders({ crossOriginResourcePolicy: "cross-origin" }));
app.use("*", bodyLimit({ maxSize: 1024 * 1024 }));

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  if (err instanceof z.ZodError) {
    return c.json({ error: "Invalid request", details: err.flatten() }, 400);
  }
  if (err instanceof SyntaxError) {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  console.error(err);
  return c.json({ error: "Internal error" }, 500);
});

app.get("/health", (c) => c.json({ ok: true }));

function parseConfigJson(raw: string | null | undefined) {
  if (!raw) return mergeWidgetConfig();
  try {
    return mergeWidgetConfig(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return mergeWidgetConfig();
  }
}

/** A license counts only while active and unexpired. */
function activeLicense<T extends { status: string; expiresAt: Date | null }>(licenses: T[]): T | undefined {
  const now = Date.now();
  return licenses.find(
    (l) => l.status === "active" && (!l.expiresAt || l.expiresAt.getTime() > now),
  );
}

app.get("/v1/config/:siteKey", async (c) => {
  const siteKey = c.req.param("siteKey");
  if (!rateLimit(clientKey(clientIp(c), "config"), 120, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const site = await prisma.site.findUnique({
    where: { siteKey },
    include: { config: true, organization: { include: { licenses: true } } },
  });
  if (!site) return c.json({ error: "Site not found" }, 404);

  const license = activeLicense(site.organization.licenses);
  if (!license) return c.json({ error: "No active license" }, 403);

  const origin = c.req.header("origin") || c.req.header("referer") || "";
  if (!originAllowed(origin, site.domain, license.domains)) {
    return c.json({ error: "Domain not allowed" }, 403);
  }

  const config = parseConfigJson(site.config?.json);
  const body = { ...config, siteKey: site.siteKey };
  const etag = `"${createHash("sha1").update(JSON.stringify(body)).digest("hex")}"`;
  const inm = c.req.header("if-none-match");
  if (inm === etag) return c.body(null, 304);
  c.header("ETag", etag);
  c.header("Cache-Control", "public, max-age=30");
  return c.json(body);
});

const eventsSchema = z.object({
  events: z
    .array(
      z.object({
        siteKey: z.string().max(128),
        event: z.enum(["widget_init", "feature_toggle", "reset"]),
        featureId: z.string().max(64).optional(),
        timestamp: z.string().max(40).optional(),
        path: z.string().max(512).optional(),
      }),
    )
    .max(50),
});

app.post("/v1/events", bodyLimit({ maxSize: 64 * 1024 }), async (c) => {
  if (!rateLimit(clientKey(clientIp(c), "events"), 60, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const body = eventsSchema.parse(await c.req.json());
  const siteKeys = [...new Set(body.events.map((ev) => ev.siteKey))];
  const sites = await prisma.site.findMany({
    where: { siteKey: { in: siteKeys } },
    include: { organization: { include: { licenses: true } } },
  });

  const origin = c.req.header("origin") || c.req.header("referer") || "";
  const siteIds = new Map<string, string>();
  for (const site of sites) {
    const license = activeLicense(site.organization.licenses);
    if (license && originAllowed(origin, site.domain, license.domains)) {
      siteIds.set(site.siteKey, site.id);
    }
  }

  const rows = body.events.flatMap((ev) => {
    const siteId = siteIds.get(ev.siteKey);
    return siteId ? [{ siteId, event: ev.event, featureId: ev.featureId, path: ev.path }] : [];
  });
  if (rows.length) await prisma.usageEvent.createMany({ data: rows });
  return c.json({ accepted: rows.length });
});

app.post("/v1/auth/login", async (c) => {
  if (!rateLimit(clientKey(clientIp(c), "login"), 10, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }
  const body = z
    .object({ email: z.string().max(254).email(), password: z.string().min(1).max(256) })
    .parse(await c.req.json());
  const email = body.email.toLowerCase();
  if (!rateLimit(clientKey(email, "login-account"), 20, 5 * 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = user
    ? await verifyPassword(body.password, user.passwordHash)
    : await verifyPasswordOrWaste(body.password);
  if (!user || !passwordOk) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const authUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    name: user.name,
  };
  const token = await createSessionToken(authUser, user.tokenVersion);
  setSessionCookie(c, token);
  return c.json({ user: authUser, token });
});

app.post("/v1/auth/logout", async (c) => {
  const session = await readSessionUser(readRequestToken(c));
  if (session) {
    // Bumping the version revokes every token issued to this user so far.
    await prisma.user.updateMany({
      where: { id: session.id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
  clearSessionCookie(c);
  return c.json({ ok: true });
});

app.get("/v1/auth/me", requireAuth, async (c) => {
  return c.json({ user: c.get("user") });
});

app.use("/v1/sites/*", requireAuth);
app.use("/v1/sites", requireAuth);
app.use("/v1/licenses", requireAuth);
app.use("/v1/scans", requireAuth);
app.use("/v1/scans/*", requireAuth);
app.use("/v1/users", requireAuth);

app.get("/v1/sites", async (c) => {
  const user = c.get("user");
  const sites = await prisma.site.findMany({
    where: { organizationId: user.organizationId },
    include: { config: true, _count: { select: { events: true, scans: true } } },
  });
  return c.json(sites);
});

app.get("/v1/sites/:id", async (c) => {
  const user = c.get("user");
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);
  const full = await prisma.site.findUnique({
    where: { id: site.id },
    include: { config: true, _count: { select: { events: true, scans: true } } },
  });
  return c.json(full);
});

app.post("/v1/sites", requireAuth, async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);

  const body = z
    .object({
      name: z.string().trim().min(1).max(120),
      domain: z.string().min(1).max(253),
    })
    .parse(await c.req.json());
  const domain = normalizeDomain(body.domain);
  if (!domain) return c.json({ error: "Invalid domain" }, 400);

  const initial = mergeWidgetConfig({ language: "ar" });
  const site = await prisma.site.create({
    data: {
      name: body.name,
      domain,
      siteKey: `sk_${randomBytes(12).toString("hex")}`,
      organizationId: user.organizationId,
      config: {
        create: {
          json: JSON.stringify(initial),
          draftJson: JSON.stringify(initial),
        },
      },
    },
    include: { config: true },
  });
  return c.json(site, 201);
});

app.get("/v1/sites/:id/config/draft", async (c) => {
  const user = c.get("user");
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);
  const config = await prisma.widgetConfig.findUnique({ where: { siteId: site.id } });
  const draft = parseConfigJson(config?.draftJson || config?.json);
  const published = parseConfigJson(config?.json);
  return c.json({
    draft,
    published,
    publishedVersionId: config?.publishedVersionId ?? null,
    dirty: JSON.stringify(draft) !== JSON.stringify(published),
  });
});

app.put("/v1/sites/:id/config/draft", async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);

  const raw = await c.req.json();
  const parsed = widgetConfigSchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: "Invalid config", details: parsed.error.flatten() }, 400);

  const draft = mergeWidgetConfig(parsed.data);
  const contrast = checkPrimaryContrast(draft.colors);
  if (!contrast.passesAa) {
    return c.json({ error: "Contrast check failed", contrast }, 400);
  }

  const config = await prisma.widgetConfig.upsert({
    where: { siteId: site.id },
    create: {
      siteId: site.id,
      json: JSON.stringify(draft),
      draftJson: JSON.stringify(draft),
    },
    update: { draftJson: JSON.stringify(draft) },
  });

  return c.json({ draft, publishedVersionId: config.publishedVersionId, contrast });
});

app.post("/v1/sites/:id/config/publish", async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);

  const body = z.object({ note: z.string().optional() }).safeParse(await c.req.json().catch(() => ({})));
  const note = body.success ? body.data.note : undefined;

  const current = await prisma.widgetConfig.findUnique({ where: { siteId: site.id } });
  if (!current) return c.json({ error: "No config" }, 404);

  const draft = parseConfigJson(current.draftJson);
  const contrast = checkPrimaryContrast(draft.colors);
  if (!contrast.passesAa) {
    return c.json({ error: "Contrast check failed", contrast }, 400);
  }
  const version = await prisma.configVersion.create({
    data: {
      siteId: site.id,
      json: JSON.stringify(draft),
      note,
      createdById: user.id,
    },
  });

  await prisma.widgetConfig.update({
    where: { siteId: site.id },
    data: {
      json: JSON.stringify(draft),
      draftJson: JSON.stringify(draft),
      publishedVersionId: version.id,
    },
  });

  return c.json({ version, published: draft });
});

app.get("/v1/sites/:id/config/versions", async (c) => {
  const user = c.get("user");
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);
  const versions = await prisma.configVersion.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { createdBy: { select: { id: true, email: true, name: true } } },
  });
  return c.json(
    versions.map((v) => ({
      id: v.id,
      note: v.note,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
      config: parseConfigJson(v.json),
    })),
  );
});

app.post("/v1/sites/:id/config/versions/:vid/restore", async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);

  const version = await prisma.configVersion.findFirst({
    where: { id: c.req.param("vid"), siteId: site.id },
  });
  if (!version) return c.json({ error: "Version not found" }, 404);

  const restored = parseConfigJson(version.json);
  await prisma.widgetConfig.upsert({
    where: { siteId: site.id },
    create: {
      siteId: site.id,
      json: JSON.stringify(restored),
      draftJson: JSON.stringify(restored),
    },
    update: { draftJson: JSON.stringify(restored) },
  });

  return c.json({ draft: restored, restoredFrom: version.id });
});

app.post("/v1/sites/:id/config/kill-switch", async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);

  const body = z.object({ enabled: z.boolean() }).parse(await c.req.json());
  const current = await prisma.widgetConfig.findUnique({ where: { siteId: site.id } });
  const published = parseConfigJson(current?.json);
  const draft = parseConfigJson(current?.draftJson || current?.json);
  published.enabled = body.enabled;
  draft.enabled = body.enabled;

  await prisma.widgetConfig.upsert({
    where: { siteId: site.id },
    create: {
      siteId: site.id,
      json: JSON.stringify(published),
      draftJson: JSON.stringify(draft),
    },
    update: {
      json: JSON.stringify(published),
      draftJson: JSON.stringify(draft),
    },
  });

  return c.json({ enabled: body.enabled, published, draft });
});

app.get("/v1/sites/:id/analytics", async (c) => {
  const user = c.get("user");
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);
  const events = await prisma.usageEvent.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const byEvent: Record<string, number> = {};
  const byFeature: Record<string, number> = {};
  for (const e of events) {
    byEvent[e.event] = (byEvent[e.event] || 0) + 1;
    if (e.featureId) byFeature[e.featureId] = (byFeature[e.featureId] || 0) + 1;
  }
  return c.json({ total: events.length, byEvent, byFeature, recent: events.slice(0, 20) });
});

app.get("/v1/licenses", async (c) => {
  const user = c.get("user");
  const licenses = await prisma.license.findMany({
    where: { organizationId: user.organizationId },
    include: { organization: true },
  });
  return c.json(licenses);
});

app.get("/v1/scans", async (c) => {
  const user = c.get("user");
  const scans = await prisma.scanReport.findMany({
    where: { site: { organizationId: user.organizationId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { site: true },
  });
  return c.json(scans);
});

app.post("/v1/scans", async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);
  if (!rateLimit(clientKey(clientIp(c), "scans"), 5, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const body = z
    .object({ siteId: z.string(), url: z.string().max(2048) })
    .parse(await c.req.json());

  const site = await assertSiteAccess(user, body.siteId);
  if (!site) return c.json({ error: "Not found" }, 404);

  const refused = await scanTargetError(body.url, site.domain);
  if (refused) return c.json({ error: refused }, 400);

  const { scanUrl } = await import("@a11y/scanner");
  let report;
  try {
    report = await scanUrl(body.url, {
      isAllowed: async (url) => !(await scanTargetError(url, site.domain)),
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Scan target unreachable" }, 422);
  }
  const saved = await prisma.scanReport.create({
    data: {
      siteId: body.siteId,
      url: report.url,
      score: report.score,
      json: JSON.stringify(report),
    },
  });
  return c.json({ id: saved.id, ...report }, 201);
});

app.get("/v1/users", async (c) => {
  const user = c.get("user");
  const users = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    include: { organization: true },
  });
  return c.json(users.map(({ passwordHash: _, ...u }) => u));
});

export default app;
