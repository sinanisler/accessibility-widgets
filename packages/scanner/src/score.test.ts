import { describe, expect, it } from "vitest";
import { scoreFromIssues } from "./score.js";
import type { ScanIssue } from "./types.js";

describe("scoreFromIssues", () => {
  it("returns 100 for no issues", () => {
    expect(scoreFromIssues([])).toBe(100);
  });

  it("penalizes critical issues", () => {
    const issues: ScanIssue[] = [
      {
        id: "1",
        ruleId: "x",
        impact: "critical",
        message: "m",
        source: "axe",
      },
    ];
    expect(scoreFromIssues(issues)).toBe(85);
  });
});
