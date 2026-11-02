import { describe, expect, it } from "vitest";
import type { ScanIssue } from "./types.js";

function scoreFromIssues(issues: ScanIssue[]): number {
  const weights = { critical: 15, serious: 8, moderate: 3, minor: 1 } as const;
  const penalty = issues.reduce((sum, i) => sum + weights[i.impact], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

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
