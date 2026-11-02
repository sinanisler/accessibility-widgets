import type { ScanIssue, Severity } from "./types.js";

export function scoreFromIssues(issues: ScanIssue[]): number {
  const weights: Record<Severity, number> = {
    critical: 15,
    serious: 8,
    moderate: 3,
    minor: 1,
  };
  const penalty = issues.reduce((sum, i) => sum + (weights[i.impact] ?? 1), 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}
