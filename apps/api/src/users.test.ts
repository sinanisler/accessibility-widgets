import { describe, expect, it } from "vitest";
import { canAssignRole, memberChangeError, PASSWORD_MIN_LENGTH, temporaryPassword } from "./users.js";

const owner = { id: "o", role: "owner" };
const admin = { id: "a", role: "admin" };
const viewer = { id: "v", role: "viewer" };

describe("canAssignRole", () => {
  it("lets owners grant any role and admins only admin or viewer", () => {
    expect(canAssignRole("owner", "owner")).toBe(true);
    expect(canAssignRole("admin", "owner")).toBe(false);
    expect(canAssignRole("admin", "viewer")).toBe(true);
    expect(canAssignRole("viewer", "viewer")).toBe(false);
    expect(canAssignRole("owner", "root")).toBe(false);
  });
});

describe("memberChangeError", () => {
  it("blocks self edits and admins touching owners", () => {
    expect(memberChangeError(owner, owner, "admin", 2)).toBeTruthy();
    expect(memberChangeError(admin, { id: "o2", role: "owner" }, null, 2)).toBe("Forbidden");
  });

  it("keeps at least one owner", () => {
    const other = { id: "o2", role: "owner" };
    expect(memberChangeError(owner, other, "admin", 1)).toBe("Organisation needs an owner");
    expect(memberChangeError(owner, other, null, 1)).toBe("Organisation needs an owner");
    expect(memberChangeError(owner, other, "admin", 2)).toBeNull();
  });

  it("allows admins to manage viewers and refuses viewers", () => {
    expect(memberChangeError(admin, viewer, "admin", 1)).toBeNull();
    expect(memberChangeError(admin, viewer, null, 1)).toBeNull();
    expect(memberChangeError(viewer, admin, null, 1)).toBe("Forbidden");
  });
});

describe("temporaryPassword", () => {
  it("meets the minimum length and differs each time", () => {
    const a = temporaryPassword();
    expect(a.length).toBeGreaterThanOrEqual(PASSWORD_MIN_LENGTH);
    expect(a).not.toBe(temporaryPassword());
  });
});
