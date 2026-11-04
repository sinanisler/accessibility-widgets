import { describe, expect, it } from "vitest";
import { normalizeDomain, originAllowed } from "./domains.js";
import { isPublicAddress, isPublicHost } from "./scan-target.js";

describe("normalizeDomain", () => {
  it("reduces URLs and case to a bare domain", () => {
    expect(normalizeDomain("https://Example.com/path")).toBe("example.com");
    expect(normalizeDomain(" EXAMPLE.com ")).toBe("example.com");
  });

  it("rejects values that are not domains", () => {
    expect(normalizeDomain("not a domain !!")).toBeNull();
    expect(normalizeDomain("   ")).toBeNull();
    expect(normalizeDomain("example")).toBeNull();
  });
});

describe("originAllowed", () => {
  it("allows the site's domain and subdomains", () => {
    expect(originAllowed("https://www.real.com", "https://real.com", "other.com")).toBe(true);
    expect(originAllowed("https://evilreal.com", "real.com", "other.com")).toBe(false);
  });

  it("uses the license's domain list", () => {
    expect(originAllowed("https://other.com", "real.com", "other.com, third.com")).toBe(true);
    expect(originAllowed("https://third.com", "real.com", "other.com, third.com")).toBe(true);
    expect(originAllowed("https://fourth.com", "real.com", "other.com, third.com")).toBe(false);
  });
});

describe("scan target checks", () => {
  it("classifies private and public addresses", () => {
    for (const ip of ["127.0.0.1", "10.0.0.1", "169.254.169.254", "::1", "::ffff:127.0.0.1", "fd00::1"]) {
      expect(isPublicAddress(ip)).toBe(false);
    }
    expect(isPublicAddress("8.8.8.8")).toBe(true);
  });

  it("refuses loopback hostnames in every spelling", async () => {
    for (const host of ["localhost", "localhost.", "foo.localhost", "[::1]", "127.0.0.1"]) {
      expect(await isPublicHost(host)).toBe(false);
    }
  });
});
