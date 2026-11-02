import { SignJWT, jwtVerify } from "jose";
import type { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { prisma } from "./db.js";
export { hashPassword, verifyPassword } from "./password.js";

const COOKIE_NAME = "muneer_session";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-muneer-secret-change-me",
);

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  name: string | null;
};

export type AppVariables = {
  user: AuthUser;
};

export async function createSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function readSessionUser(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      role: String(payload.role || "viewer"),
      organizationId: String(payload.organizationId || ""),
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}

export async function requireAuth(c: Context<{ Variables: AppVariables }>, next: Next) {
  const token =
    getCookie(c, COOKIE_NAME) ||
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const user = token ? await readSessionUser(token) : null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", user);
  await next();
}

export function requireRole(...roles: string[]) {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
}

export async function assertSiteAccess(
  user: AuthUser,
  siteId: string,
): Promise<{ id: string; organizationId: string; domain: string; siteKey: string; name: string } | null> {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return null;
  if (site.organizationId !== user.organizationId) return null;
  return site;
}

export function canWrite(role: string): boolean {
  return role === "owner" || role === "admin";
}
