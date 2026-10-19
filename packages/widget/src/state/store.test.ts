import { describe, expect, it, beforeEach } from "vitest";
import { AccessibilityStore } from "./store.js";

describe("AccessibilityStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sets and resets features", () => {
    const store = new AccessibilityStore({ language: "ar" });
    store.set("bigger-text", "large");
    expect(store.get("bigger-text")).toBe("large");
    store.reset();
    expect(store.get("bigger-text")).toBeNull();
  });

  it("persists to localStorage", () => {
    const a = new AccessibilityStore();
    a.set("hide-images", true);
    const b = new AccessibilityStore();
    expect(b.get("hide-images")).toBe(true);
  });

  it("skips persistence when persistPreferences is false", () => {
    const a = new AccessibilityStore({ persistPreferences: false });
    a.set("bigger-text", "large");
    expect(localStorage.getItem("a11y-platform-state-v1")).toBeNull();
  });

  it("applies defaultLevel from feature config when empty", () => {
    const store = new AccessibilityStore({
      features: [
        {
          id: "bigger-text",
          enabled: true,
          order: 0,
          defaultLevel: "medium",
        },
      ],
    });
    expect(store.get("bigger-text")).toBe("medium");
  });
});
