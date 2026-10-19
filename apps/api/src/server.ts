import { createHash, randomBytes } from "node:crypto";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  checkPrimaryContrast,
  mergeWidgetConfig,
  widgetConfigSchema,
} from "@a11y/core";
import { ensureSeed, prisma } from "./db.js";
import {
  assertSiteAccess,
  canWrite,
  clearSessionCookie,
  createSessionToken,
  requireAuth,
  setSessionCookie,
  verifyPassword,
  type AppVariables,
} from "./auth.js";
import { clientKey, rateLimit } from "./rate-limit.js";

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

app.onError((err, c) => {
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

function hostAllowed(originOrReferer: string, domain: string, licenseDomains: string): boolean {
  if (licenseDomains === "*") return true;
  if (!originOrReferer) return true;
  try {
    const host = new URL(originOrReferer).hostname;
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

app.get("/v1/config/:siteKey", async (c) => {
  const siteKey = c.req.param("siteKey");
  const ip = c.req.header("x-forwarded-for") || "local";
  if (!rateLimit(clientKey(ip, "config"), 120, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const site = await prisma.site.findUnique({
    where: { siteKey },
    include: { config: true, organization: { include: { licenses: true } } },
  });
  if (!site) return c.json({ error: "Site not found" }, 404);

  const license = site.organization.licenses.find((l) => l.status === "active");
  if (!license) return c.json({ error: "No active license" }, 403);

  const host = c.req.header("origin") || c.req.header("referer") || "";
  if (host && !hostAllowed(host, site.domain, license.domains)) {
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
        siteKey: z.string(),
        event: z.string(),
        featureId: z.string().optional(),
        timestamp: z.string().optional(),
        path: z.string().optional(),
      }),
    )
    .max(50),
});

app.post("/v1/events", async (c) => {
  const ip = c.req.header("x-forwarded-for") || "local";
  if (!rateLimit(clientKey(ip, "events"), 60, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const body = eventsSchema.parse(await c.req.json());
  for (const ev of body.events) {
    const site = await prisma.site.findUnique({
      where: { siteKey: ev.siteKey },
      include: { organization: { include: { licenses: true } } },
    });
    if (!site) continue;
    const license = site.organization.licenses.find((l) => l.status === "active");
    const host = c.req.header("origin") || c.req.header("referer") || "";
    if (license && host && !hostAllowed(host, site.domain, license.domains)) continue;
    await prisma.usageEvent.create({
      data: {
        siteId: site.id,
        event: ev.event,
        featureId: ev.featureId,
        path: ev.path,
      },
    });
  }
  return c.json({ accepted: body.events.length });
});

app.post("/v1/auth/login", async (c) => {
  const ip = c.req.header("x-forwarded-for") || "local";
  if (!rateLimit(clientKey(ip, "login"), 10, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }
  const body = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .parse(await c.req.json());

  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const authUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    name: user.name,
  };
  const token = await createSessionToken(authUser);
  setSessionCookie(c, token);
  return c.json({ user: authUser, token });
});

app.post("/v1/auth/logout", async (c) => {
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
      name: z.string().min(1),
      domain: z.string().min(1),
    })
    .parse(await c.req.json());

  const initial = mergeWidgetConfig({ language: "ar" });
  const site = await prisma.site.create({
    data: {
      name: body.name,
      domain: body.domain,
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

/** Legacy alias — updates draft only for write roles. */
app.put("/v1/sites/:id/config", async (c) => {
  const user = c.get("user");
  if (!canWrite(user.role)) return c.json({ error: "Forbidden" }, 403);
  const site = await assertSiteAccess(user, c.req.param("id"));
  if (!site) return c.json({ error: "Not found" }, 404);

  const raw = await c.req.json();
  const parsed = widgetConfigSchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: "Invalid config", details: parsed.error.flatten() }, 400);
  const draft = mergeWidgetConfig(parsed.data);

  const config = await prisma.widgetConfig.upsert({
    where: { siteId: site.id },
    create: { siteId: site.id, json: JSON.stringify(draft), draftJson: JSON.stringify(draft) },
    update: { draftJson: JSON.stringify(draft) },
  });
  return c.json(config);
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
  const ip = c.req.header("x-forwarded-for") || "local";
  if (!rateLimit(clientKey(ip, "scans"), 5, 60_000)) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const body = z
    .object({ siteId: z.string(), url: z.string().url() })
    .parse(await c.req.json());

  const site = await assertSiteAccess(user, body.siteId);
  if (!site) return c.json({ error: "Not found" }, 404);

  let target: URL;
  try {
    target = new URL(body.url);
  } catch {
    return c.json({ error: "Invalid URL" }, 400);
  }
  if (!["http:", "https:"].includes(target.protocol)) {
    return c.json({ error: "Invalid protocol" }, 400);
  }
  const host = target.hostname;
  if (
    host === "localhost" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0" ||
    host.startsWith("[") ||
    host.endsWith(".local")
  ) {
    // Allow localhost only for the site's own domain in development
    if (site.domain !== "localhost" && process.env.NODE_ENV === "production") {
      return c.json({ error: "Internal hosts are not allowed" }, 400);
    }
  }

  const { scanUrl } = await import("@a11y/scanner");
  const report = await scanUrl(body.url);
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

const port = Number(process.env.PORT || 8787);

await ensureSeed();
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});

export default app;
