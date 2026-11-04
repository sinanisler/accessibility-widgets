import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";
import { createSessionToken, readSessionUser } from "./auth.js";
import { rateLimit } from "./rate-limit.js";

describe("password hashing", () => {
  it("hashes and verifies", async () => {
    const hashed = await hashPassword("admin123");
    expect(hashed).not.toBe("admin123");
    expect(await verifyPassword("admin123", hashed)).toBe(true);
    expect(await verifyPassword("wrong", hashed)).toBe(false);
  });
});

describe("session jwt", () => {
  it("round-trips user claims", async () => {
    const token = await createSessionToken({
      id: "u1",
      email: "a@b.com",
      role: "admin",
      organizationId: "o1",
      name: "Ali",
    });
    const user = await readSessionUser(token);
    expect(user?.email).toBe("a@b.com");
    expect(user?.role).toBe("admin");
    expect(await readSessionUser("bad")).toBeNull();
  });
});

describe("rateLimit", () => {
  it("blocks after limit", () => {
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });
});
